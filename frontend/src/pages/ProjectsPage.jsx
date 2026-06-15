import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { projectApi } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const emptyForm = { name: '', description: '', status: 'pending' };

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', status: '', sort: 'created_at', order: 'desc' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchProjects = useCallback((page = 1) => {
    setLoading(true);
    const params = Object.fromEntries(
      Object.entries({ page, limit: 10, ...filters }).filter(([, value]) => value !== '')
    );
    projectApi
      .list(params)
      .then(({ data }) => {
        setProjects(data.data);
        setPagination(data.pagination);
        setError('');
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load projects'))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProjects(1), filters.search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchProjects, filters]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditing(project);
    setForm({
      name: project.name,
      description: project.description || '',
      status: project.status,
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editing) {
        await projectApi.update(editing.id, form);
        setSuccess('Project updated successfully');
      } else {
        await projectApi.create(form);
        setSuccess('Project created successfully');
      }
      setModalOpen(false);
      fetchProjects(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    setError('');
    try {
      await projectApi.delete(id);
      setSuccess('Project deleted successfully');
      fetchProjects(pagination.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Projects</h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Create Project
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="filters">
        <input
          type="search"
          placeholder="Search projects..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
        >
          <option value="created_at">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="status">Sort by Status</option>
        </select>
        <select
          value={filters.order}
          onChange={(e) => setFilters({ ...filters, order: e.target.value })}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <LoadingSpinner />
        ) : projects.length === 0 ? (
          <EmptyState message="No projects found" />
        ) : (
          <>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <Link to={`/projects/${project.id}`}>{project.name}</Link>
                      </td>
                      <td><StatusBadge status={project.status} /></td>
                      <td>{project.owner_name}</td>
                      <td>{new Date(project.created_at).toLocaleDateString()}</td>
                      <td className="actions">
                        <button type="button" className="btn btn-secondary" onClick={() => openEdit(project)}>
                          Edit
                        </button>
                        <button type="button" className="btn btn-danger" onClick={() => handleDelete(project.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => fetchProjects(pagination.page - 1)}
              >
                Previous
              </button>
              <span className="page-info">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchProjects(pagination.page + 1)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={editing ? 'Edit Project' : 'Create Project'}
          onClose={() => setModalOpen(false)}
          actions={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="project-form" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </>
          }
        >
          <form id="project-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {formErrors.name && <div className="form-error">{formErrors.name}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
