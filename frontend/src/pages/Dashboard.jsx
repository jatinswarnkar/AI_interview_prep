import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent,
  Chip, IconButton, CircularProgress, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, alpha
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as ResumeIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pending as ProgressIcon
} from '@mui/icons-material';
import { createSession, deleteSession } from '../api/client';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/sessions/`);
      setSessions(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to load sessions", err);
      setError("Unable to load prep sessions. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleStartSession = async () => {
    try {
      const res = await createSession();
      navigate(`/session/${res.data.id}/resume`);
    } catch (err) {
      console.error("Error creating session", err);
      setError("Failed to create a new session. Please check backend.");
    }
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this prep session?")) {
      try {
        await deleteSession(id);
        setSessions(sessions.filter(s => s.id !== id));
      } catch (err) {
        console.error("Error deleting session", err);
      }
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <Chip icon={<SuccessIcon />} label="Completed" color="success" size="small" variant="filled" />;
      case 'FAILED':
        return <Chip icon={<ErrorIcon />} label="Failed" color="error" size="small" variant="filled" />;
      case 'ANALYZING':
      case 'UPLOADING':
        return <Chip icon={<ProgressIcon />} label={status} color="primary" size="small" variant="filled" />;
      default:
        return <Chip label={status} color="default" size="small" variant="outlined" />;
    }
  };

  const handleResumeSession = (session) => {
    if (session.status === 'COMPLETED') {
      navigate(`/session/${session.id}/gap`);
    } else {
      navigate(`/session/${session.id}/resume`);
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          p: { xs: 4, md: 6 }, 
          mb: 4, 
          borderRadius: 4, 
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.06) 0%, rgba(251, 146, 60, 0.04) 100%)',
          border: '1px solid rgba(249, 115, 22, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: '2rem', md: '2.8rem' }, fontWeight: 800 }}>
          Ace Your Next <Box component="span" sx={{ color: 'primary.main' }}>Interview</Box>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '620px', mb: 4, fontSize: { xs: '1rem', md: '1.1rem' } }}>
          Upload your resume and paste a job description. Our AI will analyze skill gaps, generate targeted practice questions, and create a personalized study plan.
        </Typography>
        
        <Button 
          variant="contained" 
          size="large" 
          startIcon={<AddIcon />} 
          onClick={handleStartSession}
          sx={{ px: 5, py: 1.5, fontSize: '1rem' }}
        >
          Start New Prep Session
        </Button>
      </Box>

      {/* Sessions History */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, fontFamily: 'Outfit' }}>
        Your Sessions
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Card sx={{ bgcolor: alpha('#EF4444', 0.04), border: '1px solid', borderColor: alpha('#EF4444', 0.15) }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error" variant="body1" sx={{ fontWeight: 600 }}>{error}</Typography>
            <Button onClick={fetchSessions} variant="outlined" color="error" sx={{ mt: 2 }}>Retry Connection</Button>
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <Card className="glass-card">
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No prep sessions yet.
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3, maxWidth: '400px', mx: 'auto' }}>
              Create your first session to start preparing for your next interview.
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleStartSession}>
              Start First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} className="glass-card">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Session</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Created</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Status</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <TableRow 
                  key={session.id} 
                  onClick={() => handleResumeSession(session)}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(249, 115, 22, 0.03)' },
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Session #{session.session_number}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>
                    {new Date(session.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    {getStatusChip(session.status)}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        variant="outlined"
                        color={session.status === 'COMPLETED' ? 'primary' : 'secondary'}
                        startIcon={<ResumeIcon />}
                        onClick={() => handleResumeSession(session)}
                      >
                        {session.status === 'COMPLETED' ? 'View Results' : 'Resume'}
                      </Button>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        sx={{ border: '1px solid', borderColor: alpha('#EF4444', 0.2), borderRadius: 1.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
