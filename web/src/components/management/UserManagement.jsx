import React, { useEffect, useState, useCallback } from "react";
import DataGrid from "../../ui/DataGrid";
import FormDialog from "../../ui/FormDialog";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listRoles,
  updateUserRole,
} from "../../services/userService";
import Button from "../../components/ui/Button";

const UserManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filter, setFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listUsers({ page, limit, search, role: filter });
      // API returns { success, data, pagination }
      setUsers(res.data || []);
      setTotal(res.pagination?.total || 0);
    } catch (e) {
      console.error(e);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, filter]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await listRoles();
        setRoles(res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    loadRoles();
  }, []);

  // Inline edit uses setCurrentUser directly; removing unused handleEdit

  const handleCreate = () => {
    setCurrentUser(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (user) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      console.error(e);
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users; // server-side filtered already via API

  // Legacy userActions removed (handled inline in table now)

  // roleOptions replaced by dynamic roles from API

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600">
            Manage travelers, supervisors and managers
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search name or phone"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 w-56 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n}/page
              </option>
            ))}
          </select>
          <Button onClick={handleCreate}>
            <span className="mr-1">＋</span> Create User
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-sm text-gray-600 border-b">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Role</th>
              <th className="p-3">Bookings</th>
              <th className="p-3">Comments</th>
              <th className="p-3">Travels</th>
              <th className="p-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={8}>
                  Loading...
                </td>
              </tr>
            ) : filteredUsers.length ? (
              filteredUsers.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{u.id}</td>
                  <td className="p-3">{u.name || "—"}</td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        u.role === "MANAGER"
                          ? "bg-purple-100 text-purple-800"
                          : u.role === "SUPERVISOR"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">{u._count?.bookings ?? 0}</td>
                  <td className="p-3">{u._count?.comments ?? 0}</td>
                  <td className="p-3">{u._count?.travels ?? 0}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          setIsDialogOpen(true) || setCurrentUser(u)
                        }
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(u)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4" colSpan={8}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {page} / {Math.max(1, Math.ceil(total / limit))} • Total {total}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <Button
            size="sm"
            disabled={page >= Math.ceil(total / limit)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <FormDialog
        isOpen={isDialogOpen}
        className=""
        onClose={() => setIsDialogOpen(false)}
        title={currentUser?.id ? "Edit User" : "Create New User"}
        onSubmit={async () => {
          setSaving(true);
          setError("");
          try {
            if (currentUser?.id) {
              await updateUser(currentUser.id, {
                name: currentUser.name,
                phone: currentUser.phone,
              });
              // Role changes handled separately
              if (currentUser.roleChanged) {
                await updateUserRole(currentUser.id, currentUser.role);
              }
            } else {
              await createUser({
                name: currentUser?.name,
                phone: currentUser?.phone,
                password: currentUser?.password,
                role: currentUser?.role || "TRAVELER",
              });
            }
            setIsDialogOpen(false);
            setCurrentUser(null);
            loadUsers();
          } catch (e) {
            console.error(e);
            setError("Failed to save user");
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={currentUser?.name || ""}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={currentUser?.phone || ""}
              onChange={(e) =>
                setCurrentUser({ ...currentUser, phone: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={currentUser?.role || "TRAVELER"}
              onChange={(e) =>
                setCurrentUser({
                  ...currentUser,
                  role: e.target.value,
                  roleChanged: currentUser?.id ? true : false,
                })
              }
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {!currentUser?.id && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="password"
                  placeholder="Password"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={currentUser?.password || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, password: e.target.value })
                  }
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={currentUser?.confirm || ""}
                  onChange={(e) =>
                    setCurrentUser({ ...currentUser, confirm: e.target.value })
                  }
                />
              </div>
              {currentUser?.password &&
                currentUser?.confirm &&
                currentUser.password !== currentUser.confirm && (
                  <div className="text-xs text-red-600 mt-1">
                    Passwords do not match
                  </div>
                )}
            </div>
          )}
          {saving && <div className="text-sm text-blue-600">Saving...</div>}
          {error && <div className="text-sm text-red-600">{error}</div>}
        </div>
      </FormDialog>
    </div>
  );
};

export default UserManagement;
