import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaceAutocomplete } from '../hooks/usePlaceAutocomplete';
import { SPORT_TYPES } from '../constants/sports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import API_URL from '../api/config';

function SearchSessionsPage() {
    const navigate = useNavigate();
    const [sportType, setSportType] = useState('');
    const [radius, setRadius] = useState(5000);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState('');

    usePlaceAutocomplete('search-autocomplete-container', setSelectedPlace);

    const handleSearch = async () => {
        if (!selectedPlace) {
            setError('Please select a location');
            return;
        }
        setLoading(true);
        setError('');

        let url = `${API_URL}/api/sessions/search?lat=${selectedPlace.lat}&lng=${selectedPlace.lng}&radius=${radius}`;
        if (sportType && sportType !== 'all') url += `&sport=${sportType}`;

        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();
        setSessions(data);
        setLoading(false);
        setSearched(true);
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold mb-6">Browse Sessions</h1>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Search Filters</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <div id="search-autocomplete-container" className="w-full"></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Sport (optional)</label>
                        <Select value={sportType} onValueChange={setSportType}>
                            <SelectTrigger>
                                <SelectValue placeholder="All sports" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All sports</SelectItem>
                                {SPORT_TYPES.map(sport => (
                                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Radius: {radius / 1000}km
                        </label>
                        <input
                            type="range"
                            min="1000"
                            max="20000"
                            step="1000"
                            value={radius}
                            onChange={e => setRadius(Number(e.target.value))}
                            className="w-full accent-primary"
                        />
                    </div>

                    {error && <p className="text-destructive text-sm">{error}</p>}

                    <Button onClick={handleSearch} disabled={loading}>
                        {loading ? 'Searching...' : 'Search Sessions'}
                    </Button>
                </CardContent>
            </Card>

            {searched && (
                <div className="flex flex-col gap-4">
                    {sessions.length === 0 ? (
                        <p className="text-muted-foreground">
                            No sessions found. Try a larger radius or different sport.
                        </p>
                    ) : (
                        sessions.map(session => (
                            <Card
                                key={session.sessionId}
                                onClick={() => navigate(`/sessions/${session.sessionId}`)}
                                className="cursor-pointer hover:shadow-md transition">
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
                                            <p className="text-muted-foreground text-sm">
                                                Hosted by {session.hostName}
                                            </p>
                                        </div>
                                        <Badge variant="secondary">
                                            {session.currentPlayers}/{session.maxPlayers}
                                        </Badge>
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <Badge variant="outline">{session.sportType}</Badge>
                                        <Badge variant="outline">Age {session.ageMin}–{session.ageMax}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchSessionsPage;