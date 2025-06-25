import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoggedInUser } from "../store/LoggedInUserContext";
import { auth } from "../firebase"; // <-- import your firebase config
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST;
console.log("Backend host:", BACKEND_HOST);
function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useLoggedInUser();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    console.log("Form submitted:", JSON.stringify(form));
    const res = await fetch(`${BACKEND_HOST}/users/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    console.log("Login response:", res);
    if (res.ok) {
      const user = await res.json();
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/");
    } else {
      setError("Invalid credentials");
    }
    
  };

  // --- Google SSO handler ---
  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      const name = result.user.displayName;
      const idToken = await result.user.getIdToken();

      // Calling backend API with email and token
      const res = await fetch(`${BACKEND_HOST}/users/get_role`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}` // <-- send token in header
        },
      });

      if (res.ok) {
        const { role, id } = await res.json();
        // Set user info: id is empty, name/email from SSO, role from backend
        const user = {
          id: id || "", // Use id from backend if available
          name,
          email,
          role
        };
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/");
      } else {
        setError("User not found in system. Please contact admin.");
      }
    } catch (err) {
      setError("Google SSO failed: " + err.message);
      console.error("Google SSO error:", err);
    }
  };
  return (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="w-full max-w-xs">
      {/* Application Name */}
      <div className="text-3xl font-bold text-center mb-8 text-blue-700 tracking-wide">
        Task Tracker
      </div>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-2"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border p-2 rounded mb-4"
          required
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded" type="submit">
          Login
        </button>
        <div className="my-4 text-center text-gray-500">or</div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-red-600 text-white py-2 rounded flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <g>
              <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z"/>
              <path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.5 6.5 29.6 4 24 4c-7.5 0-13.8 4.1-17.7 10.7z"/>
              <path fill="#FBBC05" d="M24 44c5.6 0 10.5-1.9 14.3-5.1l-6.6-5.4C29.7 35.2 27 36 24 36c-6.1 0-10.7-2.9-13.7-7.1l-7 5.4C10.2 41.9 16.5 44 24 44z"/>
              <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.6 4.1-6.1 7.5-11.7 7.5-6.1 0-10.7-2.9-13.7-7.1l-7 5.4C10.2 41.9 16.5 44 24 44c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.3-4z"/>
            </g>
          </svg>
          Sign in with Google
        </button>
      </form>
    </div>
  </div>
);
}

export default Login;