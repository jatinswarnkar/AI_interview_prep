from pydantic import BaseModel, Field
from typing import List


class RoadmapItem(BaseModel):
    week: str = Field(description="Timeframe/unit, e.g., 'Week 1', 'Week 2'")
    topic: str = Field(description="The primary learning topic or objective")
    skills_covered: List[str] = Field(description="Specific skills or tools to study")
    resources_and_actions: List[str] = Field(description="Actionable study tasks, topics, or practical mini-projects to build")


class PrioritizedSkillItem(BaseModel):
    skill: str = Field(description="The name of the skill")
    priority: str = Field(description="Priority: High, Medium, Low")
    rationale: str = Field(description="Why this skill has this priority relative to the job requirements")


class LearningRoadmap(BaseModel):
    study_plan: List[RoadmapItem] = Field(description="A chronologically ordered week-by-week plan to prepare the candidate")
    prioritized_skills: List[PrioritizedSkillItem] = Field(description="List of skills that need development, ranked by urgency")
    learning_sequence: List[str] = Field(description="Ordered list of high-level topics in the recommended order of study")
    summary: str = Field(description="A brief summary overview and motivational guidance for the preparation journey")
    estimated_days: int = Field(description="Total estimated preparation duration in days")
