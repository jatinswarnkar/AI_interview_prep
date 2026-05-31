import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Grid,
  Chip, IconButton, alpha, CircularProgress, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as ResumeIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Pending as ProgressIcon
} from '@mui/icons-material';
import { createSession, getSession, deleteSession } from '../api/client';
import axios from 'axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/sessions/');
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
        return <Chip icon={<ProgressIcon />} label={status} color="primary" size="small" variant="filled" className="animate-pulse" />;
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
          p: { xs: 3, md: 5 }, 
          mb: 4, 
          borderRadius: 3, 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 800 }}>
          Master Your Next <Box component="span" sx={{ color: 'primary.light' }}>Tech Interview</Box>
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '700px', mb: 4, fontSize: { xs: '1rem', md: '1.1rem' } }}>
          Upload your resume and paste a target job description. Our multi-agent AI pipeline built on 
          <strong> LangGraph</strong> and <strong>RAG</strong> will analyze skills gaps, generate grounded interview questions, and build a customized timeline-based study plan.
        </Typography>
        
        <Button 
          variant="contained" 
          size="large" 
          startIcon={<AddIcon />} 
          onClick={handleStartSession}
          sx={{ px: 4, py: 1.5, fontSize: '1rem' }}
        >
          Create New Prep Session
        </Button>
      </Box>

      {/* Sessions History */}
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, fontFamily: 'Outfit' }}>
        Prep Sessions History
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Card sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error" variant="body1" sx={{ fontWeight: 600 }}>{error}</Typography>
            <Button onClick={fetchSessions} variant="outlined" color="error" sx={{ mt: 2 }}>Retry Connection</Button>
          </CardContent>
        </Card>
      ) : sessions.length === 0 ? (
        <Card className="glass-card">
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No prep sessions found.
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3, maxWidth: '400px', mx: 'auto' }}>
              Create your first preparation session by uploading a resume and specifying your target role.
            </Typography>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleStartSession}>
              Start First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} className="glass-card" sx={{ background: 'none' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ borderBottom: '2px solid rgba(255, 255, 255, 0.08)' }}>
                <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Prep Session</Typography></TableCell>
                <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Created Date</Typography></TableCell>
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
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.02)' },
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, color: 'primary.light' }}>
                    Session #{session.session_number}
                  </TableCell>
                  <TableCell color="text.secondary">
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
                        color={session.status === 'COMPLETED' ? 'secondary' : 'primary'}
                        startIcon={<ResumeIcon />}
                        onClick={() => handleResumeSession(session)}
                      >
                        {session.status === 'COMPLETED' ? 'View Results' : 'Resume'}
                      </Button>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={(e) => handleDeleteSession(session.id, e)}
                        sx={{ border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 1 }}
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
