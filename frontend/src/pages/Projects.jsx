import React, { useEffect, useState } from 'react';
import { useLoggedInUser } from '../store/LoggedInUserContext';
import { useDispatch, useSelector } from 'react-redux';
import { setProjects } from '../store/projectsSlice';
import { Link } from 'react-router-dom';
const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST;


const Projects = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.projects);
  const users = useSelector((state) => state.users);
  const { user: loggedInUser } = useLoggedInUser();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    owner: ''
  });

  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);

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

    const payload = { ...formData, owner_id: formData.owner };

    if (editId !== null) {
      fetch(`${BACKEND_HOST}/projects/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(updated => {
          const updatedProjects = projects.map(p => (p.id === updated.id ? updated : p));
          dispatch(setProjects(updatedProjects));
          resetForm();
        });
    } else {
      fetch(`${BACKEND_HOST}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(newProject => {
          dispatch(setProjects([...projects, newProject]));
          resetForm();
        });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', start_date: '', end_date: '', owner: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (project) => {
    setFormData({
      name: project.name,
      description: project.description,
      start_date: project.start_date,
      end_date: project.end_date,
      owner: project.owner_id || project.owner // adapt if needed
    });
    setEditId(project.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm( "All the tasks associated with this project will also be deleted. Are you sure you want to continue?")) return;

    fetch(`${BACKEND_HOST}/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }).then(() => {
      dispatch(setProjects(projects.filter(p => p.id !== id)));
    });
  };

  const toggleForm = () => {
    resetForm();
    setShowForm(!showForm);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Projects</h2>

      {loggedInUser.role === 'admin' && (
        <button
          onClick={toggleForm}
          className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        >
          {showForm ? 'Cancel' : 'New Project'}
        </button>
      )}

      {/* Modal for Add/Edit Project */}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-xl relative">
            <button
              onClick={toggleForm}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">{editId ? 'Edit Project' : 'Create Project'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Project Name</label>
                <input
                  name="name"
                  placeholder="Project Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Description</label>
                <input
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Start Date</label>
                <input
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">End Date</label>
                <input
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Owner</label>
                <select
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={toggleForm}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  {editId ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project list */}
      <div className="mt-6">
        <h3 className="text-xl mb-2">Project List</h3>
        {projects.length === 0 ? (
          <p className="text-gray-500">No projects yet.</p>
        ) : (
          <ul className="space-y-2">
            {projects.map(project => (
              <li key={project.id} className="border p-4 rounded flex justify-between items-start">
                <div>
                  <p><strong>Name:</strong> {project.name}</p>
                  <p><strong>Description:</strong> {project.description}</p>
                  <p><strong>Start:</strong> {project.start_date}</p>
                  <p><strong>End:</strong> {project.end_date}</p>
                  <p><strong>Owner:</strong> {project.owner?.name || 'N/A'}</p>
                </div>
                {loggedInUser.role === 'admin' && (
                  <div className="space-x-2">
                    <Link
                      to={`/tasks?project=${project.id}`}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                    >
                      Tasks
                    </Link>
                    <button
                      onClick={() => handleEdit(project)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
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

export default Projects;
