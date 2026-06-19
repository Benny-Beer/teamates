import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SessionDetailPage() {
    const { sessionId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [session, setSession] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');

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
            <button
                onClick={() => navigate('/sessions')}
                className="text-blue-500 hover:underline mb-4 block">
                ← Back to sessions
            </button>

            {/* Session info */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{session.title || session.sportType}</h1>
                        <p className="text-gray-500 mt-1">{session.sportType}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                        {session.currentPlayers}/{session.maxPlayers} players
                    </span>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-gray-600">
                    <p>📍 {session.facilityName} — {session.facilityAddress}</p>
                    <p>📅 {new Date(session.scheduledAt).toLocaleString()}</p>
                    <p>⏱ Until {new Date(session.endTime).toLocaleString()}</p>
                    <p>👤 Hosted by {session.hostName}</p>
                    <p>🎂 Age {session.ageMin}–{session.ageMax}</p>
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex flex-col gap-2">
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {isHost ? (
                        <button
                            onClick={handleDelete}
                            disabled={actionLoading}
                            className="bg-red-500 text-white rounded-lg py-2 font-medium hover:bg-red-600 disabled:opacity-50">
                            {actionLoading ? 'Deleting...' : 'Delete Session'}
                        </button>
                    ) : isRegistered ? (
                        <button
                            onClick={handleLeave}
                            disabled={actionLoading}
                            className="bg-gray-500 text-white rounded-lg py-2 font-medium hover:bg-gray-600 disabled:opacity-50">
                            {actionLoading ? 'Leaving...' : 'Leave Session'}
                        </button>
                    ) : (
                        <button
                            onClick={handleJoin}
                            disabled={actionLoading || isFull}
                            className="bg-blue-500 text-white rounded-lg py-2 font-medium hover:bg-blue-600 disabled:opacity-50">
                            {isFull ? 'Session Full' : actionLoading ? 'Joining...' : 'Join Session'}
                        </button>
                    )}
                </div>
            </div>

            {/* Players list */}
            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Players ({registrations.length})
                </h2>
                <div className="flex flex-col gap-3">
                    {registrations.map(reg => (
                        <div key={reg.registrationId} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                                {reg.user.firstName[0]}
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">
                                    {reg.user.firstName} {reg.user.lastName}
                                    {reg.user.userId === session.hostId && (
                                        <span className="ml-2 text-xs text-blue-500">Host</span>
                                    )}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Joined {new Date(reg.registeredAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SessionDetailPage;