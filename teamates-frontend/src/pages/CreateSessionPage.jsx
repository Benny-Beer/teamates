import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlaceAutocomplete } from '../hooks/usePlaceAutocomplete';
import { SPORT_TYPES } from '../constants/sports';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function CreateSessionPage() {
    const navigate = useNavigate();

    const [sportType, setSportType] = useState('');
    const [radius, setRadius] = useState(5000);
    const [facilities, setFacilities] = useState([]);
    const [selectedFacility, setSelectedFacility] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    const [title, setTitle] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [endTime, setEndTime] = useState('');
    const [ageMin, setAgeMin] = useState(15);
    const [ageMax, setAgeMax] = useState(99);
    const [maxPlayers, setMaxPlayers] = useState(10);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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
            <h1 className="text-2xl font-bold mb-6">Create Session</h1>

            {/* Step 1 — Find a facility */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Step 1 — Find a facility</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Sport</label>
                        <Select value={sportType} onValueChange={setSportType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select sport" />
                            </SelectTrigger>
                            <SelectContent>
                                {SPORT_TYPES.map(sport => (
                                    <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Location</label>
                        <div id="autocomplete-container" className="w-full"></div>
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

                    {error && !selectedFacility && (
                        <p className="text-destructive text-sm">{error}</p>
                    )}

                    <Button
                        onClick={handleSearchFacilities}
                        disabled={searchLoading}>
                        {searchLoading ? 'Searching...' : 'Search Facilities'}
                    </Button>

                    {/* Facility results */}
                    {facilities.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground">
                                {facilities.length} facilities found — select one:
                            </p>
                            {facilities.map(facility => (
                                <div
                                    key={facility.facilityId}
                                    onClick={() => setSelectedFacility(facility)}
                                    className={`p-3 rounded-lg border cursor-pointer transition ${
                                        selectedFacility?.facilityId === facility.facilityId
                                            ? 'border-primary bg-primary/5'
                                            : 'border-border hover:border-primary/50'
                                    }`}>
                                    <p className="font-medium text-sm">{facility.name}</p>
                                    <p className="text-sm text-muted-foreground">{facility.address}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Step 2 — Session details */}
            {selectedFacility && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Step 2 — Session details</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title (optional)</label>
                            <Input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Sunday morning basketball"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start time</label>
                                <Input
                                    type="datetime-local"
                                    value={scheduledAt}
                                    onChange={e => setScheduledAt(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End time</label>
                                <Input
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Min age</label>
                                <Input
                                    type="number"
                                    value={ageMin}
                                    onChange={e => setAgeMin(Number(e.target.value))}
                                    min="15" max="99"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Max age</label>
                                <Input
                                    type="number"
                                    value={ageMax}
                                    onChange={e => setAgeMax(Number(e.target.value))}
                                    min="15" max="99"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Max players</label>
                                <Input
                                    type="number"
                                    value={maxPlayers}
                                    onChange={e => setMaxPlayers(Number(e.target.value))}
                                    min="2" max="15"
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-destructive text-sm">{error}</p>
                        )}

                        <Button
                            onClick={handleCreateSession}
                            disabled={loading}>
                            {loading ? 'Creating...' : 'Create Session'}
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default CreateSessionPage;