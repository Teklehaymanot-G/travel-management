import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "../../components/ui/Button";
import {
  createBank,
  deleteBank,
  getBanks,
  toggleBank,
  updateBank,
} from "../../services/bankService";
import FormDialog from "../../ui/FormDialog";

const emptyForm = {
  name: "",
  logoFile: null,
  accountName: "",
  accountNumber: "",
  status: "ACTIVE",
};

const BankManagement = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [copiedBankId, setCopiedBankId] = useState(null);

  const dropdownRefs = useRef({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getBanks({ status: filter === "all" ? "" : filter });
      setBanks(res.data || []);
    } catch (e) {
      setError(e.message || "Failed to load banks");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  // Close dropdown when clicking outside
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

  // Helper function to get correct image URL
  const getImageUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith("http")) return logoPath;
    if (logoPath.startsWith("uploads/") || logoPath.startsWith("/uploads/")) {
      const cleanPath = logoPath.startsWith("/") ? logoPath.slice(1) : logoPath;
      return `/${cleanPath}`;
    }
    return `/uploads/banks/${logoPath}`;
  };

  // Statistics
  const stats = useMemo(() => {
    const total = banks.length;
    const active = banks.filter((b) => b.status === "ACTIVE").length;
    const inactive = banks.filter((b) => b.status === "INACTIVE").length;
    return { total, active, inactive };
  }, [banks]);

  const filteredBanks = useMemo(() => {
    let result = banks;

    if (filter !== "all") {
      result = result.filter((bank) => bank.status === filter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (bank) =>
          bank.name?.toLowerCase().includes(searchLower) ||
          bank.accountName?.toLowerCase().includes(searchLower) ||
          bank.accountNumber?.toLowerCase().includes(searchLower)
      );
    }

    return result;
  }, [banks, filter, search]);

  const sortedBanks = useMemo(() => {
    const data = [...filteredBanks];
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
  }, [filteredBanks, sortField, sortDir]);

  const openCreate = () => {
    setIsCreate(true);
    setForm(emptyForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEdit = (bank) => {
    setIsCreate(false);
    setEditingId(bank?.id ?? null);
    setForm({
      id: bank?.bank_id,
      name: bank?.name || "",
      logoFile: null,
      logoUrl: bank?.logoUrl || null,
      accountName: bank?.accountName || "",
      accountNumber: bank?.accountNumber || "",
      status: bank?.status || "ACTIVE",
    });
    setIsDialogOpen(true);
    setDropdownOpen(null);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      if (isCreate) {
        await createBank({
          name: form.name,
          accountName: form.accountName,
          accountNumber: form.accountNumber,
          status: "ACTIVE",
          ...(form.logoFile ? { logo: form.logoFile } : {}),
        });
      } else {
        await updateBank(editingId, {
          name: form.name,
          accountName: form.accountName,
          accountNumber: form.accountNumber,
          status: form.status,
          ...(form.logoFile ? { logo: form.logoFile } : {}),
        });
      }
      setIsDialogOpen(false);
      await load();
    } catch (e) {
      console.error("Bank save error", e);
      setError(e.response?.data?.message || e.message || "Failed to save bank");
    }
  };

  const handleToggle = async (bank) => {
    try {
      await toggleBank(bank.id);
      setDropdownOpen(null);
      await load();
    } catch (e) {
      setError(e.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (bank) => {
    if (!window.confirm(`Delete bank ${bank.name}?`)) return;
    try {
      await deleteBank(bank.id);
      setDropdownOpen(null);
      await load();
    } catch (e) {
      setError(e.message || "Failed to delete bank");
    }
  };

  const handleCopy = async (bank) => {
    const text = bank.accountNumber || "";
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.top = "-1000px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedBankId(bank.id);
      setTimeout(() => setCopiedBankId(null), 2000);
    } catch (e) {
      console.error("Copy failed", e);
      setError("Failed to copy account number");
      setTimeout(() => setError(""), 2500);
    }
  };

  const changeSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const toggleDropdown = (bankId) => {
    setDropdownOpen(dropdownOpen === bankId ? null : bankId);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bank Management</h2>
          <p className="text-sm text-gray-600">
            Manage bank accounts and payment methods
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search banks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                filter === "all"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("ACTIVE")}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                filter === "ACTIVE"
                  ? "bg-green-600 text-white border-green-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("INACTIVE")}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                filter === "INACTIVE"
                  ? "bg-gray-600 text-white border-gray-600 shadow-sm"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Inactive
            </button>
          </div>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
          <Button onClick={openCreate} variant="primary">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Bank
          </Button>
        </div>
      </div>

      {/* Statistical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Banks"
          value={stats.total}
          icon="🏦"
          color="blue"
        />
        <StatCard
          title="Active Banks"
          value={stats.active}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Inactive Banks"
          value={stats.inactive}
          icon="⏸️"
          color="gray"
        />
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
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* DataTable */}
      {(() => {
        const sortableHeader = (label, field) => (
          <button
            type="button"
            onClick={() => changeSort(field)}
            className="flex items-center gap-1 group focus:outline-none hover:text-gray-900 transition-colors"
          >
            <span className="font-semibold text-gray-700 group-hover:text-gray-900">
              {label}
            </span>
            {sortField === field && (
              <span className="text-xs text-blue-600">
                {sortDir === "asc" ? "▲" : "▼"}
              </span>
            )}
            {sortField !== field && (
              <span className="opacity-0 group-hover:opacity-60 text-xs text-gray-400">
                ⇅
              </span>
            )}
          </button>
        );

        const columns = [
          {
            key: "logo",
            header: sortableHeader("Logo", "name"),
            render: (row) => {
              const logoUrl = getImageUrl(row.logoUrl || row.logo);
              return logoUrl ? (
                <div className="flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt={row.name}
                    className="h-12 w-12 object-contain rounded-xl border-2 border-gray-100 shadow-sm"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                  <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center hidden border border-gray-200">
                    <span className="text-xs font-medium text-gray-500">
                      No Logo
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-12 w-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center border border-gray-200">
                  <span className="text-xs font-medium text-gray-500">
                    No Logo
                  </span>
                </div>
              );
            },
            width: "80px",
            align: "center",
          },
          {
            key: "name",
            header: sortableHeader("Bank Name", "name"),
            render: (row) => (
              <div>
                <span className="font-semibold text-gray-900 block text-lg">
                  {row.name}
                </span>
                {row.branch && (
                  <span className="text-sm text-gray-500 mt-1">
                    {row.branch}
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "accountName",
            header: sortableHeader("Account Name", "accountName"),
            render: (row) => (
              <span className="text-gray-800 font-semibold">
                {row.accountName}
              </span>
            ),
          },
          {
            key: "accountNumber",
            header: sortableHeader("Account Number", "accountNumber"),
            render: (row) => (
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
                  {row.accountNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(row)}
                  className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 hover:border-blue-300 text-gray-500 hover:text-blue-600 transition-colors shadow-sm"
                  title="Copy account number"
                >
                  {copiedBankId === row.id ? (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
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
                        d="M8 16h8M8 12h8m-9 8h10a2 2 0 002-2V6a2 2 0 00-2-2H9l-3 3v13a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
                {copiedBankId === row.id && (
                  <span className="text-xs font-semibold text-green-600 animate-fade-in">
                    Copied
                  </span>
                )}
              </div>
            ),
          },
          {
            key: "status",
            header: sortableHeader("Status", "status"),
            render: (row) => (
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  row.status === "ACTIVE"
                    ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 shadow-sm"
                    : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {row.status === "ACTIVE" ? (
                  <svg
                    className="w-3 h-3 mr-1.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-3 h-3 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                {row.status}
              </span>
            ),
          },
          {
            key: "updatedAt",
            header: sortableHeader("Last Updated", "updatedAt"),
            render: (row) => (
              <div className="text-right">
                <span className="text-gray-700 text-sm font-medium block">
                  {row.updatedAt
                    ? new Date(row.updatedAt).toLocaleDateString()
                    : "-"}
                </span>
                <span className="text-gray-500 text-xs">
                  {row.updatedAt
                    ? new Date(row.updatedAt).toLocaleTimeString()
                    : ""}
                </span>
              </div>
            ),
            align: "right",
          },
          {
            key: "__actions",
            header: "Actions",
            render: (row) => (
              <div
                className="relative inline-block text-left"
                ref={(el) => (dropdownRefs.current[row.id] = el)}
              >
                <button
                  type="button"
                  className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm"
                  onClick={() => toggleDropdown(row.id)}
                >
                  Actions
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {dropdownOpen === row.id && (
                  <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl py-2 transition-all">
                    <button
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => openEdit(row)}
                    >
                      <svg
                        className="w-4 h-4 mr-3"
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
                      Edit Bank Details
                    </button>
                    <button
                      className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-yellow-50 hover:text-yellow-600 transition-colors"
                      onClick={() => handleToggle(row)}
                    >
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      {row.status === "ACTIVE"
                        ? "Deactivate Bank"
                        : "Activate Bank"}
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => handleDelete(row)}
                    >
                      <svg
                        className="w-4 h-4 mr-3"
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
                      Delete Bank
                    </button>
                  </div>
                )}
              </div>
            ),
          },
        ];

        return (
          <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100/80 border-b border-gray-200">
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        className={`text-left p-4 font-semibold text-gray-700 text-sm uppercase tracking-wide ${
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                            ? "text-right"
                            : "text-left"
                        }`}
                        style={{ width: col.width }}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={columns.length} className="p-8 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                        <p className="text-gray-500 mt-2">Loading banks...</p>
                      </td>
                    </tr>
                  ) : sortedBanks.length ? (
                    sortedBanks.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50/80 transition-colors group"
                      >
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={`p-4 ${
                              col.align === "center"
                                ? "text-center"
                                : col.align === "right"
                                ? "text-right"
                                : "text-left"
                            }`}
                          >
                            {col.render(row)}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="p-8 text-center">
                        <div className="text-gray-400 mb-3">
                          <svg
                            className="w-16 h-16 mx-auto"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4m0 4h4"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-lg font-semibold">
                          No banks found
                        </p>
                        <p className="text-gray-400 mt-1">
                          Try adjusting your search or filters
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Form Dialog */}
      <FormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={isCreate ? "Create New Bank" : `Edit Bank: ${form.name}`}
        description="Configure bank account details and upload logo images."
        onSubmit={handleSubmit}
        submitLabel={isCreate ? "Create Bank" : "Save Changes"}
        disableSubmit={
          !form.name ||
          !form.accountName ||
          !form.accountNumber ||
          (!isCreate && !editingId)
        }
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Bank Name" required>
              <input
                className="form-input"
                placeholder="Enter bank name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </FormField>
            {!isCreate && (
              <FormField label="Status">
                <select
                  className="form-input"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </FormField>
            )}
          </div>

          <FormField label="Logo Image">
            {!isCreate && form.logoFile === null && form.logoUrl && (
              <div className="mb-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-4">
                  <img
                    src={form.logoUrl}
                    alt={form.name}
                    className="h-20 w-20 object-contain rounded-xl border-2 border-gray-200 shadow-sm"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Current logo
                    </p>
                    <p className="text-xs text-gray-500">
                      Upload a new image to replace the current logo
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors bg-gradient-to-br from-gray-50 to-gray-100/50">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="logo-upload"
                onChange={(e) =>
                  setForm({ ...form, logoFile: e.target.files?.[0] || null })
                }
              />
              <label htmlFor="logo-upload" className="cursor-pointer block">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-sm font-medium text-gray-600">
                  {form.logoFile
                    ? form.logoFile.name
                    : "Click to upload bank logo"}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  PNG, JPG, GIF up to 5MB
                </p>
              </label>
            </div>
            {form.logoFile && (
              <div className="mt-3 flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-blue-700">
                    Selected: {form.logoFile.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, logoFile: null })}
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Account Name" required>
              <input
                className="form-input"
                placeholder="Enter account holder name"
                value={form.accountName}
                onChange={(e) =>
                  setForm({ ...form, accountName: e.target.value })
                }
                required
              />
            </FormField>
            <FormField label="Account Number" required>
              <input
                className="form-input"
                placeholder="Enter account number"
                value={form.accountNumber}
                onChange={(e) =>
                  setForm({ ...form, accountNumber: e.target.value })
                }
                required
              />
            </FormField>
          </div>
        </div>
      </FormDialog>
    </div>
  );
};

// Reusable Components
const StatCard = ({ title, value, icon, color = "blue" }) => {
  const colorStyles = {
    blue: {
      bg: "from-blue-50 to-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    green: {
      bg: "from-green-50 to-green-100",
      text: "text-green-700",
      border: "border-green-200",
    },
    gray: {
      bg: "from-gray-50 to-gray-100",
      text: "text-gray-700",
      border: "border-gray-200",
    },
  };

  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className={`bg-gradient-to-br ${styles.bg} rounded-2xl border-2 ${styles.border} p-6 shadow-sm transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`text-2xl p-3 rounded-xl bg-white/50 ${styles.border}`}>
          {icon}
        </div>
      </div>
    </div>
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

export default BankManagement;
