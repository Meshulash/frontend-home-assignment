import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Card,
  CardContent,
  Fade,
  Grow,
  Slide,
  Divider,
} from '@mui/material';

import {
  Person as PersonIcon,
  Security as SecurityIcon,
  AccountCircle as AccountCircleIcon,
  VerifiedUser as VerifiedUserIcon,
  Star as StarIcon,
} from '@mui/icons-material';



interface User {
  username: string;
  role: 'user' | 'admin';
  uuid: string;
}

interface MyAccountProps {
  authToken: string;
  onLogout: () => void;
}

export function MyAccount({ authToken, onLogout }: MyAccountProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Decode JWT to get user info (in a real app, you'd verify the token server-side)
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
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
        }}
      >
        <Typography variant="h6">Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
        }}
      >
        <Typography variant="h6" color="error">
          Failed to load user information
        </Typography>
      </Box>
    );
  }

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'primary' : 'default';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <VerifiedUserIcon /> : <PersonIcon />;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Fade in timeout={800}>
        <Paper elevation={3} sx={{ maxWidth: 800, mx: 'auto', p: 4 }}>
            {/* Header */}
            <Grow in timeout={1000}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    boxShadow: 3,
                  }}
                >
                  <AccountCircleIcon sx={{ fontSize: '3rem' }} />
                </Avatar>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  My Account
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Welcome back, {user.username}!
                </Typography>
              </Box>
            </Grow>

            <Divider sx={{ mb: 4 }} />

            {/* User Information Cards */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
              {/* Username Card */}
              <Box sx={{ flex: 1 }}>
                <Slide direction="up" in timeout={1200}>
                  <Card
                    sx={{
                      height: '100%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255,255,255,0.1)',
                        transform: 'translateX(-100%)',
                        transition: 'transform 0.3s ease',
                      },
                      '&:hover::before': {
                        transform: 'translateX(0)',
                      },
                    }}
                  >
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <PersonIcon sx={{ mr: 1, fontSize: '2rem' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Username
                        </Typography>
                      </Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {user.username}
                      </Typography>
                    </CardContent>
                  </Card>
                </Slide>
              </Box>

              {/* Role Card */}
              <Box sx={{ flex: 1 }}>
                <Slide direction="up" in timeout={1400}>
                  <Card
                    sx={{
                      height: '100%',
                      background: user.role === 'admin' 
                        ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                        : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      color: 'white',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255,255,255,0.1)',
                        transform: 'translateX(-100%)',
                        transition: 'transform 0.3s ease',
                      },
                      '&:hover::before': {
                        transform: 'translateX(0)',
                      },
                    }}
                  >
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <SecurityIcon sx={{ mr: 1, fontSize: '2rem' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Role
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mr: 2 }}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Typography>
                        <Chip
                          icon={getRoleIcon(user.role)}
                          label={user.role === 'admin' ? 'Administrator' : 'Standard User'}
                          color={getRoleColor(user.role)}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Slide>
              </Box>
            </Box>

            {/* UUID Card */}
            <Box sx={{ mb: 3 }}>
              <Slide direction="up" in timeout={1600}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(255,255,255,0.1)',
                      transform: 'translateX(-100%)',
                      transition: 'transform 0.3s ease',
                    },
                    '&:hover::before': {
                      transform: 'translateX(0)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <StarIcon sx={{ mr: 1, fontSize: '2rem', color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        User ID
                      </Typography>
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'rgba(0,0,0,0.05)',
                        p: 2,
                        borderRadius: 2,
                        wordBreak: 'break-all',
                        fontWeight: 500,
                      }}
                    >
                      {user.uuid}
                    </Typography>
                  </CardContent>
                </Card>
              </Slide>
            </Box>

            {/* Additional Features Section */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                Account Features
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                <Chip
                  label="Profile Management"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label="Security Settings"
                  color="secondary"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label="Activity Log"
                  color="success"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
                {user.role === 'admin' && (
                  <Chip
                    label="Admin Panel"
                    color="warning"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            </Box>
                     </Paper>
         </Fade>
       </Box>
   );
 }