import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useLoggedInUser } from "./store/LoggedInUserContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Users from "./pages/Users";
import Login from "./components/Login";
import RequireAuth from "./components/RequireAuth";
const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST;


function AppRoutes() {
    const { user: loggedInUser } = useLoggedInUser();
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        Promise.all([
            fetch(`${BACKEND_HOST}/users`).then(res => res.json()),
            fetch(`${BACKEND_HOST}/projects`).then(res => res.json()),
            fetch(`${BACKEND_HOST}/tasks`).then(res => res.json())
        ])
            .then(([users, projects, tasks]) => {
                setUsers(users);
                setProjects(projects);
                setTasks(tasks);
            })
            .catch(err => console.error('Error fetching data:', err));
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                    path="/*"
                    element={
                        <RequireAuth>
                            <Navbar />
                            <div className="flex">
                                <Sidebar />
                                <div className="ml-64 w-full p-6">
                                    <Routes>
                                        <Route path="/" element={<Dashboard users={users} tasks={tasks} projects={projects} />} />
                                        <Route path="/projects" element={<Projects users={users} projects={projects} setProjects={setProjects} />} />
                                        <Route path="/tasks" element={<Tasks users={users} tasks={tasks} projects={projects} setTasks={setTasks} />} />
                                        {loggedInUser?.role === "admin" && (
                                            <Route path="/users" element={<Users users={users} setUsers={setUsers} />} />
                                        )}
                                    </Routes>
                                </div>
                            </div>
                        </RequireAuth>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;