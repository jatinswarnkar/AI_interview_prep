import logging
from agents.state import InterviewState
from services.llm_client import LLMClient
from schemas.jd_schema import JDAnalysis
from agents.prompts.jd_prompts import JD_SYSTEM_PROMPT, JD_USER_PROMPT

logger = logging.getLogger(__name__)


def jd_analyzer_node(state: InterviewState) -> dict:
    """
    Agent Node: Extracts required and preferred qualifications from Job Description.
    """
    logger.info(f"[{state.get('session_id')}] Running Job Description Analyzer Agent...")
    
    jd_text = state.get("jd_text", "").strip()
    if not jd_text:
        return {
            "errors": ["Job Description text is empty or missing."],
            "status": "FAILED"
        }
        
    try:
        # Initialize Azure LLM client with structured output
        llm = LLMClient.get_llm(temperature=0.0)
        structured_llm = llm.with_structured_output(JDAnalysis)
        
        # Build prompt messages
        messages = [
            ("system", JD_SYSTEM_PROMPT),
            ("user", JD_USER_PROMPT.format(jd_text=jd_text))
        ]
        
        # Invoke model
        result: JDAnalysis = structured_llm.invoke(messages)
        
        # Convert to dictionary
        analysis_dict = result.model_dump()
        
        logger.info(f"[{state.get('session_id')}] Job Description Analyzer Agent complete.")
        return {
            "jd_analysis": analysis_dict
        }
    except Exception as e:
        logger.error(f"[{state.get('session_id')}] Job Description Analyzer error: {e}", exc_info=True)
        return {
            "errors": [f"Job Description Analyzer error: {str(e)}"]
        }
