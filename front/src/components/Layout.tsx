import { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Chip,
} from '@mui/material';
import {
  AccountCircle as AccountCircleIcon,
  Group as GroupIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

// Theme setup
const theme = createTheme({
  typography: {
    fontFamily: 'Alef, Arial, sans-serif',
  },
  palette: {
    background: {
      default: '#f7f8fa',
      paper: '#fff',
    },
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#e0e0e0',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

interface User {
  username: string;
  role: 'user' | 'admin';
  uuid: string;
}

interface LayoutProps {
  children: React.ReactNode;
  authToken: string;
  onLogout: () => void;
}

const drawerWidth = 280;

export function Layout({ children, authToken, onLogout }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Decode JWT to get user info
    try {
      const tokenParts = authToken.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        setUser({
          username: payload.username,
          role: payload.role,
          uuid: payload.uuid,
        });
      }
    } catch (error) {
      console.error('Failed to decode token:', error);
    }
  }, [authToken]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Navigation items based on user role
  const navItems = user?.role === 'admin' 
    ? [
        {
          label: 'User Management',
          icon: <GroupIcon />,
          path: '/users',
        },
        {
          label: 'My Account',
          icon: <AccountCircleIcon />,
          path: '/account',
        },
      ]
    : [
        {
          label: 'My Account',
          icon: <AccountCircleIcon />,
          path: '/account',
        },
      ];

  const drawer = (
    <Box>
      {/* User Profile Section */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: 'primary.main',
            fontSize: '2rem',
            boxShadow: 2,
          }}
        >
          {user?.username[0]?.toUpperCase()}
        </Avatar>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {user?.username}
        </Typography>
        <Chip
          label={user?.role === 'admin' ? 'Administrator' : 'Standard User'}
          color={user?.role === 'admin' ? 'primary' : 'default'}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      <Divider sx={{ mx: 2, mb: 2 }} />

      {/* Navigation Items */}
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.label}
            selected={location.pathname === item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mx: 1,
              mb: 1,
              borderRadius: 2,
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.light',
                },
              },
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.08)',
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                color: 'inherit',
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label} 
              sx={{ 
                '& .MuiListItemText-primary': {
                  fontWeight: location.pathname === item.path ? 600 : 500,
                }
              }}
            />
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mx: 2, my: 2 }} />

      {/* Logout Button */}
      <List>
        <ListItem
          button
          onClick={onLogout}
          sx={{
            mx: 1,
            borderRadius: 2,
            color: 'error.main',
            '&:hover': {
              bgcolor: 'error.light',
              color: 'error.contrastText',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            sx={{ 
              '& .MuiListItemText-primary': {
                fontWeight: 600,
              }
            }}
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: 1,
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
              {location.pathname === '/users' ? 'User Management' : 'My Account'}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
          {/* Mobile drawer */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                bgcolor: 'background.paper',
                borderRight: 0,
              },
            }}
          >
            {drawer}
          </Drawer>

          {/* Desktop drawer */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                bgcolor: 'background.paper',
                borderRight: 0,
                boxShadow: 2,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            pt: { xs: 8, md: 0 },
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
