import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

function SessionDetailPage() {
    const { sessionId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [session, setSession] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

    const [editing, setEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editScheduledAt, setEditScheduledAt] = useState('');
    const [editEndTime, setEditEndTime] = useState('');
    const [editAgeMin, setEditAgeMin] = useState('');
    const [editAgeMax, setEditAgeMax] = useState('');
    const [editMaxPlayers, setEditMaxPlayers] = useState('');
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');

    const fetchSession = async () => {
        const [sessionRes, regRes] = await Promise.all([
            fetch(`/api/sessions/${sessionId}`, { credentials: 'include' }),
            fetch(`/api/sessions/${sessionId}/registrations`, { credentials: 'include' })
        ]);
        const sessionData = await sessionRes.json();
        const regData = await regRes.json();
        setSession(sessionData);
        setRegistrations(regData);
        setLoading(false);
    };

    useEffect(() => {
        fetchSession();
    }, [sessionId]);

    const isHost = session?.hostId === currentUser?.userId;
    const isRegistered = registrations.some(r => r.user.userId === currentUser?.userId);
    const isFull = session?.currentPlayers >= session?.maxPlayers;
    const othersRegistered = session?.currentPlayers > 1;

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

    const userAge = calculateAge(currentUser?.birthDate);
    const ageEligible = userAge >= session?.ageMin && userAge <= session?.ageMax;
    const genderEligible = !session?.genderPreference ||
        session?.genderPreference === currentUser?.gender;
    const isEligible = ageEligible && genderEligible;

    const handleStartEdit = () => {
        setEditTitle(session.title || '');
        setEditScheduledAt(session.scheduledAt ? session.scheduledAt.slice(0, 16) : '');
        setEditEndTime(session.endTime ? session.endTime.slice(0, 16) : '');
        setEditAgeMin(session.ageMin || '');
        setEditAgeMax(session.ageMax || '');
        setEditMaxPlayers(session.maxPlayers || '');
        setEditError('');
        setEditing(true);
    };

    const handleSaveEdit = async () => {
        setEditSaving(true);
        setEditError('');
        const res = await fetch(`/api/sessions/${sessionId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: editTitle || null,
                scheduledAt: editScheduledAt || null,
                endTime: editEndTime || null,
                ageMin: editAgeMin ? Number(editAgeMin) : null,
                ageMax: editAgeMax ? Number(editAgeMax) : null,
                maxPlayers: editMaxPlayers ? Number(editMaxPlayers) : null,
            })
        });
        if (res.ok) {
            await fetchSession();
            setEditing(false);
        } else {
            const data = await res.json();
            setEditError(data.message);
        }
        setEditSaving(false);
    };

    const handleJoin = async () => {
        setActionLoading(true);
        setError('');
        const res = await fetch(`/api/sessions/${sessionId}/join`, {
            method: 'POST',
            credentials: 'include'
        });
        if (res.ok) {
            await fetchSession();
        } else {
            const data = await res.json();
            setError(data.message);
        }
        setActionLoading(false);
    };

    const handleLeave = async () => {
        setActionLoading(true);
        setError('');
        const res = await fetch(`/api/sessions/${sessionId}/leave`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (res.ok) {
            await fetchSession();
        } else {
            const data = await res.json();
            setError(data.message);
        }
        setActionLoading(false);
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this session?')) return;
        setActionLoading(true);
        const res = await fetch(`/api/sessions/${sessionId}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        if (res.ok) {
            navigate('/sessions');
        } else {
            const data = await res.json();
            setError(data.message);
            setActionLoading(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;
    if (!session) return <div className="p-8">Session not found.</div>;

    return (
        <div className="max-w-2xl mx-auto p-8">
            <Button
                variant="ghost"
                onClick={() => navigate('/sessions')}
                className="mb-4 pl-0">
                ← Back to sessions
            </Button>

            {/* Session info */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">
                                {session.title || session.sportType}
                            </CardTitle>
                            <p className="text-muted-foreground mt-1">{session.sportType}</p>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                            {session.currentPlayers}/{session.maxPlayers} players
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                    <p>📍 {session.facilityName} — {session.facilityAddress}</p>
                    <p>📅 {new Date(session.scheduledAt).toLocaleString()}</p>
                    <p>⏱ Until {new Date(session.endTime).toLocaleString()}</p>
                    <p>👤 Hosted by {session.hostName}</p>
                    <p>🎂 Age {session.ageMin}–{session.ageMax}</p>
                    {session.genderPreference && (
                        <p>⚤ {session.genderPreference} only</p>
                    )}

                    {/* Edit form */}
                    {editing && (
                        <>
                            <Separator className="my-2" />
                            {othersRegistered && (
                                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-2 rounded-lg text-sm">
                                    ⚠️ Other players are registered — only the title can be edited.
                                </div>
                            )}
                            <div className="flex flex-col gap-3 mt-2">
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-1 block">Title</label>
                                    <Input
                                        value={editTitle}
                                        onChange={e => setEditTitle(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1 block">Start time</label>
                                        <Input
                                            type="datetime-local"
                                            value={editScheduledAt}
                                            onChange={e => setEditScheduledAt(e.target.value)}
                                            disabled={othersRegistered}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1 block">End time</label>
                                        <Input
                                            type="datetime-local"
                                            value={editEndTime}
                                            onChange={e => setEditEndTime(e.target.value)}
                                            disabled={othersRegistered}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1 block">Min age</label>
                                        <Input
                                            type="number"
                                            value={editAgeMin}
                                            onChange={e => setEditAgeMin(e.target.value)}
                                            disabled={othersRegistered}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1 block">Max age</label>
                                        <Input
                                            type="number"
                                            value={editAgeMax}
                                            onChange={e => setEditAgeMax(e.target.value)}
                                            disabled={othersRegistered}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-foreground mb-1 block">Max players</label>
                                        <Input
                                            type="number"
                                            value={editMaxPlayers}
                                            onChange={e => setEditMaxPlayers(e.target.value)}
                                            disabled={othersRegistered}
                                        />
                                    </div>
                                </div>
                                {editError && <p className="text-destructive text-sm">{editError}</p>}
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSaveEdit}
                                        disabled={editSaving}
                                        className="flex-1">
                                        {editSaving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setEditing(false)}
                                        className="flex-1">
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Action buttons */}
                    <div className="mt-4 flex flex-col gap-2">
                        {error && <p className="text-destructive text-sm">{error}</p>}
                        {isHost ? (
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleStartEdit}
                                    disabled={editing}
                                    className="flex-1">
                                    ✏️ Edit Session
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={actionLoading}
                                    className="flex-1">
                                    {actionLoading ? 'Deleting...' : 'Delete Session'}
                                </Button>
                            </div>
                        ) : isRegistered ? (
                            <Button
                                variant="outline"
                                onClick={handleLeave}
                                disabled={actionLoading}
                                className="w-full">
                                {actionLoading ? 'Leaving...' : 'Leave Session'}
                            </Button>
                        ) : !isEligible ? (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                                {!ageEligible && <p>❌ You don't meet the age requirement (age {session.ageMin}–{session.ageMax})</p>}
                                {!genderEligible && <p>❌ This session is for {session.genderPreference} players only</p>}
                            </div>
                        ) : (
                            <Button
                                onClick={handleJoin}
                                disabled={actionLoading || isFull}
                                className="w-full">
                                {isFull ? 'Session Full' : actionLoading ? 'Joining...' : 'Join Session'}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Players list */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Players ({registrations.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col gap-3">
                        {registrations.map(reg => (
                            <div key={reg.registrationId} className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium text-sm">
                                    {reg.user.firstName[0]}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">
                                        {reg.user.firstName} {reg.user.lastName}
                                        {reg.user.userId === session.hostId && (
                                            <Badge variant="outline" className="ml-2 text-xs">Host</Badge>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Joined {new Date(reg.registeredAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default SessionDetailPage;