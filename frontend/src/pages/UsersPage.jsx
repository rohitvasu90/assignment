import { useEffect, useState } from 'react';
import { userApi, organizationApi } from '../api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active',
  organizationId: '',
};

export default function UsersPage() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    userApi
      .list()
      .then(({ data }) => {
        setUsers(data.data);
        setError('');
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
    if (isSuperAdmin) {
      organizationApi
        .list()
        .then(({ data }) => setOrganizations(data.data))
        .catch((err) => setError(err.response?.data?.message || 'Failed to load organizations'));
    }
  }, [isSuperAdmin]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      organizationId: organizations[0]?.id?.toString() || '',
    });
    setFormErrors({});
    setError('');
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
      organizationId: user.organization_id?.toString() || '',
    });
    setFormErrors({});
    setError('');
    setModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Invalid email';
    if (!editing && !form.password) errors.password = 'Password is required';
    else if (form.password && form.password.length < 6) errors.password = 'Min 6 characters';
    if (isSuperAdmin && !editing && !form.organizationId) {
      errors.organizationId = 'Organization is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!validate()) return;

    setSubmitting(true);
    const payload = { ...form };
    if (editing && !payload.password) delete payload.password;
    if (!isSuperAdmin) delete payload.organizationId;
    else if (payload.organizationId) payload.organizationId = Number(payload.organizationId);

    try {
      if (editing) {
        await userApi.update(editing.id, payload);
        setSuccess('User updated successfully');
      } else {
        await userApi.create(payload);
        setSuccess('User created successfully');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    setError('');
    try {
      await userApi.delete(id);
      setSuccess('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          Create User
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        {users.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {isSuperAdmin && <th>Organization</th>}
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    {isSuperAdmin && <td>{user.organization_name || '—'}</td>}
                    <td>{user.role.replace('_', ' ')}</td>
                    <td><StatusBadge status={user.status} /></td>
                    <td className="actions">
                      {user.role !== 'super_admin' && (
                        <>
                          <button type="button" className="btn btn-secondary" onClick={() => openEdit(user)}>
                            Edit
                          </button>
                          <button type="button" className="btn btn-danger" onClick={() => handleDelete(user.id)}>
                            Delete
                          </button>
                        </>
                      )}
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
          title={editing ? 'Edit User' : 'Create User'}
          onClose={() => setModalOpen(false)}
          actions={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="user-form" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </>
          }
        >
          <form id="user-form" onSubmit={handleSubmit}>
            {isSuperAdmin && !editing && (
              <div className="form-group">
                <label htmlFor="organizationId">Organization</label>
                <select
                  id="organizationId"
                  value={form.organizationId}
                  onChange={(e) => setForm({ ...form, organizationId: e.target.value })}
                >
                  <option value="">Select organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
                {formErrors.organizationId && (
                  <div className="form-error">{formErrors.organizationId}</div>
                )}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {formErrors.name && <div className="form-error">{formErrors.name}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {formErrors.email && <div className="form-error">{formErrors.email}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="password">{editing ? 'Password (leave blank to keep)' : 'Password'}</label>
              <input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              {formErrors.password && <div className="form-error">{formErrors.password}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select id="role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="user">User</option>
                <option value="org_admin">Org Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
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
