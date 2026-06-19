import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function SessionsPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/sessions/my', { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                setSessions(data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Welcome, {currentUser?.firstName}! 👋
                </h1>
                <button
                    onClick={() => navigate('/sessions/create')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    + Create Session
                </button>
            </div>

            <h2 className="text-lg font-semibold text-gray-700 mb-4">My Sessions</h2>

            <div className="flex flex-col gap-4">
                {sessions.length === 0 ? (
                    <p className="text-gray-500">No sessions yet. Create one or browse nearby sessions!</p>
                ) : (
                    sessions.map(session => (
                        <div
                            key={session.sessionId}
                            onClick={() => navigate(`/sessions/${session.sessionId}`)}
                            className="bg-white rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">
                                        {session.title || session.sportType}
                                    </h2>
                                    <p className="text-gray-500 text-sm">{session.facilityName}</p>
                                    <p className="text-gray-500 text-sm">
                                        {new Date(session.scheduledAt).toLocaleString()}
                                    </p>
                                </div>
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                    {session.currentPlayers}/{session.maxPlayers}
                                </span>
                            </div>
                            <div className="mt-2 flex gap-2">
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    {session.sportType}
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    Age {session.ageMin}–{session.ageMax}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default SessionsPage;