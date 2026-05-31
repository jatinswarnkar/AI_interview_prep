import logging
from agents.state import InterviewState
from services.llm_client import LLMClient
from schemas.gap_schema import GapAnalysis
from agents.prompts.gap_prompts import GAP_SYSTEM_PROMPT, GAP_USER_PROMPT

logger = logging.getLogger(__name__)


def gap_analyzer_node(state: InterviewState) -> dict:
    """
    Agent Node: Performs gap analysis between Resume Analysis and Job Description Analysis.
    """
    logger.info(f"[{state.get('session_id')}] Running Gap Analyzer Agent...")
    
    resume_analysis = state.get("resume_analysis")
    jd_analysis = state.get("jd_analysis")
    
    if not resume_analysis or not jd_analysis:
        return {
            "errors": ["Missing resume or job description analysis in state."],
            "status": "FAILED"
        }
        
    try:
        # Initialize Azure LLM client with structured output
        llm = LLMClient.get_llm(temperature=0.0)
        structured_llm = llm.with_structured_output(GapAnalysis)
        
        # Build prompt messages
        messages = [
            ("system", GAP_SYSTEM_PROMPT),
            ("user", GAP_USER_PROMPT.format(
                resume_analysis=resume_analysis,
                jd_analysis=jd_analysis
            ))
        ]
        
        # Invoke model
        result: GapAnalysis = structured_llm.invoke(messages)
        
        # Convert to dictionary
        analysis_dict = result.model_dump()
        
        logger.info(f"[{state.get('session_id')}] Gap Analyzer Agent complete.")
        return {
            "gap_analysis": analysis_dict
        }
    except Exception as e:
        logger.error(f"[{state.get('session_id')}] Gap Analyzer error: {e}", exc_info=True)
        return {
            "errors": [f"Gap Analyzer error: {str(e)}"]
        }
