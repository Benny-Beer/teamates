import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
    const { login, currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate('/sessions');
        }
    }, [currentUser, navigate]);

    const authWithProvider = async (provider, token) => {
        const res = await fetch(`/api/auth/${provider}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const user = await res.json();
        login(user);

        if (!user.isProfileComplete) {
            navigate('/complete-profile');
        } else {
            navigate('/sessions');
        }
    };

    const handleGoogleResponse = async (response) => {
        await authWithProvider('google', response.credential);
    };

    useEffect(() => {
        window.handleGoogleResponse = handleGoogleResponse;

        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,                callback: handleGoogleResponse
            });
            window.google.accounts.id.renderButton(
                document.getElementById('g_id_signin_btn'),
                { type: 'standard', size: 'large', theme: 'outline', text: 'sign_in_with', shape: 'rectangular' }
            );
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6 w-full max-w-sm">
                <h1 className="text-3xl font-bold text-gray-800">Teamates 🏀</h1>
                <p className="text-gray-500 text-center">Find people to play sports with</p>
                <div
                    id="g_id_signin_btn">
                </div>
            </div>
        </div>
    );
}

export default LoginPage;