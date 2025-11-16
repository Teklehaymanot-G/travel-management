import React, { useEffect, useState } from "react";
import DataGrid from "../../ui/DataGrid";
import FormDialog from "../../ui/FormDialog";
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
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getBanks({ status: filter });
      setBanks(res.data || []);
    } catch (e) {
      setError(e.message || "Failed to load banks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const openCreate = () => {
    setIsCreate(true);
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (bank) => {
    setIsCreate(false);
    setForm({ ...bank, logoFile: null });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      if (isCreate) {
        await createBank({
          name: form.name,
          accountName: form.accountName,
          accountNumber: form.accountNumber,
          // status defaults to ACTIVE server-side; send explicitly for clarity
          status: "ACTIVE",
          ...(form.logoFile ? { logo: form.logoFile } : {}),
        });
      } else {
        await updateBank(form.id, {
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
      alert(e.response?.data?.message || e.message || "Failed to save bank");
    }
  };

  const handleToggle = async (bank) => {
    try {
      await toggleBank(bank.id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to toggle status");
    }
  };

  const handleDelete = async (bank) => {
    if (!window.confirm(`Delete bank ${bank.name}?`)) return;
    try {
      await deleteBank(bank.id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to delete bank");
    }
  };

  const filtered =
    filter === "all" ? banks : banks.filter((b) => b.status === filter);

  const actions = [
    {
      label: "Edit",
      onClick: openEdit,
    },
    {
      label: "Toggle",
      onClick: handleToggle,
    },
    {
      label: "Delete",
      onClick: handleDelete,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bank Management</h2>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button
            onClick={openCreate}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md shadow hover:bg-indigo-700"
          >
            New Bank
          </button>
        </div>
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}
      {loading ? (
        <div className="p-6 text-gray-500">Loading banks...</div>
      ) : (
        <DataGrid
          headers={[
            "Name",
            "Account Name",
            "Account Number",
            "Status",
            "Updated",
          ]}
          rows={filtered.map((b) => [
            <div className="flex items-center space-x-2" key={b.id}>
              {b.logoUrl ? (
                <img
                  src={b.logoUrl}
                  alt={b.name}
                  className="h-8 w-8 object-contain rounded"
                />
              ) : (
                <div className="h-8 w-8 bg-gray-200 rounded" />
              )}
              <span className="font-medium">{b.name}</span>
            </div>,
            b.accountName,
            b.accountNumber,
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                b.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {b.status}
            </span>,
            new Date(b.updatedAt).toLocaleDateString(),
          ])}
          actions={actions}
          onRowAction={(label, rowIndex) => {
            const bank = filtered[rowIndex];
            const action = actions.find((a) => a.label === label);
            if (action) action.onClick(bank);
          }}
        />
      )}

      <FormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={isCreate ? "Create Bank" : `Edit Bank: ${form.name}`}
        onSubmit={handleSubmit}
        submitLabel={isCreate ? "Create" : "Save"}
        disableSubmit={!form.name || !form.accountName || !form.accountNumber}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
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
              className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2"
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
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
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
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
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
                className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
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
