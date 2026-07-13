import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

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
        fetch('/api/users/me', { credentials: 'include' })
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

        const res = await fetch('/api/users', {
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>

            <div className="bg-white rounded-xl shadow p-6">
                <div className="flex flex-col gap-4">

                    {/* Read-only fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <p className="text-gray-800">{fullUser.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5">Synced from Google</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                            <p className="text-gray-800">{fullUser.birthDate || '—'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                            <p className="text-gray-800">{calculateAge(fullUser.birthDate) || '—'}</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <p className="text-gray-800">{fullUser.gender || '—'}</p>
                    </div>

                    <hr className="border-gray-200" />

                    {/* Editable fields */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        {editing ? (
                            <input
                                type="text"
                                value={firstName}
                                onChange={e => setFirstName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="text-gray-800">{fullUser.firstName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        {editing ? (
                            <input
                                type="text"
                                value={lastName}
                                onChange={e => setLastName(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="text-gray-800">{fullUser.lastName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        {editing ? (
                            <input
                                type="tel"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="050-1234567"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        ) : (
                            <p className="text-gray-800">{fullUser.phone || '—'}</p>
                        )}
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex gap-2 mt-2">
                        {editing ? (
                            <>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="flex-1 bg-blue-500 text-white rounded-lg py-2 font-medium hover:bg-blue-600 disabled:opacity-50">
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="flex-1 bg-gray-200 text-gray-700 rounded-lg py-2 font-medium hover:bg-gray-300">
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setEditing(true)}
                                className="w-full bg-blue-500 text-white rounded-lg py-2 font-medium hover:bg-blue-600">
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;