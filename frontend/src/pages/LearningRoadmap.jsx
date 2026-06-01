import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip,
  CircularProgress, Alert, Stack, Divider, Button, alpha
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Timeline as TimelineIcon,
  CalendarMonth as CalendarIcon,
  PriorityHigh as PriorityIcon,
  BookOutlined as ResourceIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { getSession } from '../api/client';

export default function LearningRoadmap() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const res = await getSession(sessionId);
        setSession(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load roadmap", err);
        setError("Could not retrieve learning roadmap.");
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) {
      fetchRoadmap();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
        <CircularProgress size={50} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">Loading Study Roadmap...</Typography>
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

  const roadmapData = session?.roadmap;

  if (!roadmapData) {
    return (
      <Card className="glass-card" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          No learning roadmap found.
        </Typography>
        <Button variant="contained" onClick={() => navigate(`/session/${sessionId}/jd`)}>
          Run Analysis
        </Button>
      </Card>
    );
  }

  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const totalWeeks = roadmapData.study_plan?.length || 0;

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, fontFamily: 'Outfit' }}>
        Your Study Roadmap
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Step 5 of 5: Follow your personalized week-by-week preparation plan to close skill gaps and build confidence.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Left Column: Duration & Priorities */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Duration card */}
            <Card className="glass-card" sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  p: 1.5, borderRadius: 2, 
                  bgcolor: alpha('#F97316', 0.08),
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <CalendarIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Preparation Time
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit', color: 'text.primary' }}>
                    {roadmapData.estimated_days || (totalWeeks * 7)} Days
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {totalWeeks} week{totalWeeks !== 1 ? 's' : ''} of study
                  </Typography>
                </Box>
              </Stack>
            </Card>

            {/* Prioritized Skills */}
            <Card className="glass-card" sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PriorityIcon sx={{ color: 'primary.main' }} />
                Priority Skills
              </Typography>
              
              <Stack spacing={2} divider={<Divider />}>
                {roadmapData.prioritized_skills && roadmapData.prioritized_skills.length > 0 ? (
                  roadmapData.prioritized_skills.map((item, idx) => (
                    <Box key={idx} sx={{ py: 0.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {item.skill}
                        </Typography>
                        <Chip 
                          label={item.priority} 
                          color={getPriorityColor(item.priority)} 
                          size="small" 
                          variant="filled"
                        />
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                        {item.rationale}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.disabled">No prioritized skills.</Typography>
                )}
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column: Weekly Timeline */}
        <Grid item xs={12} md={8}>
          <Card className="glass-card" sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'Outfit' }}>
              <TimelineIcon color="primary" />
              Week-by-Week Plan
            </Typography>

            {roadmapData.study_plan && roadmapData.study_plan.length > 0 ? (
              <Stack spacing={3} sx={{ 
                position: 'relative', 
                pl: { xs: 3, sm: 4 }, 
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: { xs: '11px', sm: '15px' },
                  top: '8px',
                  bottom: '8px',
                  width: '2px',
                  bgcolor: '#E2E8F0'
                }
              }}>
                {roadmapData.study_plan.map((step, idx) => (
                  <Box key={idx} sx={{ position: 'relative' }}>
                    {/* Timeline Dot */}
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        left: { xs: '-23px', sm: '-29px' }, 
                        top: '4px',
                        width: '16px', 
                        height: '16px', 
                        borderRadius: '50%', 
                        bgcolor: '#FFFFFF', 
                        border: '3px solid',
                        borderColor: 'primary.main',
                        zIndex: 1
                      }} 
                    />
                    
                    <Card sx={{ p: 3, bgcolor: '#FAFAF9', border: '1px solid #F1F5F9' }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2, gap: 1 }}>
                        <Chip label={step.week} color="primary" size="small" sx={{ fontWeight: 700 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          {step.topic}
                        </Typography>
                      </Stack>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 0.5 }}>
                          Skills Covered
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {step.skills_covered && step.skills_covered.map((skill, sIdx) => (
                            <Chip key={sIdx} label={skill} size="small" variant="outlined" 
                              sx={{ borderColor: '#E2E8F0', color: 'text.secondary', fontSize: '0.8rem' }}
                            />
                          ))}
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1 }}>
                        Action Items
                      </Typography>
                      <Stack spacing={0.8}>
                        {step.resources_and_actions && step.resources_and_actions.map((act, aIdx) => (
                          <Box key={aIdx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                            <ResourceIcon sx={{ mt: 0.2, fontSize: '0.95rem', color: 'primary.main' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                              {act}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Card>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">No study plan available.</Typography>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Mentor Summary */}
      {roadmapData.summary && (
        <Card className="glass-card" sx={{ mb: 4, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontFamily: 'Outfit', color: 'primary.main' }}>
            💡 Mentor Notes
          </Typography>
          <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>
            {roadmapData.summary}
          </Typography>
        </Card>
      )}

      {/* Bottom Actions */}
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/session/${sessionId}/questions`)}
        >
          Back to Questions
        </Button>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
          sx={{ px: 4 }}
        >
          Back to Dashboard
        </Button>
      </Stack>
    </Box>
  );
}
