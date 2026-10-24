import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const navClass = ({ isActive }) => `px-3 py-2 rounded-lg text-sm font-medium transition ${isActive ? 'bg-brand-red text-white' : 'text-white hover:bg-white/10'}`;

  return (
    <nav aria-label="Main navigation" className="bg-brand-purple text-white px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-50 shadow-sm">
      <Link to="/" className="flex items-center gap-3 font-bold text-lg">
        <img src="/logo.svg" alt="" className="h-12 w-12 rounded-lg bg-white object-contain p-1" />
        eZy Account with JB
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        {user ? (
          <>
            {profile?.role === 'admin' && <NavLink to="/admin" className={navClass}>Admin Panel</NavLink>}
            <span className="text-sm text-white/80 max-w-48 truncate">{profile?.name || user.email}</span>
            {profile?.role === 'student' && !profile?.is_paid && <span className="text-xs bg-red-50 text-brand-red px-2 py-1 rounded-full">Unpaid</span>}
            <button onClick={() => { logout(); navigate('/login'); }} className="px-4 py-2 text-sm bg-brand-red hover:bg-brand-red-dark rounded-lg transition font-medium">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={navClass}>Login</NavLink>
            <NavLink to="/register" className={navClass}>Sign Up</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}
