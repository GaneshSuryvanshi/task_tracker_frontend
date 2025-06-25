import { Link, useLocation } from 'react-router-dom';
import { LoggedInUserProvider, useLoggedInUser} from "../store/LoggedInUserContext";

function Sidebar() {
const { user: loggedInUser } = useLoggedInUser();
  const location = useLocation();

const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/projects', label: 'Projects' },
    { path: '/tasks', label: 'Tasks' },
];

if (loggedInUser.role === "admin") {
    navItems.push({ path: '/users', label: 'Users' });
}

return (
    
    <div className="w-64 h-screen bg-blue-700 text-white fixed top-0 left-0 p-4">
    <h2 className="text-2xl font-bold mb-6">Task Tracker</h2>
    <ul className="space-y-4">
        {navItems.map(item => (
            <li key={item.path}>
                <Link
                    to={item.path}
                    className={`block px-2 py-1 rounded hover:bg-blue-500 ${
                        location.pathname === item.path ? 'bg-blue-600' : ''
                    }`}
                >
                    {item.label}
                </Link>
            </li>
        ))}
    </ul>
</div>
);
}

export default Sidebar;