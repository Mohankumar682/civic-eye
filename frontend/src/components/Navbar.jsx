import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapPin, ShieldAlert, LogOut, LayoutDashboard, PlusCircle, LogIn, UserPlus } from 'lucide-react';
import NotificationPanel from './NotificationPanel';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <Link to="/" className="brand">
          <ShieldAlert className="brand-icon" size={28} />
          <span className="brand-text text-gradient">CivicEye AI+</span>
        </Link>

        <div className="nav-links">
          <Link to="/map" className="nav-item">
            <MapPin size={18} /> Map View
          </Link>

          {user ? (
            <>
              {user.role !== 'admin' && (
                <Link to="/submit" className="nav-item">
                  <PlusCircle size={18} /> Report Issue
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/dashboard" className="nav-item">
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
              )}
              <NotificationPanel />
              <div className="user-profile">
                <div className="avatar">{user?.name?.charAt(0) || "U".toUpperCase()}</div>
                <button onClick={logout} className="btn-logout" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item btn-secondary btn-sm">
                <LogIn size={16} style={{marginRight:'0.3rem'}}/> Login
              </Link>
              <Link to="/register" className="nav-item btn-primary btn-sm">
                <UserPlus size={16} style={{marginRight:'0.3rem'}}/> Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
