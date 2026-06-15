import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout({ children }) {
  const { user, logout, isSuperAdmin, isOrgAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="container header-inner">
          <Link to="/dashboard" className="logo">
            Organization Portal
          </Link>
          <nav className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            {isSuperAdmin && <Link to="/organizations">Organizations</Link>}
            {(isSuperAdmin || isOrgAdmin) && <Link to="/users">Users</Link>}
            {!isSuperAdmin && <Link to="/projects">Projects</Link>}
          </nav>
          <div className="user-menu">
            <span className="user-info">
              {user?.name} ({user?.role.replace('_', ' ')})
            </span>
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>
      <main className="app-main container">{children}</main>
      <style>{`
        .app-header {
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          padding: 0.75rem 0;
          margin-bottom: 2rem;
        }
        .header-inner {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }
        .logo {
          font-weight: 700;
          font-size: 1.125rem;
          color: var(--text);
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          gap: 1rem;
          flex: 1;
        }
        .nav-links a {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 0.9375rem;
        }
        .nav-links a:hover {
          color: var(--primary);
        }
        .user-menu {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .user-info {
          font-size: 0.875rem;
          color: var(--text-muted);
        }
        .app-main {
          padding-bottom: 2rem;
        }
      `}</style>
    </div>
  );
}
