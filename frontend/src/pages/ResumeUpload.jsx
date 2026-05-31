import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Box, Typography, Button, Card, CardContent,
  CircularProgress, Alert, alpha, Chip, Stack, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  CheckCircle as SuccessIcon,
  ArrowForward as ArrowForwardIcon,
  ExpandMore as ExpandMoreIcon,
  AttachFile as FileIcon
} from '@mui/icons-material';
import { uploadResume, getSession } from '../api/client';

export default function ResumeUpload() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [fileName, setFileName] = useState('');

  // Check if session already has resume uploaded
  useEffect(() => {
    const checkExistingResume = async () => {
      try {
        const res = await getSession(sessionId);
        if (res.data.resume) {
          setResumeData(res.data.resume);
          // Extract file name from path
          const path = res.data.resume.file_path || '';
          const parts = path.split('_');
          setFileName(parts.length > 1 ? parts.slice(1).join('_') : 'Resume Uploaded');
        }
      } catch (err) {
        console.error("Error checking session", err);
      }
    };
    if (sessionId) {
      checkExistingResume();
    }
  }, [sessionId]);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setFileName(file.name);
    setLoading(true);
    setError(null);
    
    try {
      const res = await uploadResume(sessionId, file);
      setResumeData(res.data);
    } catch (err) {
      console.error("Resume upload failed", err);
      const errMsg = err.response?.data?.error || "Failed to upload and parse resume file. Ensure the backend is active.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    multiple: false
  });

  const handleNextStep = () => {
    navigate(`/session/${sessionId}/jd`);
  };

  return (
    <Box sx={{ py: 2, maxWidth: '800px', mx: 'auto' }}>
      <Typography variant="h3" sx={{ mb: 1, fontWeight: 700, fontFamily: 'Outfit' }}>
        Upload Your Resume
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Step 1 of 5: Upload your resume in PDF or DOCX format. The agent will parse and structure your skills, projects, and experiences.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card className="glass-card" sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          {!resumeData && !loading ? (
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'rgba(255, 255, 255, 0.12)',
                borderRadius: 2,
                p: 6,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
                bgcolor: isDragActive ? alpha('#6366f1', 0.05) : 'transparent',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(99, 102, 241, 0.02)',
                }
              }}
            >
              <input { ...getInputProps() } />
              <UploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume file'}
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Supports PDF and DOCX (Max 5MB)
              </Typography>
            </Box>
          ) : loading ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Uploading & Parsing Resume...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                SentenceTransformers and PyPDF are extracting text and skills.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <SuccessIcon color="success" sx={{ fontSize: 56, mb: 2 }} />
              <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                Resume Extracted Successfully!
              </Typography>
              
              <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mt: 2, mb: 4 }}>
                <FileIcon fontSize="small" color="primary" />
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {fileName}
                </Typography>
                <Chip label="Parsed" color="success" size="small" variant="filled" />
              </Stack>
              
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNextStep}
                size="large"
                sx={{ px: 4 }}
              >
                Proceed to Job Description
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {resumeData && (
        <Accordion className="glass-card" sx={{ background: 'rgba(17, 24, 39, 0.4) !important' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              View Extracted Text Preview
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box 
              sx={{ 
                maxHeight: '300px', 
                overflowY: 'auto', 
                p: 2, 
                bgcolor: 'rgba(0, 0, 0, 0.2)', 
                borderRadius: 1, 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                whiteSpace: 'pre-wrap',
                textAlign: 'left'
              }}
            >
              {resumeData.raw_text}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
      
      {resumeData && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => setResumeData(null)}>
            Upload Different Resume
          </Button>
        </Box>
      )}
    </Box>
  );
}
