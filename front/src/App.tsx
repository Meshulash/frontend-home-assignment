import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import { UsersPage } from './pages/Users';
import { MyAccount } from './pages/MyAccount';
import { Layout } from './components/Layout';

/**
 * A wrapper component to manage routing logic.
 * We need this because the useNavigate hook can only be used inside a Router component.
 */
function AppRoutes() {
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken'));
  const navigate = useNavigate();

  const handleLoginSuccess = (token: string, role: string) => {
    setAuthToken(token);
    localStorage.setItem('authToken', token);
    
    // Redirect based on role
    if (role === 'admin') {
      navigate('/users'); // Admin goes to user management
    } else {
      navigate('/account'); // Normal users go to their account page
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    localStorage.removeItem('authToken');
    navigate('/login'); // Redirect to login page on logout
  };

  return (
    <Routes>
      <Route path="/login" element={<Login onLogin={handleLoginSuccess} />} />
      <Route
        path="/users"
        element={
          authToken ? (
            <Layout authToken={authToken} onLogout={handleLogout}>
              <UsersPage authToken={authToken} onLogout={handleLogout} />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/account"
        element={
          authToken ? (
            <Layout authToken={authToken} onLogout={handleLogout}>
              <MyAccount authToken={authToken} onLogout={handleLogout} />
            </Layout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      {/* Default route redirects based on auth status */}
      <Route path="*" element={<Navigate to={authToken ? "/account" : "/login"} />} />
    </Routes>
  );
}

// The main App component now just sets up the Router
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
