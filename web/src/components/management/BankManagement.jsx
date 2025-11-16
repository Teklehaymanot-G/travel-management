import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import DataGrid from "../../ui/DataGrid";
import FormDialog from "../../ui/FormDialog";
import Button from "../../components/ui/Button";
import {
  getBanks,
  createBank,
  updateBank,
  toggleBank,
  deleteBank,
} from "../../services/bankService";

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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortField, setSortField] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [dropdownOpen, setDropdownOpen] = useState(null);

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

    // If it's already a full URL, return as is
    if (logoPath.startsWith("http")) {
      return logoPath;
    }

    // If it's a relative path, construct the full URL
    // Assuming your app is served from the root and uploads are in src/uploads/banks/
    if (logoPath.startsWith("uploads/") || logoPath.startsWith("/uploads/")) {
      // Remove leading slash if present
      const cleanPath = logoPath.startsWith("/") ? logoPath.slice(1) : logoPath;
      return `/${cleanPath}`;
    }

    // If it's just a filename, assume it's in the banks directory
    return `/uploads/banks/${logoPath}`;
  };

  // Statistics and other existing code remains the same...
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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(sortedBanks.length / limit)),
    [sortedBanks.length, limit]
  );

  const paginatedBanks = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return sortedBanks.slice(startIndex, startIndex + limit);
  }, [sortedBanks, page, limit]);

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
    setDropdownOpen(null); // Close dropdown when opening dialog
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
      setDropdownOpen(null); // Close dropdown
      await load();
    } catch (e) {
      setError(e.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (bank) => {
    if (!window.confirm(`Delete bank ${bank.name}?`)) return;
    try {
      await deleteBank(bank.id);
      setDropdownOpen(null); // Close dropdown
      await load();
    } catch (e) {
      setError(e.message || "Failed to delete bank");
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

  const toggleDropdown = (bankId) => {
    setDropdownOpen(dropdownOpen === bankId ? null : bankId);
  };

  return (
    <div className="space-y-6">
      {/* Header Section - Same as before */}
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
            <button
              onClick={() => {
                setFilter("ACTIVE");
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                filter === "ACTIVE"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              Active
            </button>
            <button
              onClick={() => {
                setFilter("INACTIVE");
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                filter === "INACTIVE"
                  ? "bg-gray-600 text-white border-gray-600"
                  : "bg-white text-gray-600 border-gray-300"
              }`}
            >
              Inactive
            </button>
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
          <Button onClick={openCreate}>
            <span className="mr-1">＋</span> Add Bank
          </Button>
        </div>
      </div>

      {/* Statistical Cards - Same as before */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8v-4m0 4h4"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Banks</h3>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">
                Active Banks
              </h3>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">
                Inactive Banks
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Data Grid */}
      <div className="bg-white shadow rounded overflow-auto max-h-[70vh]">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-gray-600 border-b sticky top-0 bg-gray-50 shadow-sm">
              {headerCell("Logo", "name")}
              {headerCell("Name", "name")}
              {headerCell("Account Name", "accountName")}
              {headerCell("Account Number", "accountNumber")}
              {headerCell("Status", "status")}
              {headerCell("Updated", "updatedAt")}
              <th className="p-3 w-40">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="p-4 text-center" colSpan={7}>
                  Loading banks...
                </td>
              </tr>
            ) : paginatedBanks.length ? (
              paginatedBanks.map((bank, index) => {
                const logoUrl = getImageUrl(bank.logoUrl || bank.logo);

                return (
                  <tr
                    key={bank.id}
                    className={`border-b hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={bank.name}
                          className="h-8 w-8 object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="h-8 w-8 bg-gray-200 rounded" />
                      )}
                    </td>
                    <td className="p-3 font-medium">{bank.name}</td>
                    <td className="p-3">{bank.accountName}</td>
                    <td className="p-3 font-mono text-xs">
                      {bank.accountNumber}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bank.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {bank.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      {new Date(bank.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <div
                        className="relative inline-block text-left"
                        ref={(el) => (dropdownRefs.current[bank.id] = el)}
                      >
                        <button
                          type="button"
                          className="inline-flex justify-center w-full px-3 py-1.5 bg-white text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-blue-500"
                          onClick={() => toggleDropdown(bank.id)}
                        >
                          Actions ▾
                        </button>

                        {dropdownOpen === bank.id && (
                          <div className="absolute right-0 z-10 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg p-1">
                            <button
                              className="w-full text-left px-3 py-2 text-xs rounded hover:bg-gray-100"
                              onClick={() => openEdit(bank)}
                            >
                              Edit
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-xs rounded hover:bg-yellow-50 text-yellow-600"
                              onClick={() => handleToggle(bank)}
                            >
                              {bank.status === "ACTIVE"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                            <button
                              className="w-full text-left px-3 py-2 text-xs rounded hover:bg-red-50 text-red-600"
                              onClick={() => handleDelete(bank)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="p-4 text-center" colSpan={7}>
                  No banks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-xs text-gray-600">
          Page {page} / {totalPages} • Total {sortedBanks.length} • Showing{" "}
          {paginatedBanks.length} items
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

      {/* Form Dialog */}
      <FormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={isCreate ? "Create Bank" : `Edit Bank: ${form.name}`}
        onSubmit={handleSubmit}
        submitLabel={isCreate ? "Create" : "Save"}
        disableSubmit={
          !form.name ||
          !form.accountName ||
          !form.accountNumber ||
          (!isCreate && !editingId)
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Logo Image
            </label>
            {!isCreate && form.logoFile === null && form.logoUrl && (
              <div className="mt-2 flex items-center space-x-3">
                <img
                  src={form.logoUrl}
                  alt={form.name}
                  className="h-12 w-12 object-contain rounded border"
                />
                <span className="text-xs text-gray-500">Current logo</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) =>
                setForm({ ...form, logoFile: e.target.files?.[0] || null })
              }
            />
            {form.logoFile && (
              <p className="text-xs text-gray-500 mt-1">
                Selected: {form.logoFile.name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account Name
            </label>
            <input
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.accountName}
              onChange={(e) =>
                setForm({ ...form, accountName: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account Number
            </label>
            <input
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={form.accountNumber}
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value })
              }
              required
            />
          </div>
          {!isCreate && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          )}
        </div>
      </FormDialog>
    </div>
  );
};

export default BankManagement;
