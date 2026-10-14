import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
        TutorialPlatform
      </Link>
      
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            {profile?.role === 'admin' && (
              <Link to="/admin" className="text-gray-300 hover:text-white transition text-sm font-medium">Admin Panel</Link>
            )}
            <div className="text-sm text-gray-400 flex items-center">
              {profile?.name || user.email}
              {profile?.role === 'student' && !profile?.is_paid && (
                <span className="ml-2 text-xs bg-red-900/50 text-red-400 px-2 py-0.5 rounded-full border border-red-800">Unpaid</span>
              )}
            </div>
            <button onClick={handleLogout} className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition font-medium cursor-pointer">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-300 hover:text-white transition text-sm font-medium">Login</Link>
            <Link to="/register" className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-medium">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
