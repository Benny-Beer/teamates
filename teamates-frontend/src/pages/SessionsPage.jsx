import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { SPORT_TYPES } from '../constants/sports';

function SessionsPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('future');
    const [sportFilter, setSportFilter] = useState('');

    useEffect(() => {
        fetch('/api/sessions/my', { credentials: 'include' })
            .then(r => r.json())
            .then(data => {
                setSessions(data);
                setLoading(false);
            });
    }, []);

    const now = new Date();

    const filteredSessions = sessions
        .filter(session => {
            const sessionDate = new Date(session.scheduledAt);
            if (timeFilter === 'future') return sessionDate >= now;
            if (timeFilter === 'past') return sessionDate < now;
            return true;
        })
        .filter(session => {
            if (!sportFilter) return true;
            return session.sportType === sportFilter;
        });

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

            {/* Filters */}
            <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col gap-4">
                <div className="flex items-center gap-6">
                    <span className="text-sm font-medium text-gray-700">Show:</span>
                    {['future', 'past', 'all'].map(option => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="timeFilter"
                                value={option}
                                checked={timeFilter === option}
                                onChange={e => setTimeFilter(e.target.value)}
                                className="accent-blue-500"
                            />
                            <span className="text-sm text-gray-600 capitalize">{option}</span>
                        </label>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700">Sport:</span>
                    <select
                        value={sportFilter}
                        onChange={e => setSportFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">All Sports</option>
                        {SPORT_TYPES.map(sport => (
                            <option key={sport} value={sport}>{sport}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Sessions list */}
            <div className="flex flex-col gap-4">
                {filteredSessions.length === 0 ? (
                    <p className="text-gray-500">No sessions found.</p>
                ) : (
                    filteredSessions.map(session => {
                        const isHost = session.hostId === currentUser?.userId;
                        return (
                            <div
                                key={session.sessionId}
                                onClick={() => navigate(`/sessions/${session.sessionId}`)}
                                className={`rounded-xl shadow p-6 cursor-pointer hover:shadow-md transition border-l-4 ${
                                    isHost
                                        ? 'bg-blue-50 border-blue-400'
                                        : 'bg-green-50 border-green-400'
                                }`}>
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
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                                            {session.currentPlayers}/{session.maxPlayers}
                                        </span>
                                        {isHost ? (
                                            <span className="text-xs font-medium text-blue-600">
                                                👑 Host
                                            </span>
                                        ) : (
                                            <span className="text-xs font-medium text-green-600">
                                                ✓ Joined
                                            </span>
                                        )}
                                    </div>
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
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default SessionsPage;