import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import API_URL from '../api/config';

function ProfilePage() {
    const { currentUser, login } = useAuth();
    const [fullUser, setFullUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/users/me`, { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                setFullUser(data);
                setFirstName(data.firstName || '');
                setLastName(data.lastName || '');
                setPhone(data.phone || '');
            });
    }, []);

    const calculateAge = (birthDate) => {
        if (!birthDate) return null;
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');

        const res = await fetch(`${API_URL}/api/users`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, phone })
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.message);
            setLoading(false);
            return;
        }

        login(data);
        setFullUser(data);
        setEditing(false);
        setLoading(false);
    };

    const handleCancel = () => {
        setFirstName(fullUser?.firstName || '');
        setLastName(fullUser?.lastName || '');
        setPhone(fullUser?.phone || '');
        setEditing(false);
        setError('');
    };

    if (!fullUser) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-lg mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Profile</h1>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Account Info</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <p className="text-sm">{fullUser.email}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Synced from Google</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Birth Date</label>
                            <p className="text-sm">{fullUser.birthDate || '—'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Age</label>
                            <p className="text-sm">{calculateAge(fullUser.birthDate) || '—'}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Gender</label>
                        <p className="text-sm">{fullUser.gender || '—'}</p>
                    </div>

                    <Separator />

                    <div>
                        <label className="block text-sm font-medium mb-1">First Name</label>
                        {editing ? (
                            <Input
                                type="text"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                            />
                        ) : (
                            <p className="text-sm">{fullUser.firstName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Last Name</label>
                        {editing ? (
                            <Input
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                            />
                        ) : (
                            <p className="text-sm">{fullUser.lastName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        {editing ? (
                            <Input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="050-1234567"
                            />
                        ) : (
                            <p className="text-sm">{fullUser.phone || '—'}</p>
                        )}
                    </div>

                    {error && <p className="text-destructive text-sm">{error}</p>}

                    <div className="flex gap-2 mt-2">
                        {editing ? (
                            <>
                                <Button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex-1">
                                    {loading ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="flex-1">
                                    Cancel
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={() => setEditing(true)}
                                className="w-full">
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default ProfilePage;