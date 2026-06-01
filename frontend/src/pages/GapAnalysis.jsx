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
        setError("Could not retrieve gap analysis results.");
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
  
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (s) => {
    if (s >= 85) return '#22C55E';
    if (s >= 70) return '#3B82F6';
    if (s >= 50) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, fontFamily: 'Outfit' }}>
        Role Fit Analysis
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Step 3 of 5: See how well your profile matches the target role and where to focus your preparation.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Score Card */}
        <Grid item xs={12} md={4}>
          <Card className="glass-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              Readiness Score
            </Typography>
            
            <Box sx={{ position: 'relative', display: 'inline-flex', mb: 3 }}>
              <svg width="150" height="150" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke="#F1F5F9"
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx="75"
                  cy="75"
                  r={radius}
                  fill="transparent"
                  stroke={getScoreColor(score)}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transition: 'stroke-dashoffset 1s ease-in-out'
                  }}
                />
              </svg>
              <Box
                sx={{
                  top: 0, left: 0, bottom: 0, right: 0,
                  position: 'absolute',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}
              >
                <Typography variant="h3" component="div" sx={{ fontWeight: 800, fontFamily: 'Outfit', color: getScoreColor(score) }}>
                  {Math.round(score)}%
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
          <Card className="glass-card" sx={{ height: '100%', p: 3 }}>
            <CardContent sx={{ p: 0 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, fontFamily: 'Outfit', color: 'primary.main' }}>
                Summary
              </Typography>
              <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-wrap', mb: 3, lineHeight: 1.7 }}>
                {gapData.summary || "No summary analysis compiled."}
              </Typography>
              
              <Divider sx={{ mb: 2 }} />
              
              <Stack direction="row" spacing={4} alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Skills Found
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {session.resume?.skills?.length || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Required
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {session.job_description?.required_skills?.length || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Skills Comparison */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card className="glass-card" sx={{ height: '100%', p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MatchIcon color="success" />
              Matching Skills ({gapData.matching_skills?.length || 0})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Skills on your resume that align with the role:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {gapData.matching_skills && gapData.matching_skills.length > 0 ? (
                gapData.matching_skills.map((skill, idx) => (
                  <Chip key={idx} label={skill} size="medium"
                    sx={{ bgcolor: alpha('#22C55E', 0.08), color: '#16A34A', border: '1px solid', borderColor: alpha('#22C55E', 0.2), fontWeight: 500 }}
                  />
                ))
              ) : (
                <Typography variant="body2" color="text.disabled">No exact matches identified.</Typography>
              )}
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card className="glass-card" sx={{ height: '100%', p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <MissingIcon color="error" />
              Gaps to Address ({gapData.missing_skills?.length || 0})
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Required skills not clearly shown on your resume:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {gapData.missing_skills && gapData.missing_skills.length > 0 ? (
                gapData.missing_skills.map((skill, idx) => (
                  <Chip key={idx} label={skill} size="medium"
                    sx={{ bgcolor: alpha('#F97316', 0.08), color: '#EA580C', border: '1px solid', borderColor: alpha('#F97316', 0.2), fontWeight: 500 }}
                  />
                ))
              ) : (
                <Chip label="Perfect Match!" color="success" />
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Strengths */}
      {gapData.strengths && gapData.strengths.length > 0 && (
        <Card className="glass-card" sx={{ mb: 4, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <StrengthIcon sx={{ color: '#F59E0B' }} />
            Your Strengths
          </Typography>
          
          <Grid container spacing={2}>
            {gapData.strengths.map((strength, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <MatchIcon color="success" sx={{ mt: 0.2, fontSize: '1.1rem' }} />
                  <Typography variant="body1">{strength}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Card>
      )}

      {/* Proceed Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate(`/session/${sessionId}/questions`)}
          sx={{ px: 5, py: 1.5 }}
        >
          View Practice Questions
        </Button>
      </Box>
    </Box>
  );
}
