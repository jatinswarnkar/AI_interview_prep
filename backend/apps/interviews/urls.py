from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InterviewSessionViewSet,
    ResumeUploadView,
    JobDescriptionView,
    AnalyzeView
)

router = DefaultRouter()
router.register(r'sessions', InterviewSessionViewSet, basename='session')

urlpatterns = [
    # Router endpoints (e.g. GET /api/sessions/, POST /api/sessions/, GET /api/sessions/{id}/)
    path('', include(router.urls)),
    
    # Custom API endpoints
    path('sessions/<uuid:session_id>/resume/', ResumeUploadView.as_view(), name='session-resume-upload'),
    path('sessions/<uuid:session_id>/job-description/', JobDescriptionView.as_view(), name='session-jd-submit'),
    path('sessions/<uuid:session_id>/analyze/', AnalyzeView.as_view(), name='session-run-analysis'),
]
