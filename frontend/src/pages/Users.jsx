import React, { useState, useEffect } from 'react';

import { useLoggedInUser } from '../store/LoggedInUserContext';
const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST;
const Users = ({ users, setUsers }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '2'
  });

  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [roleOptions, setRoleOptions] = useState({});

  const {user:Loggeduser} = useLoggedInUser();
  console.log('Logged in user:', Loggeduser);

  useEffect(() => {
    fetch(`${BACKEND_HOST}/roles/`)
      .then(response => response.json())
      .then(data => {
        const roleDict = {};
        data.forEach(role => {
          roleDict[role.id] = role.name;
        });
        setRoleOptions(roleDict);
      })
      .catch(error => console.error('Error fetching roles:', error));
  }, []);

  useEffect(() => {
    if (showForm) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showForm]);

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (editId !== null) {
       if (!formData.password) {
      delete formData.password;
    }
      fetch(`${BACKEND_HOST}/users/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(response => response.json())
        .then(updatedUser => {
          setUsers(users.map(u => (u.id === updatedUser.id ? updatedUser : u)));
          resetForm();
        });
    } else {
      fetch(`${BACKEND_HOST}/users/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
        .then(response => response.json())
        .then(newUser => {
          setUsers([...users, newUser]);
          resetForm();
        })
        .catch(err => console.error('Create user error:', err));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role_id: '2' });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = user => {
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role_id: user.role_id
    });
    setEditId(user.id);
    setShowForm(true);
  };

  const handleDelete = id => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    fetch(`${BACKEND_HOST}/users/${id}/`, {
      method: 'DELETE'
    }).then(() => {
      setUsers(users.filter(u => u.id !== id));
    });
  };

  const toggleForm = () => {
    resetForm();
    setShowForm(true);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Users & Roles</h2>

      {/* Only admin can create users */}
      {Loggeduser.role === 'admin' && (
        <button
          onClick={toggleForm}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          New User
        </button>
      )}

      {/* Modal: Only admin can add/edit users */}
      {showForm && Loggeduser.role === 'admin' && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-xl relative">
            <button
              onClick={resetForm}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">{editId ? 'Edit User' : 'Create User'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Name</label>
                <input
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required={!editId} // Only required when creating
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Role</label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                >
                  {Object.entries(roleOptions).map(([id, name]) => (
                    <option key={id} value={id}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  {editId ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="mt-6">
        <h3 className="text-xl mb-2">User List</h3>
        {users.length === 0 ? (
          <p className="text-gray-500">No users yet.</p>
        ) : (
          <ul className="space-y-2">
            {users.map(user => (
              <li key={user.id} className="border p-4 rounded flex justify-between items-start">
                <div>
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {roleOptions[user.role_id] || 'N/A'}</p>
                </div>
                {/* Only admin can edit/delete users */}
                {Loggeduser.role === 'admin' && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(user)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Users;
