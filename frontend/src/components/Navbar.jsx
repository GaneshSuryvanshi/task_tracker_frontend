import { useLoggedInUser } from '../store/LoggedInUserContext';
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { user: Loggeduser, setUser } = useLoggedInUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-gray-100 text-grey-900 flex items-center justify-between px-8 py-4 shadow">
      <div className="text-2xl font-bold tracking-wide">Task Tracker</div>
      <div className="text-lg flex items-center gap-2">
        Hello, <span className="font-semibold">{Loggeduser.name}</span>
        <button
          onClick={handleLogout}
          title="Logout"
          className="ml-2 text-gray-500 hover:text-red-600 text-xl"
        >
          {/* Exit icon (SVG) */}
          <svg xmlns="http://www.w3.org/2000/svg" className="inline w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;