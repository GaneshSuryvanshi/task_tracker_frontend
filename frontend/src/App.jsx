import { LoggedInUserProvider } from "./store/LoggedInUserContext";
import AppRoutes from "./AppRoutes";

function App() {
  return (
    <LoggedInUserProvider>
      <AppRoutes />
    </LoggedInUserProvider>
  );
}

export default App;