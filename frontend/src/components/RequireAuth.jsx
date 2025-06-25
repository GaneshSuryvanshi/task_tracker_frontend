import { useLoggedInUser } from "../store/LoggedInUserContext";
import { Navigate } from "react-router-dom";
 
function RequireAuth({ children }) {
  const { user } = useLoggedInUser();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}


export default RequireAuth;