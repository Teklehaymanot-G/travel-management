import React, { useEffect, useMemo, useState } from "react";
import FormDialog from "../../ui/FormDialog";
import { coupons as dummyCoupons } from "../../utils/dummyData";
import couponService from "../../services/couponService";

const toDateInput = (v) => {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v; // already yyyy-mm-dd
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

// Determine status from validity dates
const computeStatus = (c) => {
  try {
    if (!c.validFrom || !c.validTo) return "draft";
    const now = new Date();
    const from = new Date(c.validFrom);
    const to = new Date(c.validTo);
    if (now < from) return "upcoming";
    if (now > to) return "expired";
    return c.active === false ? "inactive" : "active";
  } catch {
    return "unknown";
  }
};

const emptyForm = {
  code: "",
  description: "",
  type: "percent", // percent | fixed
  discount: "",
  validFrom: "",
  validTo: "",
  maxUses: "",
  active: true,
};

const CouponManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  // Debounced search handling
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(h);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, typeFilter]);

  // Fetch coupons (fallback to dummy if backend not implemented)
  const fetchCoupons = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await couponService.listCoupons({
        page,
        limit,
        search,
        status: statusFilter !== "all" ? statusFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
      });
      // Expect backend shape: { data, total }
      const arr = data?.data || [];
      setItems(arr);
      setTotal(data?.total || arr.length);
    } catch (err) {
      // Fallback
      const arr = dummyCoupons;
      setItems(arr);
      setTotal(arr.length);
      if (err?.response) {
        setError(err.response.data?.message || "Failed to load coupons");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch, statusFilter, typeFilter]);

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };
  const openEdit = (c) => {
    // Normalize incoming coupon to match form expectations
    const normalized = {
      id: c.id,
      code: c.code || "",
      description: c.description || "",
      type: (c.type || "percent").toLowerCase(),
      discount: c.discount ?? "",
      validFrom: toDateInput(c.validFrom),
      validTo: toDateInput(c.validTo),
      maxUses: c.maxUses ?? "",
      active: c.active !== undefined ? !!c.active : true,
    };
    setEditId(c.id);
    setForm(normalized);
    setDialogOpen(true);
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    try {
      await couponService.deleteCoupon(c.id);
      fetchCoupons();
    } catch {
      alert("Backend not ready for deleting coupon.");
    }
  };

  const handleToggleActive = async (c) => {
    try {
      await couponService.toggleCouponActive(c.id);
      await fetchCoupons();
    } catch {
      // Simulate toggle locally
      setItems((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x))
      );
    }
  };

  const filtered = useMemo(() => {
    return items
      .filter((c) => {
        const status = computeStatus(c);
        if (statusFilter !== "all" && status !== statusFilter) return false;
        if (typeFilter !== "all" && c.type !== typeFilter) return false;
        if (
          debouncedSearch &&
          !c.code.toLowerCase().includes(debouncedSearch.toLowerCase()) &&
          !(c.description || "")
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase())
        )
          return false;
        return true;
      })
      .slice(0, limit);
  }, [items, debouncedSearch, statusFilter, typeFilter, limit]);

  const stats = useMemo(() => {
    const active = items.filter((c) => computeStatus(c) === "active").length;
    const expired = items.filter((c) => computeStatus(c) === "expired").length;
    const upcoming = items.filter(
      (c) => computeStatus(c) === "upcoming"
    ).length;
    return { total: items.length, active, expired, upcoming };
  }, [items]);

  const validate = () => {
    if (!form.code.trim()) return "Code is required";
    if (!form.discount || Number(form.discount) <= 0)
      return "Discount must be > 0";
    if (form.type === "percent" && Number(form.discount) > 100)
      return "Percent cannot exceed 100";
    if (!form.validFrom || !form.validTo) return "Valid date range required";
    if (new Date(form.validFrom) > new Date(form.validTo))
      return "Valid From must be before Valid To";
    return "";
  };

  const saveCoupon = async () => {
    const errMsg = validate();
    if (errMsg) return alert(errMsg);
    setSaving(true);
    try {
      if (editId) {
        await couponService.updateCoupon(editId, form);
      } else {
        await couponService.createCoupon(form);
      }
    } catch {
      // Simulated local persistence when backend absent
      setItems((prev) => {
        if (editId)
          return prev.map((x) =>
            x.id === editId ? { ...form, id: editId } : x
          );
        const nextId = prev.length
          ? Math.max(...prev.map((p) => p.id || 0)) + 1
          : 1;
        return [{ ...form, id: nextId }, ...prev];
      });
    } finally {
      setSaving(false);
      setDialogOpen(false);
      fetchCoupons();
    }
  };

  // Table columns will be rendered manually now (matching UserManagement simplified UI)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-semibold">Coupon Management</h2>
        <div className="flex gap-2">
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            New Coupon
          </button>
          <button
            onClick={fetchCoupons}
            className="bg-gray-100 px-4 py-2 rounded-md text-sm hover:bg-gray-200"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border bg-gradient-to-br from-white to-gray-50 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-500 text-xs uppercase tracking-wide">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M3 3h18v4H3z" />
              <path d="M3 11h18v10H3z" />
            </svg>
            Total
          </div>
          <div className="text-2xl font-semibold text-gray-800">
            {stats.total}
          </div>
          <div className="h-1 w-full bg-gray-200 rounded overflow-hidden">
            <div className="h-full bg-gray-400" style={{ width: "100%" }} />
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-gradient-to-br from-green-50 to-green-100 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-2 text-green-700 text-xs uppercase tracking-wide">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
            Active
          </div>
          <div className="text-2xl font-semibold text-green-700">
            {stats.active}
          </div>
          <div className="h-1 w-full bg-green-200 rounded overflow-hidden">
            <div
              className="h-full bg-green-600"
              style={{
                width: `${
                  stats.total ? (stats.active / stats.total) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-2 text-indigo-700 text-xs uppercase tracking-wide">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M12 6v6l4 2" />
            </svg>
            Upcoming
          </div>
          <div className="text-2xl font-semibold text-indigo-700">
            {stats.upcoming}
          </div>
          <div className="h-1 w-full bg-indigo-200 rounded overflow-hidden">
            <div
              className="h-full bg-indigo-600"
              style={{
                width: `${
                  stats.total ? (stats.upcoming / stats.total) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>
        <div className="p-4 rounded-xl border bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-600 text-xs uppercase tracking-wide">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 7l-7 7-7-7" />
            </svg>
            Expired
          </div>
          <div className="text-2xl font-semibold text-gray-700">
            {stats.expired}
          </div>
          <div className="h-1 w-full bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-gray-500"
              style={{
                width: `${
                  stats.total ? (stats.expired / stats.total) * 100 : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-600">
            Search
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code"
            className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-1 border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="mt-1 border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="all">All</option>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600">
            Rows
          </label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="mt-1 border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      {/* Table (aligned with UserManagement simplified UI) */}
      <div className="bg-white shadow rounded overflow-hidden">
        <table className="min-w-full">
          <thead>
            <tr className="text-left text-sm text-gray-600 border-b">
              <th className="p-3">ID</th>
              <th className="p-3">Code</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Type</th>
              <th className="p-3">Status</th>
              <th className="p-3">Valid To</th>
              <th className="p-3">Used</th>
              <th className="p-3 w-44">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4" colSpan={8}>
                  Loading...
                </td>
              </tr>
            ) : filtered.length ? (
              filtered.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{c.id}</td>
                  <td className="p-3">
                    <span
                      className="font-mono bg-yellow-50 border border-yellow-200 px-2 py-1 rounded text-xs"
                      title={c.description}
                    >
                      {c.code}
                    </span>
                  </td>
                  <td className="p-3">
                    {(c.type || "percent") === "percent"
                      ? `${c.discount}%`
                      : `$${c.discount}`}
                  </td>
                  <td className="p-3">
                    <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-200">
                      {c.type || "percent"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded border ${(() => {
                        const st = computeStatus(c);
                        return st === "active"
                          ? "bg-green-50 text-green-600 border-green-200"
                          : st === "expired"
                          ? "bg-gray-100 text-gray-500 border-gray-300"
                          : st === "upcoming"
                          ? "bg-indigo-50 text-indigo-600 border-indigo-200"
                          : c.active === false
                          ? "bg-orange-50 text-orange-600 border-orange-200"
                          : "bg-slate-100 text-slate-600 border-slate-200";
                      })()}`}
                    >
                      {computeStatus(c)}
                    </span>
                  </td>
                  <td className="p-3">{toDateInput(c.validTo)}</td>
                  <td className="p-3">{c.used ?? 0}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded-md bg-blue-600 text-white text-xs hover:bg-blue-700"
                        onClick={() => openEdit(c)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 rounded-md border text-xs text-gray-700 hover:bg-gray-100"
                        onClick={() => handleToggleActive(c)}
                      >
                        {c.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        className="px-3 py-1 rounded-md border text-xs text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(c)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4" colSpan={8}>
                  No coupons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {error && <p className="p-3 text-xs text-red-600">{error}</p>}
      </div>

      {/* Pagination (simple) */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Page {page}</span>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 rounded border text-gray-600 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={page * limit >= total}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded border text-gray-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <FormDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editId ? "Edit Coupon" : "Create Coupon"}
        description="Configure discount, validity period, and usage limits."
        onSubmit={saveCoupon}
        submitLabel={editId ? "Update" : "Save"}
        loading={saving}
        disableSubmit={saving}
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600">
                Code *
              </label>
              <input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="WELCOME10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">
                Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
              >
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">
                Discount *
              </label>
              <input
                type="number"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">
                Max Uses
              </label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
                placeholder="100"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
              placeholder="Optional description for internal use"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600">
                Valid From *
              </label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) =>
                  setForm({ ...form, validFrom: e.target.value })
                }
                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">
                Valid To *
              </label>
              <input
                type="date"
                value={form.validTo}
                onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4"
            />
            <label htmlFor="active" className="text-xs text-gray-600">
              Active
            </label>
          </div>
          <p className="text-[11px] text-gray-500">
            Fields marked * are required. Percent discount is capped at 100.
          </p>
        </div>
      </FormDialog>
    </div>
  );
};

export default CouponManagement;
