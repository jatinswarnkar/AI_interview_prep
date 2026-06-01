import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, Typography, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton,
  useMediaQuery, useTheme, Divider, Button
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CloudUpload as UploadIcon,
  Description as JDIcon,
  CompareArrows as GapIcon,
  HelpOutline as QuestionIcon,
  Timeline as RoadmapIcon,
  Menu as MenuIcon,
  AddCircleOutline as NewSessionIcon
} from '@mui/icons-material';
import { createSession, getSession } from '../../api/client';

const drawerWidth = 260;

export default function AppLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sessionNum, setSessionNum] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const pathParts = location.pathname.split('/');
  const sessionIndex = pathParts.indexOf('session');
  const sessionId = sessionIndex !== -1 && pathParts[sessionIndex + 1] ? pathParts[sessionIndex + 1] : null;

  useEffect(() => {
    const fetchSessionNum = async () => {
      if (sessionId) {
        try {
          const res = await getSession(sessionId);
          setSessionNum(res.data.session_number);
        } catch (err) {
          console.error("Failed to fetch session number", err);
          setSessionNum(null);
        }
      } else {
        setSessionNum(null);
      }
    };
    fetchSessionNum();
  }, [sessionId]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCreateNewSession = async () => {
    try {
      const res = await createSession();
      const newSessionId = res.data.id;
      navigate(`/session/${newSessionId}/resume`);
      setMobileOpen(false);
    } catch (err) {
      console.error("Failed to create session", err);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/', requiresSession: false },
    { text: '1. Upload Resume', icon: <UploadIcon />, path: sessionId ? `/session/${sessionId}/resume` : '#', requiresSession: true },
    { text: '2. Job Description', icon: <JDIcon />, path: sessionId ? `/session/${sessionId}/jd` : '#', requiresSession: true },
    { text: '3. Gap Analysis', icon: <GapIcon />, path: sessionId ? `/session/${sessionId}/gap` : '#', requiresSession: true },
    { text: '4. Prep Questions', icon: <QuestionIcon />, path: sessionId ? `/session/${sessionId}/questions` : '#', requiresSession: true },
    { text: '5. Learning Roadmap', icon: <RoadmapIcon />, path: sessionId ? `/session/${sessionId}/roadmap` : '#', requiresSession: true },
  ];

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{ fontSize: '1.5rem' }}>🎯</Box>
          Interview Copilot
        </Typography>
      </Toolbar>
      
      <Divider />
      
      <Box sx={{ px: 2, py: 2 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<NewSessionIcon />}
          onClick={handleCreateNewSession}
          sx={{ py: 1.2 }}
        >
          New Prep Session
        </Button>
      </Box>

      <Divider />
      
      <List sx={{ px: 1, flexGrow: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const isDisabled = item.requiresSession && !sessionId;
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) {
                    navigate(item.path);
                    setMobileOpen(false);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  backgroundColor: isActive ? 'rgba(249, 115, 22, 0.08)' : 'transparent',
                  color: isActive ? 'primary.dark' : isDisabled ? 'text.disabled' : 'text.secondary',
                  borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
                  '&:hover': {
                    backgroundColor: isActive ? 'rgba(249, 115, 22, 0.12)' : 'rgba(0, 0, 0, 0.03)',
                    color: isActive ? 'primary.dark' : 'text.primary',
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? 'primary.main' : isDisabled ? 'text.disabled' : 'text.secondary',
                  minWidth: 40 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 500 }} 
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      {sessionId && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', fontWeight: 600 }}>
            Active Session:
            <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: 'primary.main', ml: 0.5 }}>
              #{sessionNum || '...'}
            </Typography>
          </Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` } }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
            {location.pathname === '/' ? 'Dashboard' : (sessionNum ? `Prep Session #${sessionNum}` : 'Interview Copilot')}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sessionId ? 'success.main' : 'warning.main' }} />
            <Typography variant="body2" color="text.secondary">
              {sessionId ? 'Active' : 'No Session'}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="grid-bg" />
        <Box sx={{ flexGrow: 1, width: '100%', maxWidth: '1200px', mx: 'auto' }} className="fade-in">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
