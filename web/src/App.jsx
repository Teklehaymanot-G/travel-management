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
import WitnessList from "./pages/public/WitnessList";
import WitnessDetail from "./pages/public/WitnessDetail";
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
              <Route path="/witnesses" element={<WitnessList />} />
              <Route path="/witnesses/:id" element={<WitnessDetail />} />
            </>
          ) : user?.role === "MANAGER" || user?.role === "SUPERVISOR" ? (
            <>
              <Route path="/" element={<ManagerAppRouter />} />
              <Route path="/admin/*" element={<ManagerAppRouter />} />
              {/* Public pages accessible even when logged in */}
              <Route path="/witnesses" element={<WitnessList />} />
              <Route path="/witnesses/:id" element={<WitnessDetail />} />
            </>
          ) : user?.role === "TRAVELER" ? (
            <>
              <Route path="/" element={<TravelerAppRouter />} />
              <Route path="/travel/*" element={<TravelerAppRouter />} />
              {/* Public pages accessible even when logged in */}
              <Route path="/witnesses" element={<WitnessList />} />
              <Route path="/witnesses/:id" element={<WitnessDetail />} />
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
