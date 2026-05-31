from rest_framework import serializers
from .models import (
    InterviewSession,
    ResumeData,
    JobDescriptionData,
    GapAnalysisResult,
    InterviewQuestionsResult,
    LearningRoadmapResult
)


class ResumeDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeData
        fields = ['id', 'file_path', 'skills', 'experience', 'projects', 'technologies', 'created_at']
        read_only_fields = fields


class JobDescriptionDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobDescriptionData
        fields = ['id', 'raw_text', 'required_skills', 'preferred_skills', 'responsibilities', 'experience_requirements', 'created_at']
        read_only_fields = ['id', 'required_skills', 'preferred_skills', 'responsibilities', 'experience_requirements', 'created_at']


class GapAnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = GapAnalysisResult
        fields = ['id', 'matching_skills', 'missing_skills', 'strengths', 'readiness_score', 'summary', 'created_at']
        read_only_fields = fields


class InterviewQuestionsResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewQuestionsResult
        fields = ['id', 'easy_questions', 'medium_questions', 'hard_questions', 'behavioral_questions', 'company_questions', 'followup_questions', 'created_at']
        read_only_fields = fields


class LearningRoadmapResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningRoadmapResult
        fields = ['id', 'study_plan', 'prioritized_skills', 'learning_sequence', 'summary', 'estimated_days', 'created_at']
        read_only_fields = fields


class InterviewSessionSerializer(serializers.ModelSerializer):
    resume = ResumeDataSerializer(read_only=True)
    job_description = JobDescriptionDataSerializer(read_only=True)
    gap_analysis = GapAnalysisResultSerializer(read_only=True)
    questions = InterviewQuestionsResultSerializer(read_only=True)
    roadmap = LearningRoadmapResultSerializer(read_only=True)

    class Meta:
        model = InterviewSession
        fields = ['id', 'session_number', 'status', 'created_at', 'updated_at', 'resume', 'job_description', 'gap_analysis', 'questions', 'roadmap']
        read_only_fields = ['id', 'session_number', 'status', 'created_at', 'updated_at']
