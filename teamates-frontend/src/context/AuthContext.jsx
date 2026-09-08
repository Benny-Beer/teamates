import { createContext, useContext, useState, useEffect } from 'react';
import API_URL from '../api/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_URL}/api/users/me`, {
            credentials: 'include'
        })
            .then(r => {
                if (r.ok) return r.json();
                return null;
            })
            .then(user => {
                setCurrentUser(user);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const login = (user) => {
        setCurrentUser(user);
    };

    const logout = async () => {
        await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
        setCurrentUser(null);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500">Loading...</p>
        </div>;
    }

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}