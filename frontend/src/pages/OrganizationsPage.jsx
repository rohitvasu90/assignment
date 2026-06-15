import { useEffect, useState } from 'react';
import { organizationApi } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const emptyForm = { name: '', status: 'active' };

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchOrganizations = () => {
    setLoading(true);
    organizationApi
      .list()
      .then(({ data }) => setOrganizations(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load organizations'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (org) => {
    setEditing(org);
    setForm({ name: org.name, status: org.status });
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
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editing) {
        await organizationApi.update(editing.id, form);
        setSuccess('Organization updated successfully');
      } else {
        await organizationApi.create(form);
        setSuccess('Organization created successfully');
      }
      setModalOpen(false);
      fetchOrganizations();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this organization? This will cascade delete all projects.')) return;
    try {
      await organizationApi.delete(id);
      setSuccess('Organization deleted successfully');
      fetchOrganizations();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Organizations</h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Create Organization
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        {organizations.length === 0 ? (
          <EmptyState message="No organizations found" />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id}>
                    <td>{org.id}</td>
                    <td>{org.name}</td>
                    <td><StatusBadge status={org.status} /></td>
                    <td>{new Date(org.created_at).toLocaleDateString()}</td>
                    <td className="actions">
                      <button type="button" className="btn btn-secondary" onClick={() => openEdit(org)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => handleDelete(org.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal
          title={editing ? 'Edit Organization' : 'Create Organization'}
          onClose={() => setModalOpen(false)}
          actions={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="org-form" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </>
          }
        >
          <form id="org-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {formErrors.name && <div className="form-error">{formErrors.name}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
