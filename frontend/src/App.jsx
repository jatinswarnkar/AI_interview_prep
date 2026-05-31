import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ResumeUpload from './pages/ResumeUpload';
import JobDescription from './pages/JobDescription';
import GapAnalysis from './pages/GapAnalysis';
import InterviewQuestions from './pages/InterviewQuestions';
import LearningRoadmap from './pages/LearningRoadmap';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        {/* Main Dashboard / Session History */}
        <Route path="/" element={<Dashboard />} />
        
        {/* Step-by-Step Prep Pipeline */}
        <Route path="/session/:sessionId/resume" element={<ResumeUpload />} />
        <Route path="/session/:sessionId/jd" element={<JobDescription />} />
        
        {/* Result views */}
        <Route path="/session/:sessionId/gap" element={<GapAnalysis />} />
        <Route path="/session/:sessionId/questions" element={<InterviewQuestions />} />
        <Route path="/session/:sessionId/roadmap" element={<LearningRoadmap />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppLayout>
  );
}
