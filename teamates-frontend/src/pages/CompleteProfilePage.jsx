import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import API_URL from '../api/config';

function CompleteProfilePage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [gender, setGender] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await fetch(`${API_URL}/api/users/complete-profile`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gender, birthDate })
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.message);
            setLoading(false);
            return;
        }

        login(data);
        navigate('/sessions');
    };

    return (
        <div className="min-h-screen bg-muted flex items-center justify-center">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Complete your profile</CardTitle>
                    <p className="text-muted-foreground text-sm">
                        To join and create sessions, complete your profile. You can also do this later from your profile page.
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Gender</label>
                            <Select value={gender} onValueChange={setGender} required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Birth Date</label>
                            <Input
                                type="date"
                                value={birthDate}
                                onChange={e => setBirthDate(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className="text-destructive text-sm">{error}</p>}

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Saving...' : 'Continue'}
                        </Button>
                        <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/sessions')}>
                            Skip for now
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default CompleteProfilePage;