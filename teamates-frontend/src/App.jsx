import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import SessionsPage from './pages/SessionsPage';
import SessionDetailPage from './pages/SessionDetailPage';
import CreateSessionPage from './pages/CreateSessionPage';
import SearchSessionsPage from './pages/SearchSessionsPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';

function App() {
  useEffect(() => {
    if (document.querySelector('script[src*="maps.googleapis.com"]')) return;
    const mapsScript = document.createElement('script');
    mapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}&libraries=places`;
    mapsScript.async = true;
    mapsScript.defer = true;
    document.body.appendChild(mapsScript);

    if (document.querySelector('script[src*="accounts.google.com/gsi"]')) return;
    const gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    gsiScript.async = true;
    gsiScript.defer = true;
    document.body.appendChild(gsiScript);
  }, []);

  return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage/>}/>
            <Route path="/complete-profile" element={
              <ProtectedRoute><CompleteProfilePage/></ProtectedRoute>
            }/>
            <Route path="/sessions" element={
              <ProtectedRoute>
                <>
                  <Navbar/>
                  <SessionsPage/>
                </>
              </ProtectedRoute>
            }/>
            <Route path="/sessions/create" element={
              <ProtectedRoute>
                <>
                  <Navbar/>
                  <CreateSessionPage/>
                </>
              </ProtectedRoute>
            }/>
            <Route path="/sessions/search" element={
              <ProtectedRoute>
                <>
                  <Navbar/>
                  <SearchSessionsPage/>
                </>
              </ProtectedRoute>
            }/>
            <Route path="/sessions/:sessionId" element={
              <ProtectedRoute>
                <>
                  <Navbar/>
                  <SessionDetailPage/>
                </>
              </ProtectedRoute>
            }/>
            <Route path="/profile" element={
              <ProtectedRoute>
                <>
                  <Navbar/>
                  <ProfilePage/>
                </>
              </ProtectedRoute>
            }/>
            <Route path="*" element={<Navigate to="/login"/>}/>
          </Routes>
        </Router>
      </AuthProvider>
  );
}

export default App;
