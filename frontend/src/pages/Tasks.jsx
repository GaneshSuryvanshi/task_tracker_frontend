import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoggedInUser } from '../store/LoggedInUserContext';
import { useDispatch, useSelector } from 'react-redux';
import { setTasks } from '../store/tasksSlice';

const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST;
const statusOptions = ['new', 'in-progress', 'blocked', 'completed', 'not started'];

const Tasks = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.projects);
  const users = useSelector((state) => state.users);
  const tasks = useSelector((state) => state.tasks);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialProject = params.get("project") || "";
  const [selectedProject, setSelectedProject] = useState(initialProject);
  const [selectedOwner, setSelectedOwner] = useState("");
  const { user: loggedInUser } = useLoggedInUser();
  const [formData, setFormData] = useState({
    description: '',
    due_date: '',
    status: 'new',
    owner: '',
    project_id: ''
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
    const token = localStorage.getItem('token') || '';
    if (editId !== null) {
      fetch(`${BACKEND_HOST}/tasks/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(updatedTask => {
          const updatedTasks = tasks.map(t => (t.id === updatedTask.id ? updatedTask : t));
          dispatch(setTasks(updatedTasks));
          resetForm();
        });
    } else {
      fetch(`${BACKEND_HOST}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(newTask => {
          dispatch(setTasks([...tasks, newTask]));
          resetForm();
        });
    }
  };

  const resetForm = () => {
    setFormData({ description: '', due_date: '', status: 'new', owner: '', project_id: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (task) => {
    setFormData({
      description: task.description,
      due_date: task.due_date,
      status: task.status,
      owner: task.owner_id,
      project_id: task.project_id
    });
    setEditId(task.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    const token = localStorage.getItem('token') || '';
    fetch(`${BACKEND_HOST}/tasks/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
      .then(() => {
        dispatch(setTasks(tasks.filter(t => t.id !== id)));
      });
  };

  const getProjectName = (id) => {
    const project = projects.find(p => p.id === parseInt(id));
    return project ? project.name : 'N/A';
  };

  const getUserName = (id) => {
    const user = users.find(u => u.id === parseInt(id));
    return user ? user.name : 'N/A';
  };

  const toggleForm = () => {
    resetForm();
    setShowForm(!showForm);
  };

  // Permission helpers
  const isAdmin = loggedInUser.role === 'admin';
  const isTaskCreator = loggedInUser.role === 'task_creator';
  const isNormalUser = loggedInUser.role === 'user';

  // Show all tasks for admin and task_creator, otherwise only assigned tasks
  const visibleTasks = (isAdmin || isTaskCreator)
    ? tasks
    : tasks.filter(task => String(task.owner_id) === String(loggedInUser.id));

  // Filter tasks based on selected project and owner
  const filteredTasks = visibleTasks.filter(task =>
    (selectedProject ? String(task.project_id) === String(selectedProject) : true) &&
    (selectedOwner ? String(task.owner_id) === String(selectedOwner) : true)
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
      {(isAdmin || isTaskCreator) && (
        <button
          onClick={toggleForm}
          className='bg-blue-600 text-white px-4 py-2 rounded mb-4'
        >
          {showForm ? 'Cancel' : 'New Task'}
        </button>
      )}
      {showForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-xl relative">
            <button
              onClick={toggleForm}
              className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4">{editId ? 'Edit Task' : 'Create Task'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(isAdmin || isTaskCreator || (isNormalUser && formData.owner == loggedInUser.id)) ? (
                <>
                  <div>
                    <label className="block font-semibold mb-1">Task Description</label>
                    <input
                      name="description"
                      placeholder="Task Description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                      disabled={isNormalUser && formData.owner == loggedInUser.id}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Due Date</label>
                    <input
                      name="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      disabled={isNormalUser && formData.owner == loggedInUser.id}
                    />
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Owner</label>
                    <select
                      name="owner"
                      value={formData.owner}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                      disabled={isNormalUser && formData.owner == loggedInUser.id}
                    >
                      <option value="">Select User</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Project</label>
                    <select
                      name="project_id"
                      value={formData.project_id}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                      required
                      disabled={isNormalUser && formData.owner == loggedInUser.id}
                    >
                      <option value="">Select Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <p className="text-red-500">You can only update the status of tasks assigned to you.</p>
              )}
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
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={isNormalUser && formData.owner != loggedInUser.id}
                >
                  {editId ? 'Update' : 'Add'} Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="flex justify-end mb-4 gap-4">
        <div className="flex items-center gap-2">
          <label className="font-semibold">Project:</label>
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="font-semibold">Owner:</label>
          <select
            value={selectedOwner}
            onChange={e => setSelectedOwner(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">All Owners</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
      </div>
      {filteredTasks.length === 0 ? (
        <p className="mt-4 text-gray-500">No tasks available.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <h3 className="text-xl mb-2">Task List</h3>
          <table className="min-w-full bg-white border border-stone-300 rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Sr.</th>
                <th className="px-4 py-2 border-b">Task Name</th>
                <th className="px-4 py-2 border-b">Project</th>
                <th className="px-4 py-2 border-b">Due Date</th>
                <th className="px-4 py-2 border-b">Owner</th>
                <th className="px-4 py-2 border-b">Status</th>
                <th className="px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task, idx) => {
                const isAssignedToMe = String(task.owner_id) === String(loggedInUser.id);
                const canEditAll = isAdmin || isTaskCreator;
                const canEditStatus = isNormalUser && isAssignedToMe;
                const canEdit = canEditAll || canEditStatus;
                const canDelete = isAdmin;
                return (
                  <tr key={task.id}>
                    <td className="px-4 py-2 border-b">{idx + 1}</td>
                    <td className="px-4 py-2 border-b">{task.description}</td>
                    <td className="px-4 py-2 border-b">{getProjectName(task.project_id)}</td>
                    <td className="px-4 py-2 border-b">{task.due_date}</td>
                    <td className="px-4 py-2 border-b">{getUserName(task.owner_id)}</td>
                    <td className="px-4 py-2 border-b">{task.status}</td>
                    <td className="px-4 py-2 border-b">
                      {canEdit && (
                        <button
                          onClick={() => handleEdit(task)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Tasks;
