import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = () => {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">
                {user?.role === "MANAGER"
                  ? "Manager Dashboard"
                  : "Supervisor Dashboard"}
              </h1>
            </div> */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
