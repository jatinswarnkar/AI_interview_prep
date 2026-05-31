import logging
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.core.files.storage import default_storage

from .models import (
    InterviewSession,
    ResumeData,
    JobDescriptionData,
    GapAnalysisResult,
    InterviewQuestionsResult,
    LearningRoadmapResult
)
from .serializers import (
    InterviewSessionSerializer,
    ResumeDataSerializer,
    JobDescriptionDataSerializer
)
from services.resume_parser import ResumeParser
from agents.graph import graph

logger = logging.getLogger(__name__)


class InterviewSessionViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows interview sessions to be created or retrieved.
    """
    queryset = InterviewSession.objects.all().order_by('-created_at')
    serializer_class = InterviewSessionSerializer
    http_method_names = ['get', 'post', 'delete']

    def create(self, request, *args, **kwargs):
        session = InterviewSession.objects.create(status=InterviewSession.Status.CREATED)
        serializer = self.get_serializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ResumeUploadView(APIView):
    """
    Endpoint to upload a resume file (PDF/DOCX) for a specific session.
    Parses the text and creates a ResumeData record.
    """
    def post(self, request, session_id):
        session = get_object_or_404(InterviewSession, id=session_id)
        file_obj = request.FILES.get('file')
        
        if not file_obj:
            return Response(
                {"error": "No file uploaded. Please supply a 'file' field."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        session.status = InterviewSession.Status.UPLOADING
        session.save()
        
        try:
            # Parse text from PDF/DOCX
            content_type = file_obj.content_type
            raw_text = ResumeParser.parse(file_obj, content_type)
            
            # Save file locally
            file_name = f"resumes/{session.id}_{file_obj.name}"
            saved_path = default_storage.save(file_name, file_obj)
            
            # Delete old ResumeData if it exists
            ResumeData.objects.filter(session=session).delete()
            
            # Create new ResumeData
            resume_data = ResumeData.objects.create(
                session=session,
                file_path=saved_path,
                raw_text=raw_text
            )
            
            session.status = InterviewSession.Status.CREATED  # Back to created/idle status
            session.save()
            
            serializer = ResumeDataSerializer(resume_data)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except ValueError as ve:
            session.status = InterviewSession.Status.FAILED
            session.save()
            return Response({"error": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f"Error uploading resume: {e}", exc_info=True)
            session.status = InterviewSession.Status.FAILED
            session.save()
            return Response(
                {"error": f"Failed to upload and parse resume: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class JobDescriptionView(APIView):
    """
    Endpoint to submit a job description text for a session.
    """
    def post(self, request, session_id):
        session = get_object_or_404(InterviewSession, id=session_id)
        raw_text = request.data.get('raw_text', '').strip()
        
        if not raw_text:
            return Response(
                {"error": "Job description text is empty."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Delete old JD if it exists
        JobDescriptionData.objects.filter(session=session).delete()
        
        jd_data = JobDescriptionData.objects.create(
            session=session,
            raw_text=raw_text
        )
        
        serializer = JobDescriptionDataSerializer(jd_data)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AnalyzeView(APIView):
    """
    Endpoint to run the full multi-agent LangGraph analysis pipeline.
    """
    def post(self, request, session_id):
        session = get_object_or_404(InterviewSession, id=session_id)
        
        # Check if we have resume and JD
        resume = getattr(session, 'resume', None)
        jd = getattr(session, 'job_description', None)
        
        if not resume:
            return Response(
                {"error": "Resume is missing. Please upload a resume first."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not jd:
            return Response(
                {"error": "Job description is missing. Please submit a job description first."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        session.status = InterviewSession.Status.ANALYZING
        session.save()
        
        try:
            # 1. Prepare LangGraph input state
            initial_state = {
                "session_id": str(session.id),
                "resume_text": resume.raw_text,
                "jd_text": jd.raw_text,
                "resume_analysis": None,
                "jd_analysis": None,
                "gap_analysis": None,
                "interview_questions": None,
                "learning_roadmap": None,
                "rag_context": [],
                "errors": [],
                "status": "ANALYZING"
            }
            
            # 2. Invoke the compiled graph
            logger.info(f"Invoking LangGraph pipeline for Session {session.id}")
            final_state = graph.invoke(initial_state)
            
            # Check for errors in state
            errors = final_state.get("errors", [])
            if errors:
                logger.error(f"Pipeline finished with errors: {errors}")
                session.status = InterviewSession.Status.FAILED
                session.save()
                return Response(
                    {"error": "Pipeline execution failed.", "details": errors},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                
            # 3. Save agent results back to the database
            
            # Update ResumeData with structural output
            res_analysis = final_state.get("resume_analysis")
            if res_analysis:
                resume.skills = res_analysis.get("skills", [])
                resume.experience = res_analysis.get("experience", [])
                resume.projects = res_analysis.get("projects", [])
                resume.technologies = res_analysis.get("technologies", [])
                resume.save()
                
            # Update JobDescriptionData with structural output
            jd_analysis = final_state.get("jd_analysis")
            if jd_analysis:
                jd.required_skills = jd_analysis.get("required_skills", [])
                jd.preferred_skills = jd_analysis.get("preferred_skills", [])
                jd.responsibilities = jd_analysis.get("responsibilities", [])
                jd.experience_requirements = jd_analysis.get("experience_requirements", [])
                jd.save()
                
            # Create or update GapAnalysisResult
            gap_analysis = final_state.get("gap_analysis")
            if gap_analysis:
                GapAnalysisResult.objects.filter(session=session).delete()
                GapAnalysisResult.objects.create(
                    session=session,
                    matching_skills=gap_analysis.get("matching_skills", []),
                    missing_skills=gap_analysis.get("missing_skills", []),
                    strengths=gap_analysis.get("strengths", []),
                    readiness_score=gap_analysis.get("readiness_score", 0.0),
                    summary=gap_analysis.get("summary", "")
                )
                
            # Create or update InterviewQuestionsResult
            questions = final_state.get("interview_questions")
            if questions:
                InterviewQuestionsResult.objects.filter(session=session).delete()
                InterviewQuestionsResult.objects.create(
                    session=session,
                    easy_questions=questions.get("easy_questions", []),
                    medium_questions=questions.get("medium_questions", []),
                    hard_questions=questions.get("hard_questions", []),
                    behavioral_questions=questions.get("behavioral_questions", []),
                    company_questions=questions.get("company_questions", []),
                    followup_questions=questions.get("followup_questions", [])
                )
                
            # Create or update LearningRoadmapResult
            roadmap = final_state.get("learning_roadmap")
            if roadmap:
                LearningRoadmapResult.objects.filter(session=session).delete()
                LearningRoadmapResult.objects.create(
                    session=session,
                    study_plan=roadmap.get("study_plan", []),
                    prioritized_skills=roadmap.get("prioritized_skills", []),
                    learning_sequence=roadmap.get("learning_sequence", []),
                    summary=roadmap.get("summary", ""),
                    estimated_days=roadmap.get("estimated_days", 7)
                )
                
            session.status = InterviewSession.Status.COMPLETED
            session.save()
            
            # Return full updated session details
            serializer = InterviewSessionSerializer(session)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Pipeline crash: {e}", exc_info=True)
            session.status = InterviewSession.Status.FAILED
            session.save()
            return Response(
                {"error": f"Pipeline execution failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
