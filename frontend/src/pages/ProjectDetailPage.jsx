import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { projectApi } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    projectApi
      .get(id)
      .then(({ data }) => setProject(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load project'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!project) return <div className="alert alert-error">Project not found</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/projects" style={{ fontSize: '0.875rem' }}>&larr; Back to Projects</Link>
          <h1 style={{ marginTop: '0.5rem' }}>{project.name}</h1>
        </div>
        <StatusBadge status={project.status} />
      </div>

      <div className="card">
        <dl className="detail-list">
          <dt>Description</dt>
          <dd>{project.description || 'No description'}</dd>

          <dt>Status</dt>
          <dd><StatusBadge status={project.status} /></dd>

          <dt>Owner</dt>
          <dd>{project.owner_name}</dd>

          <dt>Created</dt>
          <dd>{new Date(project.created_at).toLocaleString()}</dd>

          <dt>Last Updated</dt>
          <dd>{new Date(project.updated_at).toLocaleString()}</dd>
        </dl>
      </div>

      <style>{`
        .detail-list {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 1rem;
        }
        .detail-list dt {
          font-weight: 600;
          color: var(--text-muted);
          font-size: 0.875rem;
        }
        .detail-list dd {
          margin: 0;
        }
        @media (max-width: 600px) {
          .detail-list {
            grid-template-columns: 1fr;
            gap: 0.25rem;
          }
        }
      `}</style>
    </div>
  );
}
