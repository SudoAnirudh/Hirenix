import base64
import json
import logging
import asyncio
from typing import Iterator, Optional, Dict, Any, List, Tuple, Sequence

from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.base import BaseCheckpointSaver, Checkpoint, CheckpointMetadata, CheckpointTuple
from supabase import Client

logger = logging.getLogger(__name__)

class SupabaseSaver(BaseCheckpointSaver):
    """
    A custom LangGraph Checkpoint Saver that persists agent states in a Supabase database.
    This avoids requiring a raw PostgreSQL connection string by using the standard Supabase client.
    """
    def __init__(self, supabase_client: Client):
        super().__init__()
        self.client = supabase_client

    def _dump(self, obj: Any) -> str:
        """Serialize object to JSON or string representation and base64 encode it for safety."""
        try:
            data_bytes = self.serde.dumps(obj)
            if isinstance(data_bytes, str):
                data_bytes = data_bytes.encode("utf-8")
            return base64.b64encode(data_bytes).decode("utf-8")
        except Exception as e:
            logger.error(f"Error serializing checkpoint data: {e}")
            raise

    def _load(self, s: str) -> Any:
        """Decode base64 and deserialize object back into Python memory."""
        try:
            data_bytes = base64.b64decode(s.encode("utf-8"))
            return self.serde.loads(data_bytes)
        except Exception as e:
            logger.error(f"Error deserializing checkpoint data: {e}")
            raise

    def get_tuple(self, config: RunnableConfig) -> Optional[CheckpointTuple]:
        """Fetch a specific checkpoint or the latest checkpoint for a given thread."""
        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = config["configurable"].get("checkpoint_id")

        try:
            if checkpoint_id:
                res = self.client.table("agent_checkpoints") \
                    .select("*") \
                    .eq("thread_id", thread_id) \
                    .eq("checkpoint_ns", checkpoint_ns) \
                    .eq("checkpoint_id", checkpoint_id) \
                    .execute()
            else:
                res = self.client.table("agent_checkpoints") \
                    .select("*") \
                    .eq("thread_id", thread_id) \
                    .eq("checkpoint_ns", checkpoint_ns) \
                    .order("created_at", desc=True) \
                    .limit(1) \
                    .execute()

            if not res.data:
                return None

            row = res.data[0]
            checkpoint = self._load(row["checkpoint"])
            metadata = self._load(row["metadata"])
            
            # Reconstruct parent config if exists
            parent_config = None
            if row.get("parent_checkpoint_id"):
                parent_config = {
                    "configurable": {
                        "thread_id": thread_id,
                        "checkpoint_ns": checkpoint_ns,
                        "checkpoint_id": row["parent_checkpoint_id"],
                    }
                }

            # Fetch any pending writes
            writes_res = self.client.table("agent_checkpoint_writes") \
                .select("*") \
                .eq("thread_id", thread_id) \
                .eq("checkpoint_ns", checkpoint_ns) \
                .eq("checkpoint_id", row["checkpoint_id"]) \
                .order("idx", desc=False) \
                .execute()

            pending_writes = []
            if writes_res.data:
                for w in writes_res.data:
                    pending_writes.append((
                        w["task_id"],
                        w["channel"],
                        self._load(w["value"])
                    ))

            return CheckpointTuple(
                config={
                    "configurable": {
                        "thread_id": thread_id,
                        "checkpoint_ns": checkpoint_ns,
                        "checkpoint_id": row["checkpoint_id"],
                    }
                },
                checkpoint=checkpoint,
                metadata=metadata,
                parent_config=parent_config,
                pending_writes=pending_writes
            )
        except Exception as e:
            logger.error(f"Error fetching checkpoint tuple for thread {thread_id}: {e}")
            return None

    def list(
        self,
        config: Optional[RunnableConfig],
        *,
        filter: Optional[Dict[str, Any]] = None,
        before: Optional[RunnableConfig] = None,
        limit: Optional[int] = None,
    ) -> Iterator[CheckpointTuple]:
        """List checkpoints matching the thread and filter parameters."""
        thread_id = config["configurable"]["thread_id"] if config else None
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "") if config else None

        try:
            query = self.client.table("agent_checkpoints").select("*")
            if thread_id:
                query = query.eq("thread_id", thread_id)
            if checkpoint_ns is not None:
                query = query.eq("checkpoint_ns", checkpoint_ns)

            # Apply key-value filters to metadata if specified
            if filter:
                for k, v in filter.items():
                    query = query.eq(f"metadata->>{k}", str(v))

            # Apply "before" constraint (before specific timestamp/creation)
            if before:
                before_id = before["configurable"].get("checkpoint_id")
                if before_id:
                    before_res = self.client.table("agent_checkpoints") \
                        .select("created_at") \
                        .eq("thread_id", thread_id) \
                        .eq("checkpoint_ns", checkpoint_ns) \
                        .eq("checkpoint_id", before_id) \
                        .execute()
                    if before_res.data:
                        query = query.lt("created_at", before_res.data[0]["created_at"])

            query = query.order("created_at", desc=True)
            if limit:
                query = query.limit(limit)

            res = query.execute()

            for row in res.data:
                checkpoint = self._load(row["checkpoint"])
                metadata = self._load(row["metadata"])
                
                parent_config = None
                if row.get("parent_checkpoint_id"):
                    parent_config = {
                        "configurable": {
                            "thread_id": row["thread_id"],
                            "checkpoint_ns": row["checkpoint_ns"],
                            "checkpoint_id": row["parent_checkpoint_id"],
                        }
                    }

                # Load writes
                writes_res = self.client.table("agent_checkpoint_writes") \
                    .select("*") \
                    .eq("thread_id", row["thread_id"]) \
                    .eq("checkpoint_ns", row["checkpoint_ns"]) \
                    .eq("checkpoint_id", row["checkpoint_id"]) \
                    .order("idx", desc=False) \
                    .execute()

                pending_writes = []
                for w in writes_res.data:
                    pending_writes.append((
                        w["task_id"],
                        w["channel"],
                        self._load(w["value"])
                    ))

                yield CheckpointTuple(
                    config={
                        "configurable": {
                            "thread_id": row["thread_id"],
                            "checkpoint_ns": row["checkpoint_ns"],
                            "checkpoint_id": row["checkpoint_id"],
                        }
                    },
                    checkpoint=checkpoint,
                    metadata=metadata,
                    parent_config=parent_config,
                    pending_writes=pending_writes
                )
        except Exception as e:
            logger.error(f"Error listing checkpoints: {e}")
            return

    def put(
        self,
        config: RunnableConfig,
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: Any,  # ChannelVersions in newer versions
    ) -> RunnableConfig:
        """Upsert a new checkpoint state."""
        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = checkpoint["id"]
        parent_checkpoint_id = config["configurable"].get("checkpoint_id")

        try:
            row = {
                "thread_id": thread_id,
                "checkpoint_ns": checkpoint_ns,
                "checkpoint_id": checkpoint_id,
                "parent_checkpoint_id": parent_checkpoint_id,
                "checkpoint": self._dump(checkpoint),
                "metadata": self._dump(metadata),
            }

            self.client.table("agent_checkpoints").upsert(row).execute()

            return {
                "configurable": {
                    "thread_id": thread_id,
                    "checkpoint_ns": checkpoint_ns,
                    "checkpoint_id": checkpoint_id,
                }
            }
        except Exception as e:
            logger.error(f"Error saving checkpoint for thread {thread_id}: {e}")
            raise

    def put_writes(
        self,
        config: RunnableConfig,
        writes: Sequence[Tuple[str, Any]],
        task_id: str,
    ) -> None:
        """Persist intermediate task writes."""
        thread_id = config["configurable"]["thread_id"]
        checkpoint_ns = config["configurable"].get("checkpoint_ns", "")
        checkpoint_id = config["configurable"]["checkpoint_id"]

        try:
            rows = []
            for idx, (channel, val) in enumerate(writes):
                rows.append({
                    "thread_id": thread_id,
                    "checkpoint_ns": checkpoint_ns,
                    "checkpoint_id": checkpoint_id,
                    "task_id": task_id,
                    "idx": idx,
                    "channel": channel,
                    "value": self._dump(val)
                })

            if rows:
                self.client.table("agent_checkpoint_writes").upsert(rows).execute()
        except Exception as e:
            logger.error(f"Error writing checkpoint writes for thread {thread_id}: {e}")
            raise


async def load_user_context(supabase_client: Client, user_id: str) -> Dict[str, Any]:
    """
    Fetch the user's latest resume, GitHub Production Index, roadmaps, and target job description
    to pre-populate long-term memory state in LangGraph.
    """
    context = {
        "resume_text": None,
        "resume_id": None,
        "ats_score": None,
        "ats_breakdown": None,
        "github_gpi": None,
        "target_role": None,
        "roadmap_data": None,
        "job_description": None
    }

    try:
        # Define callables for concurrent execution
        fetch_resume = lambda: supabase_client.table("resumes") \
            .select("id, raw_text, ats_score, ats_breakdown") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()

        fetch_github = lambda: supabase_client.table("github_analyses") \
            .select("production_index") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()

        fetch_roadmap = lambda: supabase_client.table("roadmaps") \
            .select("target_role, roadmap_data") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()

        fetch_job = lambda: supabase_client.table("job_matches") \
            .select("job_description") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()

        # Execute queries concurrently without blocking the event loop
        resume_res, github_res, roadmap_res, job_res = await asyncio.gather(
            asyncio.to_thread(fetch_resume),
            asyncio.to_thread(fetch_github),
            asyncio.to_thread(fetch_roadmap),
            asyncio.to_thread(fetch_job)
        )

        if resume_res.data:
            r = resume_res.data[0]
            context["resume_id"] = r.get("id")
            context["resume_text"] = r.get("raw_text")
            context["ats_score"] = float(r["ats_score"]) if r.get("ats_score") is not None else None
            context["ats_breakdown"] = r.get("ats_breakdown")

        if github_res.data:
            context["github_gpi"] = float(github_res.data[0]["production_index"]) if github_res.data[0].get("production_index") is not None else None

        if roadmap_res.data:
            context["target_role"] = roadmap_res.data[0].get("target_role")
            context["roadmap_data"] = roadmap_res.data[0].get("roadmap_data")

        if job_res.data:
            context["job_description"] = job_res.data[0].get("job_description")

    except Exception as e:
        logger.warning(f"Failed to load user profile memory for user {user_id}: {e}")

    return context
