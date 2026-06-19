import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm px-8 py-4 flex items-center justify-between">
            <Link to="/sessions" className="text-xl font-bold text-blue-500">
                Teamates 🏀
            </Link>
            <div className="flex items-center gap-6">
                <Link to="/sessions" className="text-gray-600 hover:text-blue-500">
                    My Sessions
                </Link>
                <Link to="/sessions/search" className="text-gray-600 hover:text-blue-500">
                    Browse
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-blue-500">
                    Profile
                </Link>
                <span className="text-gray-500 text-sm">
                    {currentUser?.firstName}
                </span>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-red-600">
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;