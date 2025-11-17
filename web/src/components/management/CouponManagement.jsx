import { useEffect, useMemo, useState } from "react";
import FormDialog from "../../ui/FormDialog";
// import { coupons as dummyCoupons } from "../../utils/dummyData";
import couponService from "../../services/couponService";

const toDateInput = (v) => {
  if (!v) return "";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return v;
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
};

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
  type: "percent",
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

  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(h);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, typeFilter]);

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
      const arr = data?.data || [];
      setItems(arr);
      setTotal(data?.total || arr.length);
    } catch (err) {
      const arr = [];
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

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Coupon Management
          </h2>
          <p className="text-sm text-gray-600">
            Create and manage discount coupons
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <Button onClick={openCreate} variant="primary">
            <span className="mr-1">＋</span> New Coupon
          </Button>
          <Button onClick={fetchCoupons} variant="outline">
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Coupons"
          value={stats.total}
          color="gray"
          percentage={100}
        />
        <StatCard
          label="Active"
          value={stats.active}
          color="green"
          percentage={stats.total ? (stats.active / stats.total) * 100 : 0}
        />
        <StatCard
          label="Upcoming"
          value={stats.upcoming}
          color="blue"
          percentage={stats.total ? (stats.upcoming / stats.total) * 100 : 0}
        />
        <StatCard
          label="Expired"
          value={stats.expired}
          color="red"
          percentage={stats.total ? (stats.expired / stats.total) * 100 : 0}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code or description..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="expired">Expired</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="all">All Types</option>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rows
          </label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
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
      <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
                <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Code
                </th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Discount
                </th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Status
                </th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Valid To
                </th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Used
                </th>
                <th className="text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="text-gray-500 mt-2">Loading coupons...</p>
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((c) => (
                  <TableRow
                    key={c.id}
                    coupon={c}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
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
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">
                      No coupons found
                    </p>
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
          Page {page} of {totalPages} • Showing {filtered.length} of {total}{" "}
          coupons
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
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editId ? "Edit Coupon" : "Create New Coupon"}
        description="Configure discount settings, validity period, and usage limits."
        onSubmit={saveCoupon}
        submitLabel={
          saving ? "Saving..." : editId ? "Update Coupon" : "Create Coupon"
        }
        loading={saving}
        disableSubmit={saving}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Coupon Code *" required>
              <input
                value={form.code}
                onChange={(e) =>
                  setForm({ ...form, code: e.target.value.toUpperCase() })
                }
                className="form-input"
                placeholder="SUMMER25"
              />
            </FormField>
            <FormField label="Discount Type">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="form-input"
              >
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </FormField>
            <FormField label="Discount Value *" required>
              <input
                type="number"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                className="form-input"
                placeholder={form.type === "percent" ? "10" : "25.00"}
                min="0"
                max={form.type === "percent" ? "100" : undefined}
                step={form.type === "percent" ? "1" : "0.01"}
              />
            </FormField>
            <FormField label="Maximum Uses">
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="form-input"
                placeholder="Unlimited"
                min="0"
              />
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="form-input"
              placeholder="Optional description for internal use..."
            />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormField label="Valid From *" required>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) =>
                  setForm({ ...form, validFrom: e.target.value })
                }
                className="form-input"
              />
            </FormField>
            <FormField label="Valid To *" required>
              <input
                type="date"
                value={form.validTo}
                onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                className="form-input"
              />
            </FormField>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <input
              id="active"
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
            />
            <label
              htmlFor="active"
              className="text-sm font-medium text-gray-700"
            >
              Active Coupon
            </label>
          </div>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
            <strong>Note:</strong> Fields marked with * are required. Percentage
            discounts are capped at 100%. Fixed amount discounts should be
            entered without currency symbols.
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

// Reusable Components
const Button = ({
  children,
  variant = "primary",
  size = "default",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    outline:
      "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  };
  const sizes = {
    default: "px-4 py-2.5 text-sm",
    sm: "px-3 py-2 text-xs",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  );
};

const StatCard = ({ label, value, color, percentage }) => {
  const colorStyles = {
    gray: {
      bg: "from-gray-50 to-gray-100",
      text: "text-gray-700",
      bar: "bg-gray-400",
    },
    green: {
      bg: "from-green-50 to-green-100",
      text: "text-green-700",
      bar: "bg-green-500",
    },
    blue: {
      bg: "from-blue-50 to-blue-100",
      text: "text-blue-700",
      bar: "bg-blue-500",
    },
    red: {
      bg: "from-red-50 to-red-100",
      text: "text-red-700",
      bar: "bg-red-500",
    },
  };

  const styles = colorStyles[color] || colorStyles.gray;

  return (
    <div
      className={`bg-gradient-to-br ${styles.bg} rounded-xl border border-gray-200/60 p-5 shadow-sm`}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          className={`text-xs font-semibold uppercase tracking-wide ${styles.text}`}
        >
          {label}
        </span>
        <div className={`text-lg font-bold ${styles.text}`}>{value}</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${styles.bar} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const TableRow = ({ coupon, onEdit, onDelete, onToggleActive }) => {
  const status = computeStatus(coupon);
  const statusStyles = {
    active: "bg-green-100 text-green-800 border-green-200",
    expired: "bg-gray-100 text-gray-600 border-gray-300",
    upcoming: "bg-blue-100 text-blue-800 border-blue-200",
    inactive: "bg-orange-100 text-orange-800 border-orange-200",
    draft: "bg-gray-100 text-gray-600 border-gray-300",
    unknown: "bg-gray-100 text-gray-600 border-gray-300",
  };

  const typeStyles = {
    percent: "bg-purple-100 text-purple-800 border-purple-200",
    fixed: "bg-indigo-100 text-indigo-800 border-indigo-200",
  };

  return (
    <tr className="hover:bg-gray-50/80 transition-colors group">
      <td className="p-4">
        <div className="flex flex-col">
          <code className="font-mono text-sm font-semibold text-gray-900 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg">
            {coupon.code}
          </code>
          {coupon.description && (
            <span className="text-xs text-gray-500 mt-1 truncate max-w-xs">
              {coupon.description}
            </span>
          )}
        </div>
      </td>
      <td className="p-4">
        <span className="text-lg font-semibold text-gray-900">
          {coupon.type === "percent"
            ? `${coupon.discount}%`
            : `$${coupon.discount}`}
        </span>
      </td>
      <td className="p-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
            typeStyles[coupon.type] || typeStyles.percent
          }`}
        >
          {coupon.type}
        </span>
      </td>
      <td className="p-4">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status]}`}
        >
          {status}
        </span>
      </td>
      <td className="p-4">
        <span className="text-sm text-gray-600 font-medium">
          {toDateInput(coupon.validTo)}
        </span>
      </td>
      <td className="p-4">
        <span className="text-sm text-gray-600">{coupon.used ?? 0}</span>
      </td>
      <td className="p-4">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(coupon)}
            className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onToggleActive(coupon)}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            {coupon.active ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={() => onDelete(coupon)}
            className="px-3 py-1.5 border border-red-300 text-red-600 text-xs rounded-lg hover:bg-red-50 transition-colors font-medium"
          >
            Delete
          </button>
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

// Add this CSS for form inputs (or use Tailwind classes)
const formInputStyles = `
  .form-input {
    @apply w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
  }
`;

export default CouponManagement;
