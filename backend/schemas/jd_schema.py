from pydantic import BaseModel, Field
from typing import List


class JDAnalysis(BaseModel):
    required_skills: List[str] = Field(description="List of required/mandatory skills mentioned in the job description")
    preferred_skills: List[str] = Field(description="List of preferred, optional, or nice-to-have skills")
    responsibilities: List[str] = Field(description="Key responsibilities and duties of the role")
    experience_requirements: List[str] = Field(description="Minimum and preferred experience requirements, e.g. '3+ years with Python'")
    summary: str = Field(description="A concise summary of what the job is about and the ideal candidate profile")
