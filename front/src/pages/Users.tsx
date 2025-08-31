import { useState, useEffect, type FormEvent, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
// import { Alef } from 'next/font/google'; // If using Next.js, otherwise import Alef via CSS

// --- Theme Setup ---
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
    error: {
      main: '#d32f2f',
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

// --- Types ---
interface User {
  uuid: string;
  username: string;
  role: 'user' | 'admin';
}

interface UsersPageProps {
  authToken: string;
  onLogout: () => void;
}

// --- Main Page ---
export function UsersPage({ authToken, onLogout }: UsersPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch users. You may not have permission.');
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Delete user logic
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    // Optimistically remove admin from UI
    if (userToDelete.role === 'admin') {
      setUsers((prev) => prev.filter((u) => u.uuid !== userToDelete.uuid));
    }

    try {
      const response = await fetch(`/api/users/${userToDelete.uuid}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user.');
      }
      setUserToDelete(null);
      if (userToDelete.role !== 'admin') {
        fetchUsers();
      }
    } catch (err) {
      setNotification((err as Error).message);
      setUserToDelete(null);
      if (userToDelete.role === 'admin') {
        fetchUsers();
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          p: 4,
        }}
      >
        <Paper elevation={3} sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
          <Header onLogout={() => setConfirmLogout(true)} />
          <Box sx={{ mb: 3 }}>
            <Toolbar onOpenCreateModal={() => setIsCreateOpen(true)} />
          </Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <UserTable users={users} onDeleteClick={setUserToDelete} />
          )}
        </Paper>

        {/* Create User Dialog */}
        <CreateUserDialog
          open={isCreateOpen}
          authToken={authToken}
          onClose={() => setIsCreateOpen(false)}
          onUserCreated={() => {
            setIsCreateOpen(false);
            fetchUsers();
          }}
        />

        {/* Confirm Delete Dialog */}
        <ConfirmDeleteDialog
          user={userToDelete}
          open={!!userToDelete}
          onConfirm={handleDeleteUser}
          onCancel={() => setUserToDelete(null)}
        />

        {/* Confirm Logout Dialog */}
        <Dialog open={confirmLogout} onClose={() => setConfirmLogout(false)}>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to log out?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmLogout(false)} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button onClick={onLogout} color="primary" variant="contained">
              Log Out
            </Button>
          </DialogActions>
        </Dialog>

        {/* Notification Snackbar */}
        <Snackbar
          open={!!notification}
          autoHideDuration={5000}
          onClose={() => setNotification(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setNotification(null)} sx={{ width: '100%' }}>
            {notification}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

// --- Header ---
function Header({ onLogout }: { onLogout: () => void }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" sx={{ flexGrow: 1, fontWeight: 700 }}>
        User Management
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        onClick={onLogout}
        sx={{
          borderRadius: 8,
          fontWeight: 600,
        }}
      >
        Logout
      </Button>
    </Box>
  );
}

// --- Toolbar ---
function Toolbar({ onOpenCreateModal }: { onOpenCreateModal: () => void }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        variant="contained"
        color="primary"
        onClick={onOpenCreateModal}
        sx={{
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 1,
        }}
      >
        Create New User
      </Button>
    </Box>
  );
}

// --- User Table ---
function UserTable({
  users,
  onDeleteClick,
}: {
  users: User[];
  onDeleteClick: (user: User) => void;
}) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>UUID</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Role</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow
              key={user.uuid}
              hover
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                },
              }}
            >
              <TableCell>{user.uuid}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.5,
                    bgcolor: user.role === 'admin' ? 'primary.light' : 'grey.200',
                    color: user.role === 'admin' ? 'primary.main' : 'text.primary',
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Box>
              </TableCell>
              <TableCell align="right">
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => onDeleteClick(user)}
                  sx={{
                    borderRadius: 8,
                    fontWeight: 600,
                  }}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// --- Create User Dialog ---
interface CreateUserDialogProps {
  open: boolean;
  authToken: string;
  onClose: () => void;
  onUserCreated: () => void;
}

function CreateUserDialog({
  open,
  authToken,
  onClose,
  onUserCreated,
}: CreateUserDialogProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setUsername('');
      setPassword('');
      setRole('user');
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ username, password, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user.');
      }
      onUserCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
            margin="normal"
            autoFocus
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              value={role}
              label="Role"
              onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          <DialogActions sx={{ mt: 2 }}>
            <Button onClick={onClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create User'}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

// --- Confirm Delete Dialog ---
function ConfirmDeleteDialog({
  user,
  open,
  onConfirm,
  onCancel,
}: {
  user: User | null;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete the user{' '}
          <Box component="span" sx={{ fontWeight: 700 }}>
            {user?.username}
          </Box>
          ? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary" variant="outlined">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
