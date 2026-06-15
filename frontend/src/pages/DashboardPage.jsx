import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

export default function DashboardPage() {
  const { user, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    projectApi
      .dashboardStats()
      .then(({ data }) => setStats(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name}</p>
      </div>

      <div className="stats-grid">
        {isSuperAdmin ? (
          <>
            <div className="stat-card">
              <h3>Organizations</h3>
              <div className="value">{stats?.organizations || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Total Users</h3>
              <div className="value">{stats?.users || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Total Projects</h3>
              <div className="value">{stats?.projects || 0}</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <h3>Users</h3>
              <div className="value">{stats?.users || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Projects</h3>
              <div className="value">{stats?.projects || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Pending</h3>
              <div className="value">{stats?.statusBreakdown?.pending || 0}</div>
            </div>
            <div className="stat-card">
              <h3>In Progress</h3>
              <div className="value">{stats?.statusBreakdown?.in_progress || 0}</div>
            </div>
            <div className="stat-card">
              <h3>Completed</h3>
              <div className="value">{stats?.statusBreakdown?.completed || 0}</div>
            </div>
          </>
        )}
      </div>

      {stats?.recentProjects?.length > 0 && (
        <div className="card">
          <div className="page-header" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem' }}>Recent Projects</h2>
            {!isSuperAdmin && <Link to="/projects" className="btn btn-primary">View All</Link>}
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  {isSuperAdmin && <th>Organization</th>}
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentProjects.map((project) => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    {isSuperAdmin && <td>{project.organization_name}</td>}
                    <td><StatusBadge status={project.status} /></td>
                    <td>{project.owner_name}</td>
                    <td>{new Date(project.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
