import logging
from agents.state import InterviewState
from services.llm_client import LLMClient
from schemas.roadmap_schema import LearningRoadmap
from agents.prompts.roadmap_prompts import ROADMAP_SYSTEM_PROMPT, ROADMAP_USER_PROMPT

logger = logging.getLogger(__name__)


def roadmap_generator_node(state: InterviewState) -> dict:
    """
    Agent Node: Generates a personalized learning roadmap and week-by-week study plan.
    """
    logger.info(f"[{state.get('session_id')}] Running Roadmap Generator Agent...")
    
    resume_analysis = state.get("resume_analysis")
    jd_analysis = state.get("jd_analysis")
    gap_analysis = state.get("gap_analysis")
    
    if not resume_analysis or not jd_analysis or not gap_analysis:
        return {
            "errors": ["Missing resume, job description, or gap analysis in state."],
            "status": "FAILED"
        }
        
    try:
        # Initialize Azure LLM client with structured output
        llm = LLMClient.get_llm(temperature=0.2)
        structured_llm = llm.with_structured_output(LearningRoadmap)
        
        # Build prompt messages
        messages = [
            ("system", ROADMAP_SYSTEM_PROMPT),
            ("user", ROADMAP_USER_PROMPT.format(
                resume_analysis=resume_analysis,
                jd_analysis=jd_analysis,
                gap_analysis=gap_analysis
            ))
        ]
        
        # Invoke model
        result: LearningRoadmap = structured_llm.invoke(messages)
        
        # Convert to dictionary
        roadmap_dict = result.model_dump()
        
        logger.info(f"[{state.get('session_id')}] Roadmap Generator Agent complete.")
        return {
            "learning_roadmap": roadmap_dict
        }
    except Exception as e:
        logger.error(f"[{state.get('session_id')}] Roadmap Generator error: {e}", exc_info=True)
        return {
            "errors": [f"Roadmap Generator error: {str(e)}"]
        }
