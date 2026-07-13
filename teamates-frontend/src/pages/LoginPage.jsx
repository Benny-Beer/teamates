import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardContent } from '@/components/ui/card';

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
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse
            });
            window.google.accounts.id.renderButton(
                document.getElementById('g_id_signin_btn'),
                { type: 'standard', size: 'large', theme: 'outline', text: 'sign_in_with', shape: 'rectangular' }
            );
        }
    }, []);

    return (
        <div className="min-h-screen bg-muted flex flex-col items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardContent className="flex flex-col items-center gap-6 pt-10 pb-10">
                    <h1 className="text-3xl font-bold">Teamates 🏀</h1>
                    <p className="text-muted-foreground text-center">
                        Find people to play sports with
                    </p>
                    <div id="g_id_signin_btn"></div>
                </CardContent>
            </Card>
        </div>
    );
}

export default LoginPage;