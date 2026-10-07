import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Card, CardContent } from '@/components/ui/card';
import API_URL from '../api/config';

function LoginPage() {
    const { login, currentUser } = useAuth();
    const navigate = useNavigate();
    const initialized = useRef(false);

    useEffect(() => {
        if (currentUser) {
            navigate('/sessions');
        }
    }, [currentUser, navigate]);

    const authWithProvider = async (provider, token) => {
        const res = await fetch(`${API_URL}/api/auth/${provider}`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Auth failed: ${res.status} ${text}`);
        }

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

        let cancelled = false;

        const initGoogle = () => {
            if (cancelled || initialized.current) return;
            if (!window.google?.accounts?.id) return;

            initialized.current = true;
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse
            });
            window.google.accounts.id.renderButton(
                document.getElementById('g_id_signin_btn'),
                { type: 'standard', size: 'large', theme: 'outline', text: 'sign_in_with', shape: 'rectangular' }
            );
        };

        if (window.google?.accounts?.id) {
            initGoogle();
        } else {
            const intervalId = setInterval(() => {
                if (window.google?.accounts?.id) {
                    clearInterval(intervalId);
                    initGoogle();
                }
            }, 100);
            return () => { cancelled = true; clearInterval(intervalId); };
        }

        return () => { cancelled = true; };
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