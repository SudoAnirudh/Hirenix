import logging
import uuid
from typing import Dict, Any, Optional, Literal
from pydantic import BaseModel

from fastapi import APIRouter, Depends, HTTPException, status
from langchain_core.messages import HumanMessage, AIMessage

from dependencies import get_current_user, get_supabase_admin
from services.agentic.supervisor import get_compiled_graph
from services.agentic.memory import load_user_context

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["agent"])

class ChatRequest(BaseModel):
    message: str
    thread_id: str

class ApproveRequest(BaseModel):
    approval_id: str
    action: Literal["approved", "rejected", "modified"]
    modified_draft: Optional[Dict[str, Any]] = None


@router.post("/chat")
async def chat_with_agent(req: ChatRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Submits a message to the Agentic Supervisor, routing it to the appropriate specialized agents,
    saving history, and capturing approvals.
    """
    user_id = user["user_id"]
    # RLS enforcement constraint: thread_id must start with "user_id:"
    full_thread_id = f"{user_id}:{req.thread_id}"
    
    db = get_supabase_admin()
    graph = get_compiled_graph()
    config = {"configurable": {"thread_id": full_thread_id}}
    
    try:
        # 1. Fetch current graph state
        state = await graph.aget_state(config)
        
        # 2. Hydrate user profile details (resume, gpi, roadmap etc.) if state is empty/new
        if not state.values or not state.values.get("resume_text"):
            logger.info(f"Hydrating new agent thread state for user: {user_id}")
            user_context = await load_user_context(db, user_id)
            await graph.aupdate_state(
                config, 
                {
                    "user_id": user_id,
                    "thread_id": full_thread_id,
                    **user_context
                },
                as_node="supervisor"
            )
            
        # 3. Persist user's message to the conversation log database
        db.table("agent_conversations").insert({
            "user_id": user_id,
            "thread_id": full_thread_id,
            "sender": "user",
            "content": req.message
        }).execute()
        
        # 4. Invoke graph execution with the new message
        state_update = await graph.ainvoke(
            {"messages": [HumanMessage(content=req.message)]},
            config
        )
        
        # 5. Check if HITL approval has been requested
        pending_approval_id = state_update.get("pending_approval_id")
        approval_status = state_update.get("approval_status")
        
        if pending_approval_id and approval_status == "pending":
            approval_type = state_update.get("approval_type")
            approval_draft = state_update.get("approval_draft")
            
            # Save the approval request to supabase
            db.table("agent_approvals").insert({
                "id": pending_approval_id,
                "user_id": user_id,
                "thread_id": full_thread_id,
                "approval_type": approval_type,
                "draft_content": approval_draft,
                "status": "pending"
            }).execute()
            
            logger.info(f"Chat execution paused: Awaiting approval for {approval_type}")
            
        # 6. Extract the final agent message and persist it to conversation logs
        messages = state_update.get("messages", [])
        if messages:
            last_msg = messages[-1]
            sender = getattr(last_msg, "name", "assistant") or "assistant"
            content = last_msg.content
            
            db.table("agent_conversations").insert({
                "user_id": user_id,
                "thread_id": full_thread_id,
                "sender": sender,
                "content": content
            }).execute()
            
            return {
                "message": content,
                "sender": sender,
                "pending_approval": {
                    "id": pending_approval_id,
                    "type": state_update.get("approval_type"),
                    "draft": state_update.get("approval_draft")
                } if pending_approval_id and approval_status == "pending" else None
            }
            
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Agent failed to produce a response."
        )
        
    except Exception as e:
        logger.error(f"Error in agentic chat route: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent execution failed: {str(e)}"
        )


@router.post("/approve")
async def resolve_approval(req: ApproveRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """
    Submits user choice (Approve / Reject / Modify) for a pending draft.
    Updates database status and resumes graph execution.
    """
    user_id = user["user_id"]
    db = get_supabase_admin()
    
    # 1. Verify ownership of the approval task
    query = db.table("agent_approvals") \
        .select("*") \
        .eq("id", req.approval_id) \
        .eq("user_id", user_id) \
        .single() \
        .execute()
        
    if not query.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Approval task not found or unauthorized access."
        )
        
    approval_record = query.data
    full_thread_id = approval_record["thread_id"]
    draft_content = req.modified_draft if req.modified_draft else approval_record["draft_content"]
    
    # 2. Update status in database
    db.table("agent_approvals") \
        .update({
            "status": req.action,
            "draft_content": draft_content,
            "updated_at": "now()"
        }) \
        .eq("id", req.approval_id) \
        .execute()
        
    # 3. Update LangGraph state & resume execution
    graph = get_compiled_graph()
    config = {"configurable": {"thread_id": full_thread_id}}
    
    # Feed decision back to the state and clear pending_approval_id block
    await graph.aupdate_state(config, {
        "approval_status": req.action,
        "approval_draft": draft_content,
        "pending_approval_id": None
    })
    
    # Resume graph execution
    try:
        state_update = await graph.ainvoke(None, config)
        
        messages = state_update.get("messages", [])
        if messages:
            last_msg = messages[-1]
            sender = getattr(last_msg, "name", "assistant") or "assistant"
            content = last_msg.content
            
            # Save the resumed response to conversation logs
            db.table("agent_conversations").insert({
                "user_id": user_id,
                "thread_id": full_thread_id,
                "sender": sender,
                "content": content
            }).execute()
            
            return {
                "message": content,
                "sender": sender,
                "status": "resolved",
                "action": req.action
            }
            
        return {"status": "resolved", "action": req.action}
        
    except Exception as e:
        logger.error(f"Error resuming graph execution: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resuming agent execution failed: {str(e)}"
        )


@router.get("/history")
async def get_chat_history(thread_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieves all conversation records for a given user thread."""
    user_id = user["user_id"]
    full_thread_id = f"{user_id}:{thread_id}"
    db = get_supabase_admin()
    
    res = db.table("agent_conversations") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("thread_id", full_thread_id) \
        .order("created_at", desc=False) \
        .execute()
        
    return res.data


@router.get("/approvals")
async def get_pending_approvals(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieves all pending human-in-the-loop approvals for the active user."""
    user_id = user["user_id"]
    db = get_supabase_admin()
    
    res = db.table("agent_approvals") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("status", "pending") \
        .order("created_at", desc=True) \
        .execute()
        
    return res.data
