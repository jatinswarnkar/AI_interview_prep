from django.contrib import admin
from .models import (
    InterviewSession,
    ResumeData,
    JobDescriptionData,
    GapAnalysisResult,
    InterviewQuestionsResult,
    LearningRoadmapResult
)


@admin.register(InterviewSession)
class InterviewSessionAdmin(admin.ModelAdmin):
    list_display = ('id', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at')
    search_fields = ('id',)


@admin.register(ResumeData)
class ResumeDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'file_path', 'created_at')
    search_fields = ('session__id', 'raw_text')


@admin.register(JobDescriptionData)
class JobDescriptionDataAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'created_at')
    search_fields = ('session__id', 'raw_text')


@admin.register(GapAnalysisResult)
class GapAnalysisResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'readiness_score', 'created_at')
    search_fields = ('session__id', 'summary')


@admin.register(InterviewQuestionsResult)
class InterviewQuestionsResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'created_at')
    search_fields = ('session__id',)


@admin.register(LearningRoadmapResult)
class LearningRoadmapResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'session', 'estimated_days', 'created_at')
    search_fields = ('session__id', 'summary')
