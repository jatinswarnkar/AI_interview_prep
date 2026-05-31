from pydantic import BaseModel, Field
from typing import List


class GapAnalysis(BaseModel):
    matching_skills: List[str] = Field(description="List of skills from the JD that the candidate clearly possesses")
    missing_skills: List[str] = Field(description="Key skills required by the JD that are not clearly demonstrated in the resume")
    strengths: List[str] = Field(description="Core strengths and areas where the candidate is a strong fit for this job description")
    readiness_score: float = Field(description="Overall readiness score of the candidate for the role, from 0.0 (no match) to 100.0 (perfect fit)")
    summary: str = Field(description="A concise synthesis explaining the main gaps, overall match, and specific areas of recommendation")
