import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaceAutocomplete } from '../hooks/usePlaceAutocomplete';

const SPORT_TYPES = ['BASKETBALL', 'FOOTBALL', 'TENNIS', 'VOLLEYBALL', 'SWIMMING'];

function CreateSessionPage() {
    const navigate = useNavigate();

    // Step 1 — sport + location search
    const [sportType, setSportType] = useState('');
    const [radius, setRadius] = useState(5000);
    const [facilities, setFacilities] = useState([]);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Step 2 — session details
    const [title, setTitle] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [endTime, setEndTime] = useState('');
    const [ageMin, setAgeMin] = useState(15);
    const [ageMax, setAgeMax] = useState(99);
    const [maxPlayers, setMaxPlayers] = useState(10);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Google Places Autocomplete
    const [selectedPlace, setSelectedPlace] = useState(null);

    usePlaceAutocomplete('autocomplete-container', setSelectedPlace);

    const handleSearchFacilities = async () => {
        if (!selectedPlace || !sportType) {
            setError('Please select a location and sport type');
            return;
        }
        setSearchLoading(true);
        setError('');

        const res = await fetch(
            `/api/facilities/search?lat=${selectedPlace.lat}&lng=${selectedPlace.lng}&radius=${radius}&sport=${sportType}`,
            { credentials: 'include' }
        );
        const data = await res.json();
        setFacilities(data);
        setSearchLoading(false);

        if (data.length === 0) {
            setError('No facilities found in this area. Try a larger radius.');
        }
    };

    const handleCreateSession = async () => {
        if (!selectedFacility) {
            setError('Please select a facility');
            return;
        }
        setLoading(true);
        setError('');

        const res = await fetch('/api/sessions', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sportType,
                title,
                scheduledAt,
                endTime,
                googlePlaceId: selectedFacility.googlePlaceId,
                facilityName: selectedFacility.name,
                facilityAddress: selectedFacility.address,
                facilityLatitude: selectedFacility.latitude,
                facilityLongitude: selectedFacility.longitude,
                ageMin,
                ageMax,
                maxPlayers
            })
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.message);
            setLoading(false);
            return;
        }

        navigate('/sessions');
    };

    return (
        <div className="max-w-2xl mx-auto p-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Session</h1>

            {/* Step 1 — Find a facility */}
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Step 1 — Find a facility</h2>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
                        <select
                            value={sportType}
                            onChange={e => setSportType(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Select sport</option>
                            {SPORT_TYPES.map(sport => (
                                <option key={sport} value={sport}>{sport}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <div id="autocomplete-container" className="w-full"></div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Radius: {radius/1000}km</label>
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

                    <button
                        onClick={handleSearchFacilities}
                        disabled={searchLoading}
                        className="bg-blue-500 text-white rounded-lg py-2 font-medium hover:bg-blue-600 disabled:opacity-50">
                        {searchLoading ? 'Searching...' : 'Search Facilities'}
                    </button>
                </div>

                {/* Facility results */}
                {facilities.length > 0 && (
                    <div className="mt-4 flex flex-col gap-2">
                        <p className="text-sm text-gray-500">{facilities.length} facilities found — select one:</p>
                        {facilities.map(facility => (
                            <div
                                key={facility.facilityId}
                                onClick={() => setSelectedFacility(facility)}
                                className={`p-3 rounded-lg border cursor-pointer ${
                                    selectedFacility?.facilityId === facility.facilityId
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}>
                                <p className="font-medium text-gray-800">{facility.name}</p>
                                <p className="text-sm text-gray-500">{facility.address}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Step 2 — Session details */}
            {selectedFacility && (
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Step 2 — Session details</h2>

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Sunday morning basketball"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
                                <input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={e => setScheduledAt(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
                                <input
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Min age</label>
                                <input
                                    type="number"
                                    value={ageMin}
                                    onChange={e => setAgeMin(Number(e.target.value))}
                                    min="15" max="99"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max age</label>
                                <input
                                    type="number"
                                    value={ageMax}
                                    onChange={e => setAgeMax(Number(e.target.value))}
                                    min="15" max="99"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Max players</label>
                                <input
                                    type="number"
                                    value={maxPlayers}
                                    onChange={e => setMaxPlayers(Number(e.target.value))}
                                    min="2" max="15"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <button
                            onClick={handleCreateSession}
                            disabled={loading}
                            className="bg-green-500 text-white rounded-lg py-2 font-medium hover:bg-green-600 disabled:opacity-50">
                            {loading ? 'Creating...' : 'Create Session'}
                        </button>
                    </div>
                </div>
            )}

            {error && !selectedFacility && (
                <p className="text-red-500 text-sm mt-4">{error}</p>
            )}
        </div>
    );
}

export default CreateSessionPage;