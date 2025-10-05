import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import GrayShadeTest from "./components/GrayShadeTest";
import PublicLayout from "./components/layout/PublicLayout";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/auth/LoginPage";
import HomePage from "./pages/public/HomePage";
import ManagerAppRouter from "./routes/ManagerAppRouter";
import TravelerAppRouter from "./routes/TravelerAppRoute";

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          {!user ? (
            <>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/gray-test" element={<GrayShadeTest />} />
            </>
          ) : user?.role === "MANAGER" || user?.role === "SUPERVISOR" ? (
            <>
              <Route path="/" element={<ManagerAppRouter />} />
              <Route path="/admin/*" element={<ManagerAppRouter />} />
            </>
          ) : user?.role === "TRAVELER" ? (
            <>
              <Route path="/" element={<TravelerAppRouter />} />
              <Route path="/travel/*" element={<TravelerAppRouter />} />
            </>
          ) : (
            <Navigate to="/login" />
          )}
        </Route>

        {/* Admin routes - all admin routes are handled by AppRouter */}

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
