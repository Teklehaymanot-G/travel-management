import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "../components/layout/Layout";
import TravelListPage from "../pages/travels/TravelListPage";
import TravelDetailPage from "../pages/travels/TravelDetailPage";
import TravelRegisterPage from "../pages/travels/TravelRegisterPage";
import NotFoundPage from "../pages/404";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = ({ roles, children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children ? children : <Outlet />;
};

const TravelerAppRouter = () => {
  return (
    <Routes>
      {/* Traveler layout route - accessible to TRAVELER role */}
      <Route
        element={
          <PrivateRoute roles={["TRAVELER"]}>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Default traveler route */}
        <Route index element={<TravelListPage />} />
        <Route path="travels" element={<TravelListPage />} />
        <Route path="travels/:id" element={<TravelDetailPage />} />
        <Route path="travels/:id/register" element={<TravelRegisterPage />} />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default TravelerAppRouter;
