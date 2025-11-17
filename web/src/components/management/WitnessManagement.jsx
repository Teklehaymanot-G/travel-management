import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "../ui/DataTable";
import Button from "../../components/ui/Button";
import FormDialog from "../../ui/FormDialog";
import {
  adminListWitnesses,
  createWitness,
  updateWitness,
  setWitnessStatus,
  deleteWitness,
} from "../../services/witnessService";

const WitnessManagement = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    status: "DRAFT",
  });
  const [saving, setSaving] = useState(false);

  const loadWitnesses = async () => {
    setLoading(true);
    try {
      const res = await adminListWitnesses({
        page,
        limit,
        q: search,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setItems(res?.data || []);
      setTotal(res?.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to load witnesses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWitnesses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const published = items.filter(
      (item) => item.status === "PUBLISHED"
    ).length;
    const draft = items.filter((item) => item.status === "DRAFT").length;
    return { total, published, draft };
  }, [items]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateWitness(editingId, form);
      } else {
        await createWitness(form);
      }
      setIsDialogOpen(false);
      setEditingId(null);
      setForm({ title: "", content: "", status: "DRAFT" });
      await loadWitnesses();
    } catch (error) {
      console.error("Failed to save witness:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (witness) => {
    setEditingId(witness.id);
    setForm({
      title: witness.title,
      content: witness.content,
      status: witness.status,
    });
    setIsDialogOpen(true);
  };

  const handlePublishToggle = async (witness) => {
    const nextStatus = witness.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      await setWitnessStatus(witness.id, nextStatus);
      await loadWitnesses();
    } catch (error) {
      console.error("Failed to toggle status:", error);
    }
  };

  const handleDelete = async (witness) => {
    if (!window.confirm(`Delete witness "${witness.title}"?`)) return;
    try {
      await deleteWitness(witness.id);
      await loadWitnesses();
    } catch (error) {
      console.error("Failed to delete witness:", error);
    }
  };

  const handleViewDetail = (witness) => {
    navigate(`/admin/witnesses/${witness.id}`);
  };

  const handleSearch = () => {
    setPage(1);
    loadWitnesses();
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
    loadWitnesses();
  };

  const columns = [
    {
      key: "title",
      header: "Title",
      render: (item) => (
        <button
          onClick={() => handleViewDetail(item)}
          className="text-left text-blue-600 hover:text-blue-800 hover:underline font-semibold text-lg transition-colors"
        >
          {item.title}
        </button>
      ),
    },
    // {
    //   key: "excerpt",
    //   header: "Content",
    //   render: (item) => (
    //     <p className="text-gray-600 text-sm line-clamp-2">
    //       {item.content?.substring(0, 100)}...
    //     </p>
    //   ),
    // },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <span
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            item.status === "PUBLISHED"
              ? "bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200 shadow-sm"
              : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border-gray-200"
          }`}
        >
          {item.status === "PUBLISHED" ? (
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
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          {item.status}
        </span>
      ),
    },
    {
      key: "commentsCount",
      header: "Comments",
      render: (item) => (
        <div className="text-center">
          <span className="text-gray-700 font-semibold text-lg">
            {item.commentsCount ?? 0}
          </span>
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created Date",
      render: (item) => (
        <div className="text-right">
          <span className="text-gray-700 text-sm font-medium block">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
          <span className="text-gray-500 text-xs">
            {new Date(item.createdAt).toLocaleTimeString()}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(item)}
            className="flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
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
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePublishToggle(item)}
            className="flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
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
            {item.status === "PUBLISHED" ? "Unpublish" : "Publish"}
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(item)}
            className="flex items-center"
          >
            <svg
              className="w-4 h-4 mr-1"
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
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Witness Management
          </h2>
          <p className="text-sm text-gray-600">
            Manage witness testimonials and stories
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
          <Button onClick={() => setIsDialogOpen(true)} variant="primary">
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
            Create Witness
          </Button>
        </div>
      </div>

      {/* Statistical Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Witnesses"
          value={stats.total}
          icon="📖"
          color="blue"
        />
        <StatCard
          title="Published"
          value={stats.published}
          icon="✅"
          color="green"
        />
        <StatCard title="Drafts" value={stats.draft} icon="📝" color="gray" />
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <FormField label="Search Witnesses">
              <input
                className="form-input"
                placeholder="Search by title or content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </FormField>
          </div>
          <div>
            <FormField label="Status Filter">
              <select
                className="form-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </FormField>
          </div>
          <div className="flex items-end">
            <Button variant="primary" onClick={handleSearch} className="w-full">
              Apply Filters
            </Button>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
        <DataTable
          columns={columns}
          data={items}
          total={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          loading={loading}
          emptyMessage={
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
              <p className="text-gray-500 text-lg font-semibold">
                No witnesses found
              </p>
              <p className="text-gray-400 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          }
          rowKey="id"
          textClass="text-gray-700"
        />
      </div>

      {/* Form Dialog */}
      <FormDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingId(null);
          setForm({ title: "", content: "", status: "DRAFT" });
        }}
        title={editingId ? "Edit Witness" : "Create New Witness"}
        description="Share inspiring stories and testimonials from witnesses."
        onSubmit={handleSubmit}
        submitLabel={
          saving ? "Saving..." : editingId ? "Update Witness" : "Create Witness"
        }
        loading={saving}
        disableSubmit={!form.title || !form.content || saving}
        size="lg"
      >
        <div className="space-y-6">
          <FormField label="Title" required>
            <input
              className="form-input"
              placeholder="Enter witness title..."
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Content" required>
            <textarea
              className="form-input min-h-[200px] resize-vertical"
              placeholder="Share the witness story or testimony..."
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
          </FormField>

          <FormField label="Status">
            <select
              className="form-input"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </FormField>

          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border">
            <strong>Note:</strong> Published witnesses will be visible to users.
            Drafts are only visible to administrators.
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
      value: "text-blue-600",
    },
    green: {
      bg: "from-green-50 to-green-100",
      text: "text-green-700",
      border: "border-green-200",
      value: "text-green-600",
    },
    gray: {
      bg: "from-gray-50 to-gray-100",
      text: "text-gray-700",
      border: "border-gray-200",
      value: "text-gray-600",
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
          <p className={`text-3xl font-bold ${styles.value}`}>{value}</p>
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

export default WitnessManagement;
