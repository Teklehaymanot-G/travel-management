import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Icon from "../ui/Icon";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-panel sticky top-0 z-[30] border-b border-[var(--color-neutral-200)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[var(--radius-lg)] bg-[var(--color-primary-600)] flex items-center justify-center text-white shadow-sm">
              <Icon name="home" size={18} />
            </div>
            <span className="text-lg font-bold ">Travel Admin</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div
                className="hidden md:flex items-center text-sm text-[var(--color-neutral-600)]"
                style={{ color: "#475569" }}
              >
                {user.name}
              </div>
              <button onClick={logout} className="btn-base btn-primary">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-base btn-outline">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
