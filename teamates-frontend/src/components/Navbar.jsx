import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function Navbar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-background border-b px-8 py-4 flex items-center justify-between">
            <Link to="/sessions" className="text-xl font-bold text-primary">
                Teamates 🏀
            </Link>
            <div className="flex items-center gap-6">
                <Link to="/sessions" className="text-sm text-muted-foreground hover:text-foreground transition">
                    My Sessions
                </Link>
                <Link to="/sessions/search" className="text-sm text-muted-foreground hover:text-foreground transition">
                    Browse
                </Link>
                <Link to="/profile" className="text-sm text-muted-foreground hover:text-foreground transition">
                    Profile
                </Link>
                <Separator orientation="vertical" className="h-5" />
                <span className="text-sm text-muted-foreground">
                    {currentUser?.firstName}
                </span>
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                    Logout
                </Button>
            </div>
        </nav>
    );
}

export default Navbar;