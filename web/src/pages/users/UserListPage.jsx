import { useEffect, useMemo, useState } from "react";
import { listUsers, listRoles, deleteUser } from "../../services/userService";
import Button from "../../components/ui/Button";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [total, setTotal] = useState(0);
  const pages = useMemo(
    () => Math.max(1, Math.ceil(total / limit)),
    [total, limit]
  );

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [uRes, rRes] = await Promise.all([
          listUsers({ page, limit, search, role }),
          roles.length ? Promise.resolve({ data: roles }) : listRoles(),
        ]);
        setUsers(uRes.data || uRes?.data || []);
        setTotal(uRes.pagination?.total || 0);
        if (!roles.length) setRoles(rRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, limit, search, role, roles]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setTotal((t) => Math.max(0, t - 1));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => (window.location.href = "/admin/users/new")}>
          New User
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or phone"
          className="border rounded px-3 py-2 w-full max-w-md"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="all">All roles</option>
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
          className="border rounded px-3 py-2"
        >
          {[10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n}/page
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white shadow rounded">
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
            ) : users.length ? (
              users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{u.id}</td>
                  <td className="p-3">{u.name || "—"}</td>
                  <td className="p-3">{u.phone}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u._count?.bookings ?? 0}</td>
                  <td className="p-3">{u._count?.comments ?? 0}</td>
                  <td className="p-3">{u._count?.travels ?? 0}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          (window.location.href = `/admin/users/${u.id}`)
                        }
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(u.id)}
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

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-600">Total: {total}</span>
        <div className="flex gap-2">
          <Button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </Button>
          <span className="px-2 py-1 text-sm">
            {page} / {pages}
          </span>
          <Button
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserListPage;
