from typing import Annotated, Sequence, TypedDict, Dict, Any, List, Optional
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """
    State definition for the Hirenix Agentic AI Career Assistant.
    Maintains the state across the entire LangGraph workflow.
    """
    # 1. Message Thread (Standard LangGraph structure)
    messages: Annotated[Sequence[BaseMessage], add_messages]

    # 2. User & Execution Context
    user_id: str
    thread_id: str
    
    # 3. Active Target & Document Contexts
    resume_text: Optional[str]
    resume_id: Optional[str]
    job_description: Optional[str]
    target_role: Optional[str]

    # 4. Specialized Metrics and Outputs
    ats_score: Optional[float]
    ats_breakdown: Optional[Dict[str, Any]]
    github_gpi: Optional[float]
    roadmap_data: Optional[Dict[str, Any]]
    interview_session_id: Optional[str]

    # 5. Human-in-the-Loop (HITL) parameters
    pending_approval_id: Optional[str]
    approval_type: Optional[str]       # 'resume_modification' | 'resume_tailoring' | 'outreach_draft'
    approval_draft: Optional[Dict[str, Any]] # e.g. {"draft_text": "..."}
    approval_status: Optional[str]     # 'pending' | 'approved' | 'rejected' | 'modified'

    # 6. Routing control
    next_agent: Optional[str]          # Node name for conditional routing
    error_message: Optional[str]       # Capture any processing errors
