import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("desc");

  // Add to UserManagement state
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const dropdownRefs = useRef({});

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listUsers({ page, limit, search, role: filter });
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

  const handleCreate = () => {
    setCurrentUser(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.name || user.phone}?`)) return;
    try {
      await deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setTotal((t) => Math.max(0, t - 1));
    } catch (e) {
      console.error(e);
      alert("Failed to delete user");
    }
  };

  // Client-side sort
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

  const filteredUsers = sortedUsers;

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

  const toggleDropdown = (userId) => {
    setDropdownOpen(dropdownOpen === userId ? null : userId);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const travelers = users.filter((u) => u.role === "TRAVELER").length;
    const supervisors = users.filter((u) => u.role === "SUPERVISOR").length;
    const managers = users.filter((u) => u.role === "MANAGER").length;
    return { total: users.length, travelers, supervisors, managers };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-600">
            Manage travelers, supervisors and managers
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Button onClick={handleCreate} variant="primary">
            <span className="mr-1">＋</span> Create User
          </Button>
          <Button onClick={loadUsers} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.total}
          color="gray"
          icon="👥"
        />
        <StatCard
          label="Travelers"
          value={stats.travelers}
          color="green"
          icon="🧳"
        />
        <StatCard
          label="Supervisors"
          value={stats.supervisors}
          color="blue"
          icon="👨‍💼"
        />
        <StatCard
          label="Managers"
          value={stats.managers}
          color="purple"
          icon="👔"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Users
          </label>
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role Filter
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
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
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  filter === r
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rows
          </label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-red-800 text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
                <TableHeader
                  label="ID"
                  field="id"
                  sortField={sortField}
                  sortDir={sortDir}
                  onChangeSort={changeSort}
                />
                <TableHeader
                  label="Name"
                  field="name"
                  sortField={sortField}
                  sortDir={sortDir}
                  onChangeSort={changeSort}
                />
                <TableHeader
                  label="Phone"
                  field="phone"
                  sortField={sortField}
                  sortDir={sortDir}
                  onChangeSort={changeSort}
                />
                <TableHeader
                  label="Role"
                  field="role"
                  sortField={sortField}
                  sortDir={sortDir}
                  onChangeSort={changeSort}
                />
                <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Bookings
                </th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Comments
                </th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Travels
                </th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide w-44">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="text-gray-500 mt-2">Loading users...</p>
                  </td>
                </tr>
              ) : filteredUsers.length ? (
                filteredUsers.map((user, index) => (
                  <TableRow
                    key={user.id}
                    user={user}
                    index={index}
                    onEdit={(user) => {
                      setCurrentUser(user);
                      setIsDialogOpen(true);
                      setDropdownOpen(null);
                    }}
                    onDelete={handleDelete}
                    dropdownOpen={dropdownOpen}
                    onToggleDropdown={toggleDropdown}
                    dropdownRefs={dropdownRefs}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="text-gray-400 mb-2">
                      <svg
                        className="w-12 h-12 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No users found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Try adjusting your search or filters
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-sm text-gray-600">
          Page {page} of {totalPages} • Showing {filteredUsers.length} of{" "}
          {total} users
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(1)}
          >
            First
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`min-w-8 h-8 text-sm rounded-lg border transition-colors ${
                    page === pageNum
                      ? "bg-blue-600 text-white border-blue-600"
                      : "text-gray-600 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(totalPages)}
          >
            Last
          </Button>
        </div>
      </div>

      {/* Form Dialog */}
      <FormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={currentUser?.id ? "Edit User" : "Create New User"}
        description="Manage user details, role assignments, and account settings."
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
        submitLabel={
          saving ? "Saving..." : currentUser?.id ? "Update User" : "Create User"
        }
        loading={saving}
        disableSubmit={saving}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Full Name" required>
              <input
                type="text"
                className="form-input"
                value={currentUser?.name || ""}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, name: e.target.value })
                }
                placeholder="Enter full name"
              />
            </FormField>
            <FormField label="Phone Number" required>
              <input
                type="tel"
                className="form-input"
                value={currentUser?.phone || ""}
                onChange={(e) =>
                  setCurrentUser({ ...currentUser, phone: e.target.value })
                }
                placeholder="Enter phone number"
              />
            </FormField>
          </div>

          <FormField label="Role" required>
            <select
              className="form-input"
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
          </FormField>

          {!currentUser?.id && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Password" required>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Enter password"
                    value={currentUser?.password || ""}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        password: e.target.value,
                      })
                    }
                  />
                </FormField>
                <FormField label="Confirm Password" required>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Confirm password"
                    value={currentUser?.confirm || ""}
                    onChange={(e) =>
                      setCurrentUser({
                        ...currentUser,
                        confirm: e.target.value,
                      })
                    }
                  />
                </FormField>
              </div>
              {currentUser?.password &&
                currentUser?.confirm &&
                currentUser.password !== currentUser.confirm && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                    Passwords do not match
                  </div>
                )}
            </div>
          )}

          {saving && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Saving user...
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
        </div>
      </FormDialog>
    </div>
  );
};

// Reusable Components
const StatCard = ({ label, value, color, icon }) => {
  const colorStyles = {
    gray: { bg: "from-gray-50 to-gray-100", text: "text-gray-700" },
    green: { bg: "from-green-50 to-green-100", text: "text-green-700" },
    blue: { bg: "from-blue-50 to-blue-100", text: "text-blue-700" },
    purple: { bg: "from-purple-50 to-purple-100", text: "text-purple-700" },
  };

  const styles = colorStyles[color] || colorStyles.gray;

  return (
    <div
      className={`bg-gradient-to-br ${styles.bg} rounded-xl border border-gray-200/60 p-5 shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <span
            className={`text-xs font-semibold uppercase tracking-wide ${styles.text} block mb-1`}
          >
            {label}
          </span>
          <div className={`text-2xl font-bold ${styles.text}`}>{value}</div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
};

const TableHeader = ({ label, field, sortField, sortDir, onChangeSort }) => (
  <th
    className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide cursor-pointer select-none group"
    onClick={() => onChangeSort(field)}
  >
    <div className="flex items-center gap-2">
      <span>{label}</span>
      <div className="flex flex-col">
        {sortField === field ? (
          <span className="text-xs text-blue-600">
            {sortDir === "asc" ? "▲" : "▼"}
          </span>
        ) : (
          <span className="opacity-0 group-hover:opacity-60 text-xs text-gray-400">
            ⇅
          </span>
        )}
      </div>
    </div>
  </th>
);

const TableRow = ({
  user,
  index,
  onEdit,
  onDelete,
  dropdownOpen,
  onToggleDropdown,
  dropdownRefs,
}) => {
  const roleStyles = {
    MANAGER: "bg-purple-100 text-purple-800 border-purple-200",
    SUPERVISOR: "bg-blue-100 text-blue-800 border-blue-200",
    TRAVELER: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <tr className="hover:bg-gray-50/80 transition-colors group">
      <td className="p-4">
        <span className="text-sm font-medium text-gray-900">#{user.id}</span>
      </td>
      <td className="p-4">
        {user.name ? (
          <span className="text-sm font-medium text-gray-900">{user.name}</span>
        ) : (
          <span className="text-sm text-gray-400 italic">—</span>
        )}
      </td>
      <td className="p-4">
        <code className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border text-gray-600">
          {user.phone}
        </code>
      </td>
      <td className="p-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
            roleStyles[user.role] || roleStyles.TRAVELER
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className="p-4">
        <span className="text-sm text-gray-600 font-medium">
          {user._count?.bookings ?? 0}
        </span>
      </td>
      <td className="p-4">
        <span className="text-sm text-gray-600">
          {user._count?.comments ?? 0}
        </span>
      </td>
      <td className="p-4">
        <span className="text-sm text-gray-600">
          {user._count?.travels ?? 0}
        </span>
      </td>
      <td className="p-4">
        <div
          className="relative"
          ref={(el) => (dropdownRefs.current[user.id] = el)}
        >
          <button
            type="button"
            className="inline-flex justify-center w-full px-4 py-2 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={() => onToggleDropdown(user.id)}
          >
            Actions
            <svg
              className="ml-2 w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {dropdownOpen === user.id && (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-1">
              <button
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => onEdit(user)}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  View / Edit
                </div>
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                onClick={() => onDelete(user)}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </div>
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

const FormField = ({ label, required, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

// Add form input styles (you might want to add this to your global CSS)
const formInputStyles = `
  .form-input {
    @apply w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
  }
`;

export default UserManagement;
