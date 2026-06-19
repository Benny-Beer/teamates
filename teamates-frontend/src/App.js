import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SessionsPage from './pages/SessionsPage';
import ProtectedRoute from './components/ProtectedRoute';
import CompleteProfilePage from './pages/CompleteProfilePage';
import Navbar from './components/Navbar';
import CreateSessionPage from './pages/CreateSessionPage';
import SessionDetailPage from './pages/SessionDetailPage';
import SearchSessionsPage from './pages/SearchSessionsPage';
import ProfilePage from './pages/ProfilePage';

function App() {
    useEffect(() => {
        // prevent loading twice
        if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

        const mapsScript = document.createElement('script');
        mapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}&libraries=places`;
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
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/sessions" element={
                        <ProtectedRoute>
                            <Navbar />
                            <SessionsPage />
                        </ProtectedRoute>
                    } />
                    <Route path="/complete-profile" element={
                        <ProtectedRoute>
                            <CompleteProfilePage />
                        </ProtectedRoute>
                    } />
                    <Route path="/sessions/create" element={
                        <ProtectedRoute>
                            <>
                                <Navbar />
                                <CreateSessionPage />
                            </>
                        </ProtectedRoute>
                    } />
                    <Route path="/sessions/:sessionId" element={
                        <ProtectedRoute>
                            <>
                                <Navbar />
                                <SessionDetailPage />
                            </>
                        </ProtectedRoute>
                    } />
                    <Route path="/sessions/search" element={
                        <ProtectedRoute>
                            <>
                                <Navbar />
                                <SearchSessionsPage />
                            </>
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <>
                                <Navbar />
                                <ProfilePage />
                            </>
                        </ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;