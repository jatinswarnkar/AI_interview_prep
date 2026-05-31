import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, LinearProgress,
  CircularProgress, Alert, Stack, Divider, Button, Paper
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
        setError("Could not retrieve learning roadmap. Verify backend server is active.");
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
        <Typography variant="body1" color="text.secondary">Loading Learning Roadmap...</Typography>
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
          Trigger Analysis
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

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, fontFamily: 'Outfit' }}>
        Personalized Study Roadmap
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Step 5 of 5: Follow your week-by-week preparation blueprint to address key gaps and review important topics.
      </Typography>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Left Column: Prioritized Skills & Duration */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Prep duration */}
            <Card className="glass-card" sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <CalendarIcon color="primary" sx={{ fontSize: 36 }} />
              <Box>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 600 }}>
                  ESTIMATED PREPARATION TIME
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: 'Outfit' }}>
                  {roadmapData.estimated_days || 14} Days
                </Typography>
              </Box>
            </Card>

            {/* Prioritized Gaps list */}
            <Card className="glass-card" sx={{ p: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PriorityIcon color="secondary" />
                  Prioritized Skill Gaps
                </Typography>
                
                <Stack spacing={2} divider={<Divider />}>
                  {roadmapData.prioritized_skills && roadmapData.prioritized_skills.length > 0 ? (
                    roadmapData.prioritized_skills.map((item, idx) => (
                      <Box key={idx} sx={{ py: 0.5 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
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
                        <Typography variant="body2" color="text.secondary">
                          {item.rationale}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.disabled">No prioritized gaps compiled.</Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* Right Column: Weekly Study Plan Timeline */}
        <Grid item xs={12} md={8}>
          <Card className="glass-card" sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, fontFamily: 'Outfit' }}>
                <TimelineIcon color="primary" />
                Preparation Timeline
              </Typography>

              {roadmapData.study_plan && roadmapData.study_plan.length > 0 ? (
                <Stack spacing={4} sx={{ position: 'relative', pl: { xs: 2, sm: 4 }, '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: { xs: '7px', sm: '15px' },
                  top: '8px',
                  bottom: '8px',
                  width: '2px',
                  bgcolor: 'rgba(255, 255, 255, 0.08)'
                }}}>
                  {roadmapData.study_plan.map((step, idx) => (
                    <Box key={idx} sx={{ position: 'relative' }}>
                      {/* Timeline Dot */}
                      <Box 
                        sx={{ 
                          position: 'absolute', 
                          left: { xs: '-25px', sm: '-33px' }, 
                          top: '2px',
                          width: '18px', 
                          height: '18px', 
                          borderRadius: '50%', 
                          bgcolor: '#111827', 
                          border: '4px solid',
                          borderColor: 'primary.main',
                          zIndex: 1
                        }} 
                      />
                      
                      <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', p: 3, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 2, gap: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.light', fontFamily: 'Outfit' }}>
                            {step.week}
                          </Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {step.topic}
                          </Typography>
                        </Stack>
                        
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 600, mb: 0.5 }}>
                            SKILLS COVERED
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {step.skills_covered && step.skills_covered.map((skill, sIdx) => (
                              <Chip key={sIdx} label={skill} size="small" color="secondary" variant="outlined" />
                            ))}
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.04)' }} />
                        
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', fontWeight: 600, mb: 1 }}>
                          STUDY RESOURCES & PRACTICAL TASKS
                        </Typography>
                        <Stack spacing={1}>
                          {step.resources_and_actions && step.resources_and_actions.map((act, aIdx) => (
                            <Box key={aIdx} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                              <ResourceIcon fontSize="small" color="primary" sx={{ mt: 0.2, fontSize: '0.95rem' }} />
                              <Typography variant="body2" color="text.secondary">
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Mentor Summary */}
      {roadmapData.summary && (
        <Card className="glass-card" sx={{ mb: 4, p: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, fontFamily: 'Outfit', color: 'secondary.light' }}>
              Mentor Notes & Guidance
            </Typography>
            <Typography variant="body1" color="text.primary">
              {roadmapData.summary}
            </Typography>
          </CardContent>
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
