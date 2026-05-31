import operator
from typing import TypedDict, Optional, List, Annotated


class InterviewState(TypedDict):
    """
    Shared state for the LangGraph multi-agent pipeline.
    """
    # Session identifier
    session_id: str
    
    # Input texts
    resume_text: str
    jd_text: str
    
    # Outputs from individual agent nodes (represented as dicts matching the Pydantic schemas)
    resume_analysis: Optional[dict]
    jd_analysis: Optional[dict]
    gap_analysis: Optional[dict]
    interview_questions: Optional[dict]
    learning_roadmap: Optional[dict]
    
    # Retrieved context from RAG service
    rag_context: Optional[List[str]]
    
    # Accumulated errors during execution (uses addition reducer)
    errors: Annotated[List[str], operator.add]
    
    # Current status of the pipeline
    status: str
