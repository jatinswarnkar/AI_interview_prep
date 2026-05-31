from pydantic import BaseModel, Field
from typing import List


class QuestionItem(BaseModel):
    question: str = Field(description="The interview question text")
    expected_answer: str = Field(description="A detailed outline of what a high-quality answer should include")
    pro_tip: str = Field(description="A helpful tip/strategy for answering this specific question")


class InterviewQuestions(BaseModel):
    easy_questions: List[QuestionItem] = Field(description="Basic/foundational technical questions related to matching skills")
    medium_questions: List[QuestionItem] = Field(description="Intermediate difficulty questions testing hands-on experience and application")
    hard_questions: List[QuestionItem] = Field(description="Advanced difficulty questions focusing on system design, architecture, or edge cases")
    behavioral_questions: List[QuestionItem] = Field(description="Behavioral questions tailored to the role's responsibilities, structure using STAR method")
    company_questions: List[QuestionItem] = Field(description="Questions specific to the domain or company type (e.g. scale, product, industry challenges)")
    followup_questions: List[QuestionItem] = Field(description="Common follow-up questions an interviewer might ask based on the initial questions")
