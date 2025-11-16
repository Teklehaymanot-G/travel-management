import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Layout from "../components/layout/Layout";
import ManagerPage from "../pages/dashboard/ManagerPage";
import SupervisorPage from "../pages/dashboard/SupervisorPage";
import TravelListPage from "../pages/travels/TravelListPage";
import TravelDetailPage from "../pages/travels/TravelDetailPage";
import TravelCreatePage from "../pages/travels/TravelCreatePage";
import NotFoundPage from "../pages/404";
import { useAuth } from "../contexts/AuthContext";
import BookingManagement from "../components/management/BookingManagement";
import CouponManagement from "../components/management/CouponManagement";
import UserManagement from "../components/management/UserManagement";
import ActivityLog from "../components/management/ActivityLog";
import PaymentManagement from "../components/management/PaymentManagement";
import BankManagement from "../components/management/BankManagement";

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

const ManagerAppRouter = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Main admin layout route - accessible to both roles */}
      <Route
        element={
          <PrivateRoute roles={["MANAGER", "SUPERVISOR"]}>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Default admin route - shows different pages based on role */}
        <Route
          index
          element={
            user?.role === "MANAGER" ? <ManagerPage /> : <SupervisorPage />
          }
        />

        {/* Explicit supervisor route */}
        <Route path="supervisor" element={<SupervisorPage />} />

        {/* Shared routes */}
        <Route path="travels" element={<TravelListPage />} />
        <Route path="travels/new" element={<TravelCreatePage />} />
        <Route path="travels/:id" element={<TravelDetailPage />} />
        <Route path="bookings" element={<BookingManagement />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="banks" element={<BankManagement />} />

        {/* Manager-only routes */}
        <Route
          path="coupons"
          element={
            <PrivateRoute roles={["MANAGER"]}>
              <CouponManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="users"
          element={
            <PrivateRoute roles={["MANAGER"]}>
              <UserManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="activity"
          element={
            <PrivateRoute roles={["MANAGER"]}>
              <ActivityLog />
            </PrivateRoute>
          }
        />
      </Route>

      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default ManagerAppRouter;
