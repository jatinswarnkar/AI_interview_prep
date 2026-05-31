from pydantic import BaseModel, Field
from typing import List


class Skill(BaseModel):
    name: str = Field(description="Name of the skill, e.g., Python, Docker, Project Management")
    category: str = Field(description="Category of skill, e.g., Programming Language, Framework, Database, Tool, Soft Skill")
    proficiency: str = Field(description="Proficiency level: beginner, intermediate, or advanced")


class Experience(BaseModel):
    company: str = Field(description="Name of the company or organization")
    role: str = Field(description="Job title/role")
    duration: str = Field(description="Dates or duration, e.g., Jan 2021 - Present, 2 years")
    highlights: List[str] = Field(description="Key responsibilities and achievements in this role")


class Project(BaseModel):
    name: str = Field(description="Name of the project")
    description: str = Field(description="Brief summary of what the project does")
    technologies: List[str] = Field(description="Technologies and languages used in the project")


class ResumeAnalysis(BaseModel):
    skills: List[Skill] = Field(description="Extracted list of skills")
    experience: List[Experience] = Field(description="Extracted work experience entries")
    projects: List[Project] = Field(description="Extracted key projects")
    technologies: List[str] = Field(description="Consolidated list of technologies/tools mentioned")
    summary: str = Field(description="A brief professional summary of the candidate based on the resume")
