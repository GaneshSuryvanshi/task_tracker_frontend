import { useEffect, useState } from "react";
import { useLoggedInUser } from '../store/LoggedInUserContext';

// If you use Chart.js, install it: npm install chart.js react-chartjs-2
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);


function Dashboard({ projects = [], users = [], tasks = [] }) {
  const {user:loggedInUser} = useLoggedInUser();


  // Calculate stats
  const totalProjects = projects.length;
  const totalUsers = users.length;
  const totalTasks = tasks.length;

  // Pie chart data for task status distribution
  const statusCounts = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        data: Object.values(statusCounts),
        backgroundColor: [
          "#60a5fa", "#fbbf24", "#34d399", "#f87171", "#a78bfa"
        ],
        borderWidth: 1,
      },
    ],
  };

  // Filter tasks assigned to the logged-in user
  const yourTasks = tasks.filter(
    (task) => String(task.owner_id) === String(loggedInUser.id)
  );

  // Overdue tasks: due_date before today and not completed
  const today = new Date();
  const overdueTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    const due = new Date(task.due_date);
    // Not completed and due date before today
    return due < today && task.status !== 'completed';
  });

  // Project-wise number of tasks
  const projectTaskCounts = projects.map(project => ({
    id: project.id,
    name: project.name,
    taskCount: tasks.filter(task => String(task.project_id) === String(project.id)).length
  }));

  const barData = {
    labels: projectTaskCounts.map(p => p.name),
    datasets: [
      {
        label: "Number of Tasks",
        data: projectTaskCounts.map(p => p.taskCount),
        backgroundColor: "#60a5fa",
      },
    ],
  };

  return (
    <div className="dashboard p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-blue-100 rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Total Projects</h3>
          <p className="text-3xl font-bold text-blue-900">{totalProjects}</p>
        </div>
        <div className="bg-green-100 rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-semibold text-green-700 mb-2">Total Users</h3>
          <p className="text-3xl font-bold text-green-900">{totalUsers}</p>
        </div>
        <div className="bg-yellow-100 rounded-lg shadow p-6 text-center">
          <h3 className="text-lg font-semibold text-yellow-700 mb-2">Total Tasks</h3>
          <p className="text-3xl font-bold text-yellow-900">{totalTasks}</p>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Project-wise Task Count</h2>
        <div className="w-full h-80">
          <Bar data={barData} options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { title: { display: true, text: 'Project Name' } },
              y: { title: { display: true, text: 'Number of Tasks' }, beginAtZero: true, precision: 0 }
            }
          }} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;