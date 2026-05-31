import logging
from agents.state import InterviewState
from services.llm_client import LLMClient
from schemas.resume_schema import ResumeAnalysis
from agents.prompts.resume_prompts import RESUME_SYSTEM_PROMPT, RESUME_USER_PROMPT

logger = logging.getLogger(__name__)


def resume_analyzer_node(state: InterviewState) -> dict:
    """
    Agent Node: Extracts structured candidate information from resume text.
    """
    logger.info(f"[{state.get('session_id')}] Running Resume Analyzer Agent...")
    
    resume_text = state.get("resume_text", "").strip()
    if not resume_text:
        return {
            "errors": ["Resume text is empty or missing."],
            "status": "FAILED"
        }
        
    try:
        # Initialize Azure LLM client with structured output
        llm = LLMClient.get_llm(temperature=0.0)
        structured_llm = llm.with_structured_output(ResumeAnalysis)
        
        # Build prompt messages
        messages = [
            ("system", RESUME_SYSTEM_PROMPT),
            ("user", RESUME_USER_PROMPT.format(resume_text=resume_text))
        ]
        
        # Invoke model
        result: ResumeAnalysis = structured_llm.invoke(messages)
        
        # Convert to dictionary representation for state serialization
        analysis_dict = result.model_dump()
        
        logger.info(f"[{state.get('session_id')}] Resume Analyzer Agent complete.")
        return {
            "resume_analysis": analysis_dict
        }
    except Exception as e:
        logger.error(f"[{state.get('session_id')}] Resume Analyzer error: {e}", exc_info=True)
        return {
            "errors": [f"Resume Analyzer error: {str(e)}"]
        }
