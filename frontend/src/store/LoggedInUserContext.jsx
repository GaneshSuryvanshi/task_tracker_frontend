import { createContext, useContext } from "react";
import {useState, useEffect} from "react";

export const LoggedInUserContext = createContext({
    id: '',
    name: '',
    email: '',
    role:''
});

export const useLoggedInUser = () => useContext(LoggedInUserContext);

export function LoggedInUserProvider({ children }) {
    const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  return (
    <LoggedInUserContext.Provider value={{ user, setUser }}>
      {children}
    </LoggedInUserContext.Provider>
  );
};

