import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Chip,
  CircularProgress, Alert, Accordion, AccordionSummary,
  AccordionDetails, Stack, Badge, Divider, Button, useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  HelpOutline as QuestionIcon,
  DoneOutline as AnswerIcon,
  Lightbulb as TipIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { getSession } from '../api/client';

export default function InterviewQuestions() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await getSession(sessionId);
        setSession(res.data);
        setError(null);
      } catch (err) {
        console.error("Failed to load questions", err);
        setError("Could not retrieve interview questions. Verify backend server is active.");
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) {
      fetchQuestions();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12 }}>
        <CircularProgress size={50} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">Loading Practice Questions...</Typography>
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

  const questionData = session?.questions;

  if (!questionData) {
    return (
      <Card className="glass-card" sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          No interview questions found.
        </Typography>
        <Button variant="contained" onClick={() => navigate(`/session/${sessionId}/jd`)}>
          Trigger Analysis
        </Button>
      </Card>
    );
  }

  const tabsConfig = [
    { label: 'Foundational', key: 'easy_questions', color: 'success' },
    { label: 'Practical', key: 'medium_questions', color: 'primary' },
    { label: 'System Design', key: 'hard_questions', color: 'secondary' },
    { label: 'Behavioral', key: 'behavioral_questions', color: 'warning' },
    { label: 'Company / Domain', key: 'company_questions', color: 'info' },
    { label: 'Follow-ups', key: 'followup_questions', color: 'default' }
  ];

  const currentQuestions = questionData[tabsConfig[activeTab].key] || [];

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, fontFamily: 'Outfit' }}>
        Practice Interview Questions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Step 4 of 5: Review targeted interview questions based on your background and target job description gaps.
      </Typography>

      {/* Tabs Menu */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newTab) => setActiveTab(newTab)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.95rem',
              px: { xs: 2, md: 3 }
            }
          }}
        >
          {tabsConfig.map((tab, idx) => {
            const count = (questionData[tab.key] || []).length;
            return (
              <Tab
                key={tab.label}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    <Chip
                      label={count}
                      size="small"
                      color={tab.color}
                      variant="filled"
                      sx={{ fontSize: '0.75rem', height: 18 }}
                    />
                  </Box>
                }
              />
            );
          })}
        </Tabs>
      </Box>

      {/* Questions List */}
      <Box sx={{ minHeight: '300px' }}>
        {currentQuestions.length === 0 ? (
          <Card className="glass-card" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No questions generated for this category.</Typography>
          </Card>
        ) : (
          currentQuestions.map((q, idx) => (
            <Accordion
              key={idx}
              className="glass-card"
              sx={{
                mb: 2,
                background: 'rgba(17, 24, 39, 0.45) !important',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                '&::before': { display: 'none' }, // removes accordion default top separator
                overflow: 'hidden'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  py: 1,
                  px: 3,
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.01)' }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: 'rgba(99, 102, 241, 0.15)',
                      color: 'primary.light',
                      flexShrink: 0
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>{idx + 1}</Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, pr: 2 }}>
                    {q.question}
                  </Typography>
                </Stack>
              </AccordionSummary>
              
              <AccordionDetails sx={{ px: 3, pb: 3, borderTop: '1px solid rgba(255, 255, 255, 0.05)', bgcolor: 'rgba(0, 0, 0, 0.1)' }}>
                <Box sx={{ mt: 2 }}>
                  {/* Expected Answer Section */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: 'secondary.light', mb: 1 }}>
                    <AnswerIcon fontSize="small" /> Expected Answer Structure
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap', pl: 3, mb: 3 }}>
                    {q.expected_answer}
                  </Typography>
                  
                  <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.05)' }} />

                  {/* Pro Tip Section */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: 'warning.light', mb: 1 }}>
                    <TipIcon fontSize="small" /> Interviewer Pro Tip
                  </Typography>
                  <Box sx={{ pl: 3 }}>
                    <Card sx={{ bgcolor: alpha(theme.palette.warning.main, 0.05), border: `1px solid ${alpha(theme.palette.warning.main, 0.15)}`, p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {q.pro_tip}
                      </Typography>
                    </Card>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      {/* Navigation Buttons */}
      <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/session/${sessionId}/gap`)}
        >
          Back to Gap Analysis
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate(`/session/${sessionId}/roadmap`)}
          sx={{ px: 4 }}
        >
          View Learning Roadmap
        </Button>
      </Stack>
    </Box>
  );
}
