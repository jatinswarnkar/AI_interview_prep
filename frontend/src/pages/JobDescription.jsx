import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, TextField,
  CircularProgress, Alert, alpha, Stack, Step, StepLabel, Stepper
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  AutoAwesome as MagicIcon,
  CheckCircle as CompleteIcon
} from '@mui/icons-material';
import { submitJobDescription, runAnalysis, getSession } from '../api/client';

const pipelineSteps = [
  { label: "Analyzing Your Resume", subtitle: "Extracting skills, experience & projects..." },
  { label: "Understanding the Role", subtitle: "Parsing job requirements & responsibilities..." },
  { label: "Finding Your Gaps", subtitle: "Comparing your profile against the role..." },
  { label: "Generating Interview Questions", subtitle: "Creating personalized practice questions..." },
  { label: "Building Your Study Plan", subtitle: "Crafting a tailored learning roadmap..." }
];

export default function JobDescription() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [jdText, setJdText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  
  // Load existing Job Description if present
  useEffect(() => {
    const loadSessionData = async () => {
      try {
        const res = await getSession(sessionId);
        if (res.data.job_description) {
          setJdText(res.data.job_description.raw_text);
        }
      } catch (err) {
        console.error("Failed to load session details", err);
      }
    };
    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId]);

  // Handle pipeline step animations (increment every 8s)
  useEffect(() => {
    let interval;
    if (analyzing) {
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev < pipelineSteps.length - 1 ? prev + 1 : prev));
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  const handleSubmitAndAnalyze = async () => {
    if (!jdText.trim()) {
      setError("Please paste the job description text.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Submit Job Description
      await submitJobDescription(sessionId, jdText);
      
      // 2. Trigger analysis pipeline
      setSubmitting(false);
      setAnalyzing(true);
      setCurrentStep(0);
      
      const res = await runAnalysis(sessionId);
      
      // 3. Navigation to Gap Analysis page upon completion
      navigate(`/session/${sessionId}/gap`);
    } catch (err) {
      console.error("Analysis pipeline failed", err);
      const errMsg = err.response?.data?.error || err.response?.data?.detail || "Pipeline analysis failed. Verify your Azure OpenAI credentials in .env.";
      setError(errMsg);
      setSubmitting(false);
      setAnalyzing(false);
    }
  };

  return (
    <Box sx={{ py: 2, maxWidth: '900px', mx: 'auto' }}>
      <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, fontFamily: 'Outfit' }}>
        Job Description & Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Step 2 of 5: Paste the target job description. Our AI will analyze your fit and generate a personalized interview prep plan.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {analyzing ? (
        <Card className="glass-card" sx={{ p: 4, textAlign: 'center', mb: 4 }}>
          <CardContent>
            <CircularProgress size={60} thickness={4} sx={{ mb: 4 }} color="secondary" />
            
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, fontFamily: 'Outfit' }}>
              Preparing Your Interview Kit
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 5, maxWidth: '550px', mx: 'auto' }}>
              Our AI is analyzing your resume against the job description to create a personalized preparation plan. This typically takes 30–60 seconds.
            </Typography>

            <Box sx={{ maxWidth: '600px', mx: 'auto', mt: 2 }}>
              <Stepper activeStep={currentStep} orientation="vertical" sx={{ textAlign: 'left' }}>
                {pipelineSteps.map((step, index) => {
                  const isCurrent = index === currentStep;
                  const isCompleted = index < currentStep;
                  return (
                    <Step key={step.label}>
                      <StepLabel
                        StepIconProps={{
                          sx: {
                            color: isCompleted ? 'success.main' : isCurrent ? 'secondary.main' : 'rgba(255, 255, 255, 0.15)',
                          }
                        }}
                      >
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: isCurrent ? 700 : 500,
                            color: isCurrent ? 'text.primary' : isCompleted ? 'text.secondary' : 'text.disabled'
                          }}
                        >
                          {step.label}
                        </Typography>
                        {isCurrent && (
                          <Typography variant="caption" color="secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {step.subtitle}
                          </Typography>
                        )}
                        {isCompleted && (
                          <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <CompleteIcon sx={{ fontSize: 12 }} /> Done
                          </Typography>
                        )}
                      </StepLabel>
                    </Step>
                  );
                })}
              </Stepper>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass-card" sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Paste Job Description Text
            </Typography>
            
            <TextField
              fullWidth
              multiline
              rows={12}
              placeholder="Paste the full job description details, requirements, responsibilities here..."
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              disabled={submitting}
              sx={{ 
                mb: 4,
                '& .MuiInputBase-root': {
                  bgcolor: 'rgba(0, 0, 0, 0.15)',
                  fontSize: '0.95rem'
                }
              }}
            />
            
            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(`/session/${sessionId}/resume`)}
                disabled={submitting}
              >
                Back to Resume
              </Button>
              
              <Button
                variant="contained"
                color="secondary"
                endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <MagicIcon />}
                onClick={handleSubmitAndAnalyze}
                disabled={submitting || !jdText.trim()}
                sx={{ px: 4 }}
              >
                {submitting ? 'Submitting...' : 'Analyze Fit & Generate Prep'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
