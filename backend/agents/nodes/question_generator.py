import logging
from agents.state import InterviewState
from services.llm_client import LLMClient
from services.rag_service import RAGService
from schemas.question_schema import InterviewQuestions
from agents.prompts.question_prompts import QUESTION_SYSTEM_PROMPT, QUESTION_USER_PROMPT

logger = logging.getLogger(__name__)


def question_generator_node(state: InterviewState) -> dict:
    """
    Agent Node: Generates realistic interview questions tailored to the candidate's gaps.
    Integrates FAISS retrieval to ground technical questions.
    """
    logger.info(f"[{state.get('session_id')}] Running Question Generator Agent (with RAG)...")
    
    resume_analysis = state.get("resume_analysis")
    jd_analysis = state.get("jd_analysis")
    gap_analysis = state.get("gap_analysis")
    
    if not resume_analysis or not jd_analysis or not gap_analysis:
        return {
            "errors": ["Missing resume, job description, or gap analysis in state."],
            "status": "FAILED"
        }
        
    try:
        # 1. Retrieve RAG Context
        missing_skills = gap_analysis.get("missing_skills", [])
        job_summary = jd_analysis.get("summary", "")
        
        # Build query targeting the candidate's gaps and job context
        query_parts = []
        if missing_skills:
            query_parts.append(" ".join(missing_skills[:5]))
        if job_summary:
            query_parts.append(job_summary[:200])
            
        query = " ".join(query_parts) if query_parts else "technical interview preparation"
        
        logger.info(f"[{state.get('session_id')}] RAG Query: {query}")
        
        rag_service = RAGService()
        retrieved_docs = rag_service.retrieve(query, top_k=5)
        
        # Format the retrieved documents as context for the LLM
        formatted_context_list = []
        context_texts = []
        for doc in retrieved_docs:
            source = doc.get("source", "unknown")
            category = doc.get("category", "general")
            content = doc.get("content", "").strip()
            
            context_text = f"Category: {category} | Source: {source}\n{content}"
            context_texts.append(content)
            formatted_context_list.append(context_text)
            
        rag_context_str = "\n\n---\n\n".join(formatted_context_list) if formatted_context_list else "No relevant reference documentation found."
        
        # 2. Generate Interview Questions using LLM
        llm = LLMClient.get_llm(temperature=0.4)  # Slightly higher temperature for variety
        structured_llm = llm.with_structured_output(InterviewQuestions)
        
        # Build messages
        messages = [
            ("system", QUESTION_SYSTEM_PROMPT),
            ("user", QUESTION_USER_PROMPT.format(
                resume_analysis=resume_analysis,
                jd_analysis=jd_analysis,
                gap_analysis=gap_analysis,
                rag_context=rag_context_str
            ))
        ]
        
        # Invoke model
        result: InterviewQuestions = structured_llm.invoke(messages)
        
        # Convert to dictionary
        questions_dict = result.model_dump()
        
        logger.info(f"[{state.get('session_id')}] Question Generator Agent complete.")
        return {
            "interview_questions": questions_dict,
            "rag_context": context_texts
        }
    except Exception as e:
        logger.error(f"[{state.get('session_id')}] Question Generator error: {e}", exc_info=True)
        return {
            "errors": [f"Question Generator error: {str(e)}"]
        }
