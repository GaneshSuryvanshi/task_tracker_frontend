import { createContext, useContext, useState } from "react";


export const LoggedInUserContext = createContext({
    id: '',
    name: '',
    email: '',
    role:''
});

export const useLoggedInUser = () => useContext(LoggedInUserContext);

export function LoggedInUserProvider({ children }) {
    const [user, setUser] = useState(null); 


  return (
    <LoggedInUserContext.Provider value={{ user, setUser }}>
      {children}
    </LoggedInUserContext.Provider>
  );
};

