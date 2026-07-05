import asyncio
import unittest
from unittest.mock import MagicMock, AsyncMock, patch

from services.agentic.state import AgentState
from services.agentic.supervisor import route_next, supervisor_node, RouterDecision


class TestAgenticGraph(unittest.TestCase):
    """
    Test suite for Hirenix v2 Agentic AI state management and routing.
    """

    def test_route_next_finish(self):
        """Should terminate routing if next_agent is FINISH."""
        state: AgentState = {
            "messages": [],
            "user_id": "test-user-1",
            "thread_id": "test-thread-1",
            "resume_text": None,
            "resume_id": None,
            "job_description": None,
            "target_role": None,
            "ats_score": None,
            "ats_breakdown": None,
            "github_gpi": None,
            "roadmap_data": None,
            "interview_session_id": None,
            "pending_approval_id": None,
            "approval_type": None,
            "approval_draft": None,
            "approval_status": None,
            "next_agent": "FINISH",
            "error_message": None
        }
        res = route_next(state)
        self.assertEqual(res, "__end__")

    def test_route_next_delegate(self):
        """Should route to specialized agent if next_agent is specified."""
        state: AgentState = {
            "messages": [],
            "user_id": "test-user-1",
            "thread_id": "test-thread-1",
            "resume_text": None,
            "resume_id": None,
            "job_description": None,
            "target_role": None,
            "ats_score": None,
            "ats_breakdown": None,
            "github_gpi": None,
            "roadmap_data": None,
            "interview_session_id": None,
            "pending_approval_id": None,
            "approval_type": None,
            "approval_draft": None,
            "approval_status": None,
            "next_agent": "ResumeAgent",
            "error_message": None
        }
        res = route_next(state)
        self.assertEqual(res, "ResumeAgent")

    @patch("services.agentic.supervisor.get_agent_llm")
    def test_supervisor_node_routing(self, mock_get_llm):
        """Should delegate routing decisions to the structured LLM output."""
        mock_llm = MagicMock()
        mock_structured_llm = AsyncMock()
        mock_llm.with_structured_output.return_value = mock_structured_llm
        mock_get_llm.return_value = mock_llm

        # Mock supervisor decision to route to JobAgent
        mock_structured_llm.ainvoke.return_value = RouterDecision(
            next_agent="JobAgent",
            justification="User is asking for job description matching"
        )

        state: AgentState = {
            "messages": [],
            "user_id": "test-user-1",
            "thread_id": "test-thread-1",
            "resume_text": None,
            "resume_id": None,
            "job_description": None,
            "target_role": None,
            "ats_score": None,
            "ats_breakdown": None,
            "github_gpi": None,
            "roadmap_data": None,
            "interview_session_id": None,
            "pending_approval_id": None,
            "approval_type": None,
            "approval_draft": None,
            "approval_status": None,
            "next_agent": None,
            "error_message": None
        }

        # Run async supervisor node
        loop = asyncio.get_event_loop()
        res = loop.run_until_complete(supervisor_node(state))

        self.assertEqual(res["next_agent"], "JobAgent")
        mock_structured_llm.ainvoke.assert_called_once()


if __name__ == "__main__":
    unittest.main()
