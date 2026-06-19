import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaceAutocomplete } from '../hooks/usePlaceAutocomplete';

const SPORT_TYPES = ['BASKETBALL', 'FOOTBALL', 'TENNIS', 'VOLLEYBALL', 'SWIMMING'];

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

        let url = `/api/sessions/search?lat=${selectedPlace.lat}&lng=${selectedPlace.lng}&radius=${radius}`;
        if (sportType) url += `&sport=${sportType}`;

        const res = await fetch(url, { credentials: 'include' });
        const data = await res.json();
        setSessions(data);
        setLoading(false);
        setSearched(true);
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Browse Sessions</h1>

            {/* Search filters */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <div id="search-autocomplete-container" className="w-full"></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sport (optional)</label>
                        <select
                            value={sportType}
                            onChange={e => setSportType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">All sports</option>
                            {SPORT_TYPES.map(sport => (
                                <option key={sport} value={sport}>{sport}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Radius: {radius / 1000}km
                        </label>
                        <input
                            type="range"
                            min="1000"
                            max="20000"
                            step="1000"
                            value={radius}
                            onChange={e => setRadius(Number(e.target.value))}
                            className="w-full"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="bg-blue-500 text-white rounded-lg py-2 font-medium hover:bg-blue-600 disabled:opacity-50">
                        {loading ? 'Searching...' : 'Search Sessions'}
                    </button>
                </div>
            </div>

            {/* Results */}
            {searched && (
                <div className="flex flex-col gap-4">
                    {sessions.length === 0 ? (
                        <p className="text-gray-500">No sessions found. Try a larger radius or different sport.</p>
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
                                        <p className="text-gray-400 text-sm">Hosted by {session.hostName}</p>
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
            )}
        </div>
    );
}

export default SearchSessionsPage;