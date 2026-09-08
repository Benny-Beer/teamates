import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { SPORT_TYPES } from '../constants/sports';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import API_URL from '../api/config';

function SessionsPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('future');
    const [sportFilter, setSportFilter] = useState('');

    useEffect(() => {
        fetch(`${API_URL}/api/sessions/my`, { credentials: 'include' })
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
            if (!sportFilter || sportFilter === 'all') return true;
            return session.sportType === sportFilter;
        });

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">
                    Welcome, {currentUser?.firstName}! 👋
                </h1>
                <Button onClick={() => navigate('/sessions/create')}>
                    + Create Session
                </Button>
            </div>

            <Card className="mb-6">
                <CardContent className="pt-4 flex flex-col gap-4">
                    <div className="flex items-center gap-6">
                        <span className="text-sm font-medium">Show:</span>
                        {['future', 'past', 'all'].map(option => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="timeFilter"
                                    value={option}
                                    checked={timeFilter === option}
                                    onChange={e => setTimeFilter(e.target.value)}
                                    className="accent-primary"
                                />
                                <span className="text-sm text-muted-foreground capitalize">{option}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">Sport:</span>
                        <Select value={sportFilter} onValueChange={setSportFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="All Sports" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sports</SelectItem>
                                {SPORT_TYPES.map(sport => (
                                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
                {filteredSessions.length === 0 ? (
                    <p className="text-muted-foreground">No sessions found.</p>
                ) : (
                    filteredSessions.map(session => {
                        const isHost = session.hostId === currentUser?.userId;
                        return (
                            <Card
                                key={session.sessionId}
                                onClick={() => navigate(`/sessions/${session.sessionId}`)}
                                className={`cursor-pointer hover:shadow-md transition border-l-4 ${
                                    isHost ? 'border-l-blue-400 bg-blue-50' : 'border-l-green-400 bg-green-50'
                                }`}>
                                <CardContent className="pt-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-lg font-bold">
                                                {session.title || session.sportType}
                                            </h2>
                                            <p className="text-muted-foreground text-sm">{session.facilityName}</p>
                                            <p className="text-muted-foreground text-sm">
                                                {new Date(session.scheduledAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge variant="secondary">
                                                {session.currentPlayers}/{session.maxPlayers}
                                            </Badge>
                                            {isHost ? (
                                                <span className="text-xs font-medium text-blue-600">👑 Host</span>
                                            ) : (
                                                <span className="text-xs font-medium text-green-600">✓ Joined</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <Badge variant="outline">{session.sportType}</Badge>
                                        <Badge variant="outline">Age {session.ageMin}–{session.ageMax}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}

export default SessionsPage;