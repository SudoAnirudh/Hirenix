import json
import logging
import uuid
from typing import List, Dict, Any, Optional

from langchain_core.messages import SystemMessage, AIMessage, ToolMessage, BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI

from config import settings
from services.agentic.state import AgentState
from services.agentic.tools import (
    ats_score_tool,
    job_match_tool,
    github_analyze_tool,
    roadmap_generation_tool,
    interview_evaluation_tool,
    interview_question_tool,
    outreach_draft_tool
)

logger = logging.getLogger(__name__)

def get_agent_llm(temperature: float = 0.2):
    """Factory function to instantiate the best available LLM with fallbacks."""
    google_key = settings.google_api_key or settings.gemini_api_key
    if google_key:
        try:
            logger.info("Initializing ChatGoogleGenerativeAI (gemini-2.5-flash)...")
            return ChatGoogleGenerativeAI(
                model="gemini-2.5-flash",
                google_api_key=google_key,
                temperature=temperature
            )
        except Exception as e:
            logger.warning(f"Failed to initialize ChatGoogleGenerativeAI: {e}. Falling back...")

    if settings.groq_api_key:
        try:
            logger.info("Initializing ChatGroq (llama-3.3-70b-versatile)...")
            return ChatGroq(
                model="llama-3.3-70b-versatile",
                groq_api_key=settings.groq_api_key,
                temperature=temperature
            )
        except Exception as e:
            logger.warning(f"Failed to initialize ChatGroq: {e}. Falling back...")

    if settings.openai_api_key:
        try:
            logger.info("Initializing ChatOpenAI (gpt-4o-mini)...")
            return ChatOpenAI(
                model="gpt-4o-mini",
                openai_api_key=settings.openai_api_key,
                temperature=temperature
            )
        except Exception as e:
            logger.warning(f"Failed to initialize ChatOpenAI: {e}. Falling back...")

    raise ValueError("No LLM API keys configured! Please set GOOGLE_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY.")


async def run_agent_with_tools(
    state: AgentState,
    llm: Any,
    tools: List[Any],
    system_prompt: str,
    agent_name: str
) -> Dict[str, Any]:
    """
    Executes a specialized agent's LLM reasoning loop, invoking bound tools 
    as requested by the model. Maxes out at 5 tool rounds.
    """
    llm_with_tools = llm.bind_tools(tools) if tools else llm
    
    # Prepend the system instructions to the chat history
    messages: List[BaseMessage] = [SystemMessage(content=system_prompt)] + list(state.get("messages", []))
    
    tool_results: List[tuple[str, str]] = []
    
    for round_idx in range(5):
        logger.info(f"Agent {agent_name}: Round {round_idx + 1}")
        response = await llm_with_tools.ainvoke(messages)
        
        # If the LLM didn't request any tool execution, we finish the loop
        if not response.tool_calls:
            new_msg = AIMessage(content=response.content, name=agent_name)
            return {
                "messages": [new_msg],
                "_tool_results": tool_results
            }
        
        # Add the assistant's intermediate message to the message history
        messages.append(response)
        
        for tool_call in response.tool_calls:
            t_name = tool_call["name"]
            t_args = tool_call["args"]
            t_id = tool_call["id"]
            
            logger.info(f"Agent {agent_name} calling tool: {t_name} with args: {t_args}")
            
            tool_obj = next((t for t in tools if t.name == t_name), None)
            if not tool_obj:
                res_str = f"Error: Tool '{t_name}' not found."
            else:
                try:
                    if tool_obj.is_coroutine:
                        res_str = await tool_obj.ainvoke(t_args)
                    else:
                        res_str = tool_obj.invoke(t_args)
                except Exception as e:
                    logger.error(f"Error in tool execution {t_name}: {e}")
                    res_str = f"Error executing tool: {str(e)}"
            
            # Format and append Tool Message
            tool_msg = ToolMessage(content=str(res_str), tool_call_id=t_id, name=t_name)
            messages.append(tool_msg)
            tool_results.append((t_name, str(res_str)))
            
    # Safety fallback
    return {
        "messages": [AIMessage(content="I completed the tasks but reached the maximum execution threshold.", name=agent_name)],
        "_tool_results": tool_results
    }


async def resume_agent_node(state: AgentState) -> Dict[str, Any]:
    """ResumeAgent specialized node logic."""
    logger.info("Entering ResumeAgent node")
    llm = get_agent_llm()
    
    system_prompt = (
        "You are the Resume Agent. Your role is to analyze, score, and optimize resumes. "
        "If the user asks for a resume evaluation or scoring, run the ats_score_tool. "
        "Provide clear resume formatting, structural improvements, and keyword advice based on the tool results. "
        "Explain the score and feedback items in a encouraging, professional developer-coach tone."
    )
    
    result = await run_agent_with_tools(state, llm, [ats_score_tool], system_prompt, "ResumeAgent")
    
    updates: Dict[str, Any] = {
        "messages": result["messages"],
        "next_agent": "supervisor"
    }
    
    # Parse out ATS score updates
    for t_name, t_output in result.get("_tool_results", []):
        if t_name == "ats_score_tool":
            try:
                # The tool returns JSON string
                if not t_output.startswith("Error"):
                    data = json.loads(t_output)
                    updates["ats_score"] = float(data.get("score", 0))
                    updates["ats_breakdown"] = data.get("breakdown", {})
            except Exception as e:
                logger.error(f"Failed to parse ATS score tool output: {e}")
                
    return updates


async def job_agent_node(state: AgentState) -> Dict[str, Any]:
    """JobAgent specialized node logic."""
    logger.info("Entering JobAgent node")
    llm = get_agent_llm()
    
    system_prompt = (
        "You are the Job Agent. Your role is to match the candidate's resume with target job descriptions (JDs) "
        "and craft outreach communication drafts. "
        "Use job_match_tool to compare a resume against a job description. "
        "Use outreach_draft_tool to write LinkedIn requests and email drafts for recruiters/hiring managers. "
        "Before generating outreach emails, you MUST perform a job match analysis first to personalize it. "
        "If generating outreach drafts, you must check if they are acceptable. If they look good, output them "
        "and prepare a request for human review by summarizing the drafts."
    )
    
    result = await run_agent_with_tools(state, llm, [job_match_tool, outreach_draft_tool], system_prompt, "JobAgent")
    
    updates: Dict[str, Any] = {
        "messages": result["messages"],
        "next_agent": "supervisor"
    }
    
    # If the agent generated outreach drafts, we trigger a Human-in-the-loop approval step!
    for t_name, t_output in result.get("_tool_results", []):
        if t_name == "outreach_draft_tool":
            try:
                if not t_output.startswith("Error"):
                    data = json.loads(t_output)
                    # Prepare approval state
                    updates["pending_approval_id"] = str(uuid.uuid4())
                    updates["approval_type"] = "outreach_draft"
                    updates["approval_draft"] = {
                        "linkedin_request": data.get("linkedin_request", ""),
                        "cold_email": data.get("cold_email", ""),
                        "company_name": data.get("company_name", "[Company]")
                    }
                    updates["approval_status"] = "pending"
                    
                    # Intercept flow to stop execution and wait for user
                    updates["next_agent"] = None
                    logger.info(f"Triggered outreach draft HITL approval with ID: {updates['pending_approval_id']}")
            except Exception as e:
                logger.error(f"Failed to parse outreach tool output: {e}")
                
    return updates


async def github_agent_node(state: AgentState) -> Dict[str, Any]:
    """GitHubAgent specialized node logic."""
    logger.info("Entering GitHubAgent node")
    llm = get_agent_llm()
    
    system_prompt = (
        "You are the GitHub Agent. Your role is to analyze developer public GitHub profiles and compute the "
        "GitHub Production Index (GPI). "
        "Use github_analyze_tool to fetch repository stats and analyze their tech stack diversity, project depth, and consistency. "
        "Provide constructive engineering advice: suggest adding documentation, deployment links, or cleaning up repository details."
    )
    
    result = await run_agent_with_tools(state, llm, [github_analyze_tool], system_prompt, "GitHubAgent")
    
    updates: Dict[str, Any] = {
        "messages": result["messages"],
        "next_agent": "supervisor"
    }
    
    # Parse out GPI score updates
    for t_name, t_output in result.get("_tool_results", []):
        if t_name == "github_analyze_tool":
            try:
                if not t_output.startswith("Error"):
                    data = json.loads(t_output)
                    updates["github_gpi"] = float(data.get("gpi_score", 0))
            except Exception as e:
                logger.error(f"Failed to parse GitHub analyzer tool output: {e}")
                
    return updates


async def roadmap_agent_node(state: AgentState) -> Dict[str, Any]:
    """RoadmapAgent specialized node logic."""
    logger.info("Entering RoadmapAgent node")
    llm = get_agent_llm()
    
    system_prompt = (
        "You are the Roadmap Agent. Your role is to generate custom hierarchical learning roadmaps to bridge skill gaps. "
        "Use roadmap_generation_tool to build a customized career progression path. "
        "Explain the stages of learning clearly and mention the real resources (courses, MDN, videos) that were found."
    )
    
    result = await run_agent_with_tools(state, llm, [roadmap_generation_tool], system_prompt, "RoadmapAgent")
    
    updates: Dict[str, Any] = {
        "messages": result["messages"],
        "next_agent": "supervisor"
    }
    
    # Parse out Roadmap data updates
    for t_name, t_output in result.get("_tool_results", []):
        if t_name == "roadmap_generation_tool":
            try:
                if not t_output.startswith("Error"):
                    data = json.loads(t_output)
                    updates["roadmap_data"] = data
            except Exception as e:
                logger.error(f"Failed to parse roadmap tool output: {e}")
                
    return updates


async def interview_agent_node(state: AgentState) -> Dict[str, Any]:
    """InterviewAgent specialized node logic."""
    logger.info("Entering InterviewAgent node")
    llm = get_agent_llm()
    
    system_prompt = (
        "You are the Interview Agent. Your role is to help the user practice for technical and behavioral interviews. "
        "Use interview_question_tool to generate a single tailored mock question. "
        "Use interview_evaluation_tool to evaluate candidate answers. "
        "Explain your evaluation rubrics, point out where the candidate did well, and provide a coaching plan."
    )
    
    result = await run_agent_with_tools(state, llm, [interview_question_tool, interview_evaluation_tool], system_prompt, "InterviewAgent")
    
    updates: Dict[str, Any] = {
        "messages": result["messages"],
        "next_agent": "supervisor"
    }
    
    # In case we need to track active session
    return updates
