import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                <span className="text-xl font-bold text-blue-600">
                  Travel Admin
                </span>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="ml-4 flex items-center md:ml-6">
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <span className="mr-2 text-gray-700">{user.name}</span>
                    <button
                      onClick={logout}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-blue-600">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
