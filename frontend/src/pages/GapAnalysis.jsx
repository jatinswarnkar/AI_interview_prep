import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, LinearProgress,
  CircularProgress, Alert, Stack, Divider, Button, alpha
} from '@mui/material';
import {
  CheckCircleOutline as MatchIcon,
  HighlightOff as MissingIcon,
  StarOutline as StrengthIcon,
  ArrowForward as ArrowForwardIcon,
  Timer as ClockIcon
} from '@mui/icons-material';
import { getSession } from '../api/client';

export default function GapAnalysis() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await getSession(sessionId);
        setSession(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load gap results", err);
        setError("Could not retrieve gap analysis results. Verify the backend server is active.");
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) {
      fetchResults();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
        <CircularProgress size={50} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">Loading Analysis Results...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  const gapData = session?.gap_analysis;
  
  if (!gapData) {
    return (
      <Card className="glass-card" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          No gap analysis found for this session.
        </Typography>
        <Button variant="contained" onClick={() => navigate(`/session/${sessionId}/jd`)}>
          Go to Job Description
        </Button>
      </Card>
    );
  }

  const score = gapData.readiness_score || 0;
  
  // Calculate SVG circular gauge properties
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, fontFamily: 'Outfit' }}>
        Role Gap Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Step 3 of 5: Evaluate your readiness score, matching strengths, and critical missing skill gaps.
      </Typography>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Score Card */}
        <Grid item xs={12} md={4}>
          <Card className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 3, fontWeight: 600 }}>
              Readiness Score
            </Typography>
            
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
              {/* SVG Circular Gauge */}
              <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background circle */}
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth={strokeWidth}
                />
                {/* Foreground circle with primary gradient */}
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="url(#progressGradient)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 1s ease-in-out'
                  }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Score Value Centered */}
              <Box
                sx={{
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h3" component="div" sx={{ fontWeight: 800, fontFamily: 'Outfit' }}>
                  {Math.round(score)}%
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600 }}>
                  MATCH RATE
                </Typography>
              </Box>
            </Box>

            <Chip
              label={
                score >= 85 ? 'Highly Qualified' :
                score >= 70 ? 'Good Fit' :
                score >= 50 ? 'Partially Qualified' : 'Needs Development'
              }
              color={
                score >= 85 ? 'success' :
                score >= 70 ? 'info' :
                score >= 50 ? 'warning' : 'error'
              }
              sx={{ fontWeight: 600 }}
            />
          </Card>
        </Grid>

        {/* Summary Card */}
        <Grid item xs={12} md={8}>
          <Card className="glass-card" sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, fontFamily: 'Outfit', color: 'primary.light' }}>
                Hiring Manager Synthesis
              </Typography>
              <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
                {gapData.summary || "No summary analysis compiled."}
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Stack direction="row" spacing={3} alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 600 }}>
                    RESUME PARSED
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {session.resume?.skills?.length || 0} Skills Extracted
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 600 }}>
                    JOB REQUIREMENTS
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {session.job_description?.required_skills?.length || 0} Skills Required
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Skills Comparison Grid */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Matching Skills */}
        <Grid item xs={12} md={6}>
          <Card className="glass-card" sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MatchIcon color="success" />
                Matching Strengths ({gapData.matching_skills?.length || 0})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Skills present on your resume that match the job description requirements:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {gapData.matching_skills && gapData.matching_skills.length > 0 ? (
                  gapData.matching_skills.map((skill, idx) => (
                    <Chip key={idx} label={skill} color="primary" variant="filled" size="medium" />
                  ))
                ) : (
                  <Typography variant="body2" color="text.disabled">No exact matches identified.</Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Missing Skills */}
        <Grid item xs={12} md={6}>
          <Card className="glass-card" sx={{ height: '100%', p: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <MissingIcon color="error" />
                Key Gaps Identified ({gapData.missing_skills?.length || 0})
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Required skills in the JD that are not clearly demonstrated on your resume:
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {gapData.missing_skills && gapData.missing_skills.length > 0 ? (
                  gapData.missing_skills.map((skill, idx) => (
                    <Chip key={idx} label={skill} color="secondary" variant="filled" size="medium" />
                  ))
                ) : (
                  <Chip label="None! Complete Skill Match" color="success" />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Strengths Card */}
      {gapData.strengths && gapData.strengths.length > 0 && (
        <Card className="glass-card" sx={{ mb: 4, p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <StrengthIcon color="warning" />
              Detailed Strengths Highlight
            </Typography>
            
            <Grid container spacing={2}>
              {gapData.strengths.map((strength, idx) => (
                <Grid item xs={12} md={6} key={idx}>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <MatchIcon color="success" sx={{ mt: 0.2 }} />
                    <Typography variant="body1">{strength}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Proceed Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate(`/session/${sessionId}/questions`)}
          sx={{ px: 5, py: 1.5 }}
        >
          View Practice Interview Questions
        </Button>
      </Box>
    </Box>
  );
}
