import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Chip,
  CircularProgress, Alert, Accordion, AccordionSummary,
  AccordionDetails, Stack, Divider, Button, useTheme, alpha
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
        setError("Could not retrieve interview questions.");
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
          Run Analysis
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
        Practice Questions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Step 4 of 5: Review targeted interview questions based on your skill gaps. Click a question to reveal the expected answer.
      </Typography>

      {/* Tabs Menu */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newTab) => setActiveTab(newTab)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '0.95rem',
              px: { xs: 2, md: 3 }
            }
          }}
        >
          {tabsConfig.map((tab) => {
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
                      sx={{ fontSize: '0.75rem', height: 20 }}
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
                '&::before': { display: 'none' },
                overflow: 'hidden'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  py: 1,
                  px: 3,
                  '&:hover': { bgcolor: alpha('#F97316', 0.02) }
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      bgcolor: alpha('#F97316', 0.08),
                      color: 'primary.main',
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
              
              <AccordionDetails sx={{ px: 3, pb: 3, borderTop: '1px solid', borderColor: 'divider', bgcolor: '#FAFAF9' }}>
                <Box sx={{ mt: 2 }}>
                  {/* Expected Answer Section */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: 'success.main', mb: 1 }}>
                    <AnswerIcon fontSize="small" /> Expected Answer
                  </Typography>
                  <Typography variant="body2" color="text.primary" sx={{ whiteSpace: 'pre-wrap', pl: 3, mb: 3, lineHeight: 1.7 }}>
                    {q.expected_answer}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />

                  {/* Pro Tip Section */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#F59E0B', mb: 1 }}>
                    <TipIcon fontSize="small" /> Pro Tip
                  </Typography>
                  <Box sx={{ pl: 3 }}>
                    <Card sx={{ bgcolor: alpha('#F59E0B', 0.04), border: '1px solid', borderColor: alpha('#F59E0B', 0.15), p: 2 }}>
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
          View Study Roadmap
        </Button>
      </Stack>
    </Box>
  );
}
