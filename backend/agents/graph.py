import logging
from langgraph.graph import START, END, StateGraph

from agents.state import InterviewState
from agents.nodes.resume_analyzer import resume_analyzer_node
from agents.nodes.jd_analyzer import jd_analyzer_node
from agents.nodes.gap_analyzer import gap_analyzer_node
from agents.nodes.question_generator import question_generator_node
from agents.nodes.roadmap_generator import roadmap_generator_node

logger = logging.getLogger(__name__)


def create_graph():
    """
    Builds and compiles the multi-agent execution graph.
    """
    # Initialize the graph with our state schema
    workflow = StateGraph(InterviewState)

    # Register all nodes
    workflow.add_node("resume_analyzer", resume_analyzer_node)
    workflow.add_node("jd_analyzer", jd_analyzer_node)
    workflow.add_node("gap_analyzer", gap_analyzer_node)
    workflow.add_node("question_generator", question_generator_node)
    workflow.add_node("roadmap_generator", roadmap_generator_node)

    # Define edges (execution flow)
    # 1. Start by analyzing the resume
    workflow.add_edge(START, "resume_analyzer")
    
    # 2. Then analyze the job description
    workflow.add_edge("resume_analyzer", "jd_analyzer")
    
    # 3. Perform gap analysis once both profiles are ready
    workflow.add_edge("jd_analyzer", "gap_analyzer")
    
    # 4. Fork execution: run Question Generator and Roadmap Generator in parallel
    workflow.add_edge("gap_analyzer", "question_generator")
    workflow.add_edge("gap_analyzer", "roadmap_generator")
    
    # 5. Join execution and finish the workflow
    workflow.add_edge("question_generator", END)
    workflow.add_edge("roadmap_generator", END)

    # Compile the graph
    app = workflow.compile()
    logger.info("LangGraph workflow compiled successfully.")
    return app


# Export the compiled graph
graph = create_graph()
