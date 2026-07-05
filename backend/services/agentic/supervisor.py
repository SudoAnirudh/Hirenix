import logging
from typing import Literal
from pydantic import BaseModel, Field

from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph, START, END

from services.agentic.state import AgentState
from services.agentic.agents import (
    get_agent_llm,
    resume_agent_node,
    job_agent_node,
    github_agent_node,
    roadmap_agent_node,
    interview_agent_node
)
from services.agentic.memory import SupabaseSaver
from dependencies import get_supabase_admin

logger = logging.getLogger(__name__)

# Pydantic schema for routing output
class RouterDecision(BaseModel):
    next_agent: Literal[
        "ResumeAgent", 
        "JobAgent", 
        "GitHubAgent", 
        "RoadmapAgent", 
        "InterviewAgent", 
        "FINISH"
    ] = Field(
        description="The specialized agent to route to, or 'FINISH' if the user's career assistant request is fully addressed."
    )
    justification: str = Field(
        description="A 1-sentence reason why this agent/route is selected."
    )

SUPERVISOR_PROMPT = """
You are the Supervisor Agent for Hirenix. You coordinate a team of specialized career assistants:
- ResumeAgent: Handles resume quality, ATS scoring, structural feedback, spelling, and section analysis.
- JobAgent: Evaluates match score against a job description and generates recruiter outreach (emails/LinkedIn templates).
- GitHubAgent: Examines public GitHub statistics, calculates the GitHub Production Index (GPI), and suggests repository improvements.
- RoadmapAgent: Generates customized hierarchical learning roadmaps to bridge skill gaps.
- InterviewAgent: Generates mock interview questions and evaluates user answers.

Given the chat conversation history, evaluate the user's latest query and route to the most appropriate agent. 
If the specialized agent has already successfully answered the user's question, route to 'FINISH'.
If you require more clarification or if the user's request is completed, route to 'FINISH'.
"""

async def supervisor_node(state: AgentState) -> dict:
    """Supervisor routing decision logic using low-temperature LLM and structured outputs."""
    logger.info("Entering Supervisor node")
    
    # Low temperature for planning stability
    llm = get_agent_llm(temperature=0.0)
    structured_llm = llm.with_structured_output(RouterDecision)
    
    messages = [SystemMessage(content=SUPERVISOR_PROMPT)] + list(state.get("messages", []))
    
    try:
        decision = await structured_llm.ainvoke(messages)
        next_agent = decision.next_agent
        logger.info(f"Supervisor Decision: {next_agent} | Justification: {decision.justification}")
    except Exception as e:
        logger.error(f"Supervisor routing model invocation failed: {e}. Defaulting to FINISH.")
        next_agent = "FINISH"
        
    return {
        "next_agent": next_agent
    }


def route_next(state: AgentState) -> str:
    """Conditional edge routing based on the state's next_agent property."""
    next_agent = state.get("next_agent")
    
    # If hit approval or finished/none, terminate step
    if next_agent == "FINISH" or not next_agent:
        return END
        
    return next_agent


# ─── Graph Construction ────────────────────────────────────────────────────────

workflow = StateGraph(AgentState)

# 1. Add Nodes
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("ResumeAgent", resume_agent_node)
workflow.add_node("JobAgent", job_agent_node)
workflow.add_node("GitHubAgent", github_agent_node)
workflow.add_node("RoadmapAgent", roadmap_agent_node)
workflow.add_node("InterviewAgent", interview_agent_node)

# 2. Add Edges
workflow.add_edge(START, "supervisor")

workflow.add_conditional_edges(
    "supervisor",
    route_next,
    {
        "ResumeAgent": "ResumeAgent",
        "JobAgent": "JobAgent",
        "GitHubAgent": "GitHubAgent",
        "RoadmapAgent": "RoadmapAgent",
        "InterviewAgent": "InterviewAgent",
        END: END
    }
)

# Loop specialized agents back to the supervisor
workflow.add_edge("ResumeAgent", "supervisor")
workflow.add_edge("JobAgent", "supervisor")
workflow.add_edge("GitHubAgent", "supervisor")
workflow.add_edge("RoadmapAgent", "supervisor")
workflow.add_edge("InterviewAgent", "supervisor")


def get_compiled_graph():
    """Compiles the LangGraph workflow using a custom SupabaseState checkpointer."""
    db = get_supabase_admin()
    checkpointer = SupabaseSaver(db)
    return workflow.compile(checkpointer=checkpointer)
