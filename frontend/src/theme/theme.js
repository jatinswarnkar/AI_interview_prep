import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#F97316',   // Warm Orange
      light: '#FB923C',
      dark: '#EA580C',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1E293B',   // Slate Dark
      light: '#334155',
      dark: '#0F172A',
      contrastText: '#ffffff',
    },
    background: {
      default: '#FAFAF9',   // Warm stone white
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      disabled: '#94A3B8',
    },
    divider: 'rgba(0, 0, 0, 0.06)',
    error: {
      main: '#EF4444',
    },
    success: {
      main: '#22C55E',
    },
    warning: {
      main: '#F59E0B',
    },
    info: {
      main: '#3B82F6',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 800,
      letterSpacing: '-0.02em',
      color: '#1E293B',
    },
    h2: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      color: '#1E293B',
    },
    h3: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 700,
      letterSpacing: '-0.01em',
      color: '#1E293B',
    },
    h4: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
      color: '#1E293B',
    },
    h5: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Outfit", sans-serif',
      fontWeight: 600,
    },
    button: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
    body1: {
      letterSpacing: '0.01em',
      lineHeight: 1.6,
    },
    body2: {
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.35)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #0F172A 0%, #020617 100%)',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
          },
        },
        outlined: {
          borderColor: '#E2E8F0',
          color: '#334155',
          '&:hover': {
            backgroundColor: '#F8FAFC',
            borderColor: '#CBD5E1',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
          transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            borderColor: '#E2E8F0',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #F1F5F9',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #F1F5F9',
          boxShadow: 'none',
          color: '#1E293B',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filledPrimary: {
          backgroundColor: alpha('#F97316', 0.1),
          color: '#EA580C',
          border: `1px solid ${alpha('#F97316', 0.2)}`,
          '&:hover': {
            backgroundColor: alpha('#F97316', 0.18),
          },
        },
        filledSecondary: {
          backgroundColor: alpha('#1E293B', 0.08),
          color: '#334155',
          border: `1px solid ${alpha('#1E293B', 0.12)}`,
          '&:hover': {
            backgroundColor: alpha('#1E293B', 0.14),
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#E2E8F0',
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#F97316',
            },
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: alpha('#F97316', 0.1),
        },
        bar: {
          borderRadius: 8,
          background: 'linear-gradient(90deg, #F97316, #FB923C)',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#F97316',
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          '&.Mui-selected': {
            color: '#F97316',
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          '&::before': {
            display: 'none',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F1F5F9',
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {},
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          '&.Mui-active': {
            color: '#F97316',
          },
          '&.Mui-completed': {
            color: '#22C55E',
          },
        },
      },
    },
  },
});

export default theme;
