import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  const [openActionsId, setOpenActionsId] = useState(null);
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("desc");

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

  // Close actions menu on outside click
  useEffect(() => {
    function handleDocClick(e) {
      if (!openActionsId) return;
      const menu = document.getElementById(
        "user-actions-menu-" + openActionsId
      );
      if (menu && menu.contains(e.target)) return; // click inside menu
      const toggleBtn = document.getElementById(
        "user-actions-toggle-" + openActionsId
      );
      if (toggleBtn && toggleBtn.contains(e.target)) return; // click on toggle button
      setOpenActionsId(null);
    }
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, [openActionsId]);

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

  // Client-side sort (within current page data)
  const sortedUsers = useMemo(() => {
    const data = [...users];
    data.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      let av = a[sortField];
      let bv = b[sortField];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av === bv) return 0;
      return av > bv ? dir : -dir;
    });
    return data;
  }, [users, sortField, sortDir]);

  const filteredUsers = sortedUsers; // already server filtered; apply sort only

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  const changeSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const headerCell = (label, field) => (
    <th
      className="p-3 cursor-pointer select-none group"
      onClick={() => changeSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {sortField === field && (
          <span className="text-xs text-gray-500">
            {sortDir === "asc" ? "▲" : "▼"}
          </span>
        )}
        {sortField !== field && (
          <span className="opacity-0 group-hover:opacity-60 text-xs text-gray-400">
            ⇅
          </span>
        )}
      </div>
    </th>
  );

  // Add to UserManagement state
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRefs = useRef({});

  // Add click outside effect
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownOpen &&
        !dropdownRefs.current[dropdownOpen]?.contains(event.target)
      ) {
        setDropdownOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Add toggle function
  const toggleDropdown = (userId) => {
    setDropdownOpen(dropdownOpen === userId ? null : userId);
  };

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                filter === "all"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              All
            </button>
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => {
                  setFilter(r);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  filter === r
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
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

      <div className="bg-white shadow rounded overflow-auto max-h-[70vh]">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-600 border-b sticky top-0 bg-gray-50 shadow-sm">
              {headerCell("ID", "id")}
              {headerCell("Name", "name")}
              {headerCell("Phone", "phone")}
              {headerCell("Role", "role")}
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
              filteredUsers.map((u, index) => (
                <tr
                  key={u.id}
                  className={`border-b hover:bg-blue-50 transition-colors ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3">{u.id}</td>
                  <td className="p-3">
                    {u.name ? (
                      <span>{u.name}</span>
                    ) : (
                      <span className="italic text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-xs">{u.phone}</td>
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
                    <div className="relative inline-block text-left">
                      <button
                        type="button"
                        className="inline-flex justify-center w-full px-3 py-1.5 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                        onClick={() => toggleDropdown(u.id)}
                      >
                        Actions ▾
                      </button>

                      {dropdownOpen === u.id && (
                        <div className="absolute right-0 z-10 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg p-1">
                          <button
                            className="w-full text-left px-3 py-2 text-xs rounded hover:bg-gray-100"
                            onClick={() => {
                              setCurrentUser(u);
                              setIsDialogOpen(true);
                              setDropdownOpen(null);
                            }}
                          >
                            View / Edit
                          </button>
                          <button
                            className="w-full text-left px-3 py-2 text-xs rounded hover:bg-red-50 text-red-600"
                            onClick={() => {
                              handleDelete(u);
                              setDropdownOpen(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
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

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-xs text-gray-600">
          Page {page} / {totalPages} • Total {total} • Showing {users.length}{" "}
          items
        </div>
        <div className="flex flex-wrap gap-1 items-center">
          <Button size="sm" disabled={page === 1} onClick={() => setPage(1)}>
            « First
          </Button>
          <Button
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ‹ Prev
          </Button>
          {Array.from({ length: totalPages })
            .slice(0, 7)
            .map((_, i) => {
              const num = i + 1;
              if (totalPages > 7 && num === 6 && page < totalPages - 2) {
                return (
                  <span key="ellipsis" className="px-2 text-gray-400">
                    …
                  </span>
                );
              }
              if (
                totalPages > 7 &&
                page >= totalPages - 2 &&
                num <= totalPages - 5
              ) {
                return null;
              }
              return (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`px-3 py-1 text-xs rounded border ${
                    page === num
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {num}
                </button>
              );
            })}
          <Button
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next ›
          </Button>
          <Button
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            Last »
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
