import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CommentCard from "../../components/comments/CommentCard";
import DocumentCard from "../../components/documents/DocumentCard";
import Button from "../../components/ui/Button";
import { getTravel, updateTravel } from "../../services/travelService";
import {
  getTravelComments,
  createComment,
  likeComment,
  unlikeComment,
  deleteComment,
} from "../../services/commentService";
import { formatCurrency, getStatusBadge } from "../../utils/helpers";
import { updatePaymentStatus } from "../../services/paymentService";

const TravelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("details");
  const [newComment, setNewComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsMeta, setCommentsMeta] = useState({ page: 1, pages: 1 });

  const [travel, setTravel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [bookingFilter, setBookingFilter] = useState("PENDING");
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [reloading, setReloading] = useState(false);

  useEffect(() => {
    const fetchTravel = async () => {
      try {
        const res = await getTravel(id);
        const t = res?.data;
        setTravel(t);
        setEditForm({
          title: t?.title || "",
          description: t?.description || "",
          price: t?.price || 0,
          itinerary: t?.itinerary || "",
          requirements: t?.requirements || "",
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchTravel();
  }, [id]);
  // Removed erroneous console.log referencing undefined variable 'tra' that caused runtime error.

  // Real documents from travel object; comments fetched separately for likes info
  const travelDocuments = travel?.documents || [];
  // Load comments when comments tab activated or after posting/deleting/liking
  const loadComments = useCallback(
    async (reset = false) => {
      if (!travel?.id) return;
      try {
        setCommentsLoading(true);
        const res = await getTravelComments(travel.id, {
          page: reset ? 1 : commentsMeta.page,
          limit: 20,
        });
        if (res?.success) {
          setComments(res.data);
          setCommentsMeta(res.pagination);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCommentsLoading(false);
      }
    },
    [travel?.id, commentsMeta.page]
  );

  useEffect(() => {
    if (activeTab === "comments") {
      loadComments(true);
    }
  }, [activeTab, loadComments]);

  const handleToggleEdit = () => setIsEditing((e) => !e);

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      setActionMessage("");
      await updateTravel(travel?.id, {
        title: editForm?.title.trim(),
        description: editForm?.description.trim(),
        price: Number(editForm?.price),
        itinerary: editForm?.itinerary,
        requirements: editForm?.requirements,
      });
      setIsEditing(false);
      const refreshed = await getTravel(travel?.id);
      setTravel(refreshed.data);
      setActionMessage("Travel updated successfully.");
      setTimeout(() => setActionMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setActionMessage("Failed to update travel?.");
    }
  };

  const handleStatusUpdate = async (nextStatus) => {
    try {
      setStatusUpdating(true);
      setActionMessage("");
      await updateTravel(travel?.id, { status: nextStatus });
      const refreshed = await getTravel(travel?.id);
      setTravel(refreshed.data);
      setActionMessage(`Status changed to ${nextStatus}.`);
      setTimeout(() => setActionMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setActionMessage("Failed to update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleCancelBooking = async () => {
    // Placeholder: in a full UI we'd select a booking; for now, travelers cancel their own latest booking
    try {
      setActionMessage("");
      // This requires knowing booking id; left for future expansion.
      setActionMessage("Provide booking selection to cancel.");
    } catch (e) {
      console.error(e);
      setActionMessage("Failed to cancel booking.");
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim() === "") return;
    try {
      setActionMessage("");
      await createComment(travel?.id, { content: newComment.trim() });
      setNewComment("");
      await loadComments(true);
      setActionMessage("Comment posted.");
      setTimeout(() => setActionMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setActionMessage("Failed to post comment.");
      setTimeout(() => setActionMessage(""), 3000);
    }
  };

  const handleLikeToggle = async (id, likedByMe) => {
    try {
      const res = likedByMe ? await unlikeComment(id) : await likeComment(id);
      // Update specific comment
      setComments((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                likesCount: res.data.likesCount,
                likedByMe: res.data.likedByMe,
              }
            : c
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteComment = async (id) => {
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      setActionMessage("Comment deleted.");
      setTimeout(() => setActionMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setActionMessage("Failed to delete comment.");
      setTimeout(() => setActionMessage(""), 3000);
    }
  };

  const handleApproveBooking = async (bookingId) => {
    if (!window.confirm(`Approve booking #${bookingId}?`)) return;

    try {
      setApproveLoading(true);
      setActionMessage("Approving booking...");

      await updatePaymentStatus(bookingId, { status: "APPROVED" });

      // Refresh the travel data
      const refreshed = await getTravel(id);
      setTravel(refreshed.data);

      setActionMessage("Booking approved successfully!");
      setTimeout(() => setActionMessage(""), 3000);

      setShowBookingDetail(false);
    } catch (e) {
      console.error("Failed to approve booking:", e);
      setActionMessage(e.message || "Failed to approve booking");
      setTimeout(() => setActionMessage(""), 3000);
    } finally {
      setApproveLoading(false);
    }
  };

  const handleRejectBooking = async (bookingId, comment) => {
    if (!window.confirm(`Reject booking #${bookingId}?`)) return;

    try {
      setRejectLoading(true);
      setActionMessage("Rejecting booking...");

      await updatePaymentStatus(bookingId, {
        status: "REJECTED",
        message: comment.trim() || undefined,
      });

      // Refresh the travel data
      const refreshed = await getTravel(id);
      setTravel(refreshed.data);

      setActionMessage("Booking rejected successfully!");
      setTimeout(() => setActionMessage(""), 3000);

      setShowBookingDetail(false);
      setRejectComment("");
    } catch (e) {
      console.error("Failed to reject booking:", e);
      setActionMessage(e.message || "Failed to reject booking");
      setTimeout(() => setActionMessage(""), 3000);
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {!travel && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Travel Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The travel package you're looking for doesn't exist or has been
            removed.
          </p>
          <Button onClick={() => navigate("/admin/travels")} variant="primary">
            View All Travels
          </Button>
        </div>
      )}
      {travel && (
        <>
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm?.title}
                    onChange={(e) => handleEditChange("title", e.target.value)}
                    className="border px-2 py-1 rounded w-full max-w-sm"
                  />
                ) : (
                  travel?.title
                )}
              </h1>
              <div className="flex items-center mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    getStatusBadge(travel?.status).color
                  }`}
                >
                  {getStatusBadge(travel?.status).text}
                </span>
                <span className="ml-3 text-gray-600">
                  {new Date(travel?.startDate).toLocaleDateString()} -{" "}
                  {new Date(travel?.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button
              onClick={() => navigate("/admin/travels")}
              variant="secondary"
            >
              Back to Travels
            </Button>
          </div>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Column */}
            <div className="md:w-2/3">
              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <div className="bg-gray-200 rounded-xl w-full h-64">
                  <img
                    src={
                      travel?.imageUrl && travel?.imageUrl.trim() !== ""
                        ? travel?.imageUrl
                        : "https://i0.wp.com/visitbalitour.com/wp-content/uploads/2015/07/bali-tour.jpg?fit=1500%2C834&ssl=1"
                    }
                    alt={travel?.title || "Travel image"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    {[
                      "details",
                      "itinerary",
                      "requirements",
                      "comments",
                      "bookings",
                    ].map((tab) => (
                      <button
                        key={tab}
                        className={`py-4 px-6 text-center font-medium text-sm ${
                          activeTab === tab
                            ? "border-b-2 border-blue-500 text-blue-600"
                            : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                    ))}
                  </nav>
                </div>
                <div className="p-6">
                  {activeTab === "details" && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center justify-between">
                        <span>Travel Details</span>
                        {!isEditing && user?.role !== "TRAVELER" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleToggleEdit}
                          >
                            Edit
                          </Button>
                        )}
                      </h3>
                      {isEditing ? (
                        <textarea
                          rows={4}
                          value={editForm?.description}
                          onChange={(e) =>
                            handleEditChange("description", e.target.value)
                          }
                          className="w-full border rounded p-2 mb-4"
                        />
                      ) : (
                        <p className="text-gray-600 mb-6">
                          {travel?.description}
                        </p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-blue-800 mb-1">
                            Price
                          </h4>
                          <p className="text-xl font-bold">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editForm?.price}
                                onChange={(e) =>
                                  handleEditChange("price", e.target.value)
                                }
                                className="border rounded px-2 py-1 w-32"
                              />
                            ) : (
                              formatCurrency(travel?.price)
                            )}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            per person
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-green-800 mb-1">
                            Bookings
                          </h4>
                          <p className="text-xl font-bold">
                            {travel?.bookings?.length}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            travelers booked
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "itinerary" && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Itinerary
                      </h3>
                      {isEditing ? (
                        <textarea
                          rows={8}
                          value={editForm?.itinerary}
                          onChange={(e) =>
                            handleEditChange("itinerary", e.target.value)
                          }
                          className="w-full border rounded p-2 whitespace-pre-wrap font-mono text-sm"
                          placeholder="Day 1: ...\nDay 2: ..."
                        />
                      ) : (
                        <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-sans">
                          {travel?.itinerary || "No itinerary available"}
                        </pre>
                      )}
                    </div>
                  )}
                  {activeTab === "requirements" && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Requirements
                      </h3>
                      {isEditing ? (
                        <textarea
                          rows={6}
                          value={editForm?.requirements}
                          onChange={(e) =>
                            handleEditChange("requirements", e.target.value)
                          }
                          className="w-full border rounded p-2 whitespace-pre-wrap font-mono text-sm"
                          placeholder="Passport validity, vaccination, ..."
                        />
                      ) : (
                        <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-sans">
                          {travel?.requirements || "No special requirements"}
                        </pre>
                      )}
                    </div>
                  )}
                  {activeTab === "comments" && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Comments & Questions
                      </h3>
                      <div className="mb-6">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment or question..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={3}
                        />
                        <div className="mt-2 flex justify-end">
                          <Button onClick={handleAddComment} variant="primary">
                            Post Comment
                          </Button>
                        </div>
                      </div>
                      {commentsLoading ? (
                        <div className="py-8 text-center text-gray-500 text-sm">
                          Loading comments...
                        </div>
                      ) : comments.length > 0 ? (
                        <div className="space-y-4">
                          {comments.map((comment) => (
                            <CommentCard
                              key={comment.id}
                              comment={comment}
                              onLikeToggle={handleLikeToggle}
                              onDelete={handleDeleteComment}
                              canDelete={
                                user?.role === "MANAGER" ||
                                comment.traveler?.id === user?.id
                              }
                              isMine={comment.traveler?.id === user?.id}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No comments yet. Be the first to comment!
                        </div>
                      )}
                    </div>
                  )}
                  {activeTab === "bookings" && (
                    <div>
                      {/* Booking Stats */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-lg border p-4 text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            {travel?.bookings?.length || 0}
                          </div>
                          <div className="text-sm text-gray-500">
                            Total Bookings
                          </div>
                        </div>
                        <div className="bg-white rounded-lg border p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-600">
                            {travel?.bookings?.filter(
                              (b) => b.status === "PENDING"
                            ).length || 0}
                          </div>
                          <div className="text-sm text-gray-500">Pending</div>
                        </div>
                        <div className="bg-white rounded-lg border p-4 text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {travel?.bookings?.filter(
                              (b) => b.status === "APPROVED"
                            ).length || 0}
                          </div>
                          <div className="text-sm text-gray-500">Approved</div>
                        </div>
                        <div className="bg-white rounded-lg border p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {travel?.bookings?.reduce(
                              (total, b) =>
                                total + (b.participants?.length || 1),
                              0
                            ) || 0}
                          </div>
                          <div className="text-sm text-gray-500">
                            Total Travelers
                          </div>
                        </div>
                      </div>

                      {/* Booking Filters */}
                      <div className="bg-white rounded-lg border p-4 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Bookings
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {[
                              {
                                key: "ALL",
                                label: "All",
                                count: travel?.bookings?.length || 0,
                              },
                              {
                                key: "PENDING",
                                label: "Pending",
                                count:
                                  travel?.bookings?.filter(
                                    (b) => b?.payment?.status === "PENDING"
                                  ).length || 0,
                              },
                              {
                                key: "APPROVED",
                                label: "Approved",
                                count:
                                  travel?.bookings?.filter(
                                    (b) => b?.payment?.status === "APPROVED"
                                  ).length || 0,
                              },
                              {
                                key: "REJECTED",
                                label: "Rejected",
                                count:
                                  travel?.bookings?.filter(
                                    (b) => b?.payment?.status === "REJECTED"
                                  ).length || 0,
                              },
                            ].map((filter) => (
                              <button
                                key={filter.key}
                                onClick={() => setBookingFilter(filter.key)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                  bookingFilter === filter.key
                                    ? filter.key === "PENDING"
                                      ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                      : filter.key === "APPROVED"
                                      ? "bg-green-100 text-green-700 border border-green-300"
                                      : filter.key === "REJECTED"
                                      ? "bg-red-100 text-red-700 border border-red-300"
                                      : "bg-blue-100 text-blue-700 border border-blue-300"
                                    : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200"
                                }`}
                              >
                                {filter.label}
                                <span
                                  className={`px-1.5 py-0.5 rounded-full text-xs ${
                                    bookingFilter === filter.key
                                      ? filter.key === "PENDING"
                                        ? "bg-yellow-200 text-yellow-800"
                                        : filter.key === "APPROVED"
                                        ? "bg-green-200 text-green-800"
                                        : filter.key === "REJECTED"
                                        ? "bg-red-200 text-red-800"
                                        : "bg-blue-200 text-blue-800"
                                      : "bg-gray-200 text-gray-600"
                                  }`}
                                >
                                  {filter.count}
                                </span>
                              </button>
                            ))}
                          </div>
                          <button
                            className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                            onClick={async () => {
                              setReloading(true);
                              const refreshed = await getTravel(id);
                              setTravel(refreshed.data);
                              setBookingFilter("PENDING");
                            }}
                          >
                            <svg
                              className={`w-5 h-5 ${
                                reloading ? "animate-spin" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {Array.isArray(travel?.bookings) &&
                      travel.bookings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                          {travel.bookings
                            .filter((booking) => {
                              if (bookingFilter === "ALL") return true;
                              return booking?.payment?.status === bookingFilter;
                            })
                            .map((b) => {
                              const participantCount =
                                b.participants?.length || 1;
                              const totalAmount =
                                b.amount || travel.price * participantCount;

                              return (
                                <div
                                  key={b.id}
                                  className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow duration-200"
                                >
                                  {/* Header */}
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <span className="text-sm font-semibold text-gray-700 block">
                                        #{b.id}
                                      </span>
                                      <span className="text-xs text-gray-500 block mt-1">
                                        {new Date(
                                          b.createdAt
                                        ).toLocaleDateString()}{" "}
                                        •{" "}
                                        {new Date(
                                          b.createdAt
                                        ).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <span
                                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        b?.payment?.status === "PENDING"
                                          ? "text-yellow-700 "
                                          : b?.payment?.status === "APPROVED"
                                          ? "text-green-700"
                                          : b?.payment?.status === "REJECTED"
                                          ? "text-red-600"
                                          : "text-gray-600"
                                      }`}
                                    >
                                      {b.payment?.status}
                                    </span>
                                  </div>

                                  {/* Traveler Info */}
                                  <div className="mb-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 text-sm">
                                          👤
                                        </span>
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">
                                          {b.traveler?.name ||
                                            "Unknown Traveler"}
                                        </div>
                                        {b.traveler?.phone && (
                                          <div className="text-xs text-gray-500">
                                            {b.traveler.phone}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Booking Details */}
                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="text-center p-2 bg-gray-50 rounded">
                                      <div className="text-lg font-bold text-gray-900">
                                        {participantCount}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Participants
                                      </div>
                                    </div>
                                    <div className="text-center p-2 bg-gray-50 rounded">
                                      <div className="text-lg font-bold text-green-600">
                                        ${totalAmount.toLocaleString()}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Amount
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex gap-2 mt-4 pt-3 border-t">
                                    <button
                                      onClick={() => {
                                        console.log(b);
                                        setSelectedBooking(b);
                                        setShowBookingDetail(true);
                                      }}
                                      className="flex-1 border border-gray-300 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-50 transition-colors"
                                    >
                                      View Details
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                          <div className="text-gray-400 text-6xl mb-4">📝</div>
                          <div className="text-gray-500 text-lg mb-2">
                            No bookings found
                          </div>
                          <div className="text-gray-400 text-sm">
                            There are no bookings for this travel package yet.
                          </div>
                        </div>
                      )}

                      {/* Show empty state when filter returns no results */}
                      {Array.isArray(travel?.bookings) &&
                        travel.bookings.length > 0 &&
                        travel.bookings.filter((booking) => {
                          if (bookingFilter === "ALL") return true;
                          return booking?.payment?.status === bookingFilter;
                        }).length === 0 && (
                          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <div className="text-gray-400 text-6xl mb-4">
                              {bookingFilter === "PENDING" && "⏳"}
                              {bookingFilter === "APPROVED" && "✅"}
                              {bookingFilter === "REJECTED" && "❌"}
                              {bookingFilter === "ALL" && "📝"}
                            </div>
                            <div className="text-gray-500 text-lg mb-2">
                              No {bookingFilter.toLowerCase()} bookings
                            </div>
                            <div className="text-gray-400 text-sm">
                              {bookingFilter === "PENDING" &&
                                "There are no pending bookings to review."}
                              {bookingFilter === "APPROVED" &&
                                "No bookings have been approved yet."}
                              {bookingFilter === "REJECTED" &&
                                "No bookings have been rejected."}
                              {bookingFilter === "ALL" && "No bookings found."}
                            </div>
                          </div>
                        )}

                      {/* Booking Detail Modal */}
                      {showBookingDetail && selectedBooking && (
                        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm transition-opacity duration-300">
                          <div
                            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto transform transition-transform duration-300 scale-100"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-6">
                              {/* Header */}
                              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                                <div>
                                  <h2 className="text-2xl font-bold text-gray-900">
                                    Booking #{selectedBooking.id}
                                  </h2>
                                  <p className="text-sm text-gray-500 mt-1">
                                    Created on{" "}
                                    {new Date(
                                      selectedBooking.createdAt
                                    ).toLocaleDateString()}{" "}
                                    at{" "}
                                    {new Date(
                                      selectedBooking.createdAt
                                    ).toLocaleTimeString()}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setShowBookingDetail(false);
                                    setRejectComment("");
                                  }}
                                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                                >
                                  <svg
                                    className="w-6 h-6"
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
                                </button>
                              </div>

                              {/* Status Badge */}
                              <div className="mb-6">
                                <span
                                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${
                                    selectedBooking.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                      : selectedBooking.status === "APPROVED"
                                      ? "bg-green-100 text-green-800 border border-green-200"
                                      : selectedBooking.status === "REJECTED"
                                      ? "bg-red-100 text-red-800 border border-red-200"
                                      : "bg-gray-100 text-gray-800 border border-gray-200"
                                  }`}
                                >
                                  <span
                                    className={`w-2 h-2 rounded-full mr-2 ${
                                      selectedBooking.status === "PENDING"
                                        ? "bg-yellow-500"
                                        : selectedBooking.status === "APPROVED"
                                        ? "bg-green-500"
                                        : selectedBooking.status === "REJECTED"
                                        ? "bg-red-500"
                                        : "bg-gray-500"
                                    }`}
                                  ></span>
                                  {selectedBooking.status}
                                </span>
                              </div>

                              {/* Traveler Information */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                  <svg
                                    className="w-5 h-5 text-gray-400 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                  </svg>
                                  Traveler Information
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-2">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-500 block mb-1">
                                        Name
                                      </label>
                                      <p className="text-gray-900 font-medium">
                                        {selectedBooking.traveler?.name ||
                                          "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500 block mb-1">
                                        Phone
                                      </label>
                                      <p className="text-gray-900 font-medium">
                                        {selectedBooking.traveler?.phone ||
                                          "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500 block mb-1">
                                        Traveler ID
                                      </label>
                                      <p className="text-gray-900 font-mono">
                                        #{selectedBooking.travelerId}
                                      </p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-500 block mb-1">
                                        Travel ID
                                      </label>
                                      <p className="text-gray-900 font-mono">
                                        #{selectedBooking.travelId}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Participants */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                  <svg
                                    className="w-5 h-5 text-gray-400 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                  Participants (
                                  {selectedBooking.participants?.length || 0})
                                </h3>
                                <div className="space-y-3 mt-2">
                                  {selectedBooking.participants?.map(
                                    (participant, index) => (
                                      <div
                                        key={index}
                                        className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                                      >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div>
                                            <label className="text-sm font-medium text-gray-500 block mb-1">
                                              Name
                                            </label>
                                            <p className="text-gray-900 font-medium">
                                              {participant.name ||
                                                `Participant ${index + 1}`}
                                            </p>
                                          </div>
                                          <div>
                                            <label className="text-sm font-medium text-gray-500 block mb-1">
                                              Age
                                            </label>
                                            <p className="text-gray-900">
                                              {participant.age} years
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                  {(!selectedBooking.participants ||
                                    selectedBooking.participants.length ===
                                      0) && (
                                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                      <svg
                                        className="w-12 h-12 mx-auto text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                        />
                                      </svg>
                                      <p className="mt-2">
                                        No participants listed
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Booking Details */}
                              <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                  <svg
                                    className="w-5 h-5 text-gray-400 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                  </svg>
                                  Booking Details
                                </h3>
                                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-2">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                      <label className="text-sm font-medium text-gray-500 block mb-2">
                                        Participants
                                      </label>
                                      <p className="text-2xl font-bold text-gray-900">
                                        {selectedBooking.participants?.length ||
                                          1}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <label className="text-sm font-medium text-gray-500 block mb-2">
                                        Total Amount
                                      </label>
                                      <p className="text-2xl font-bold text-green-600">
                                        $
                                        {(
                                          selectedBooking.amount ||
                                          travel.price *
                                            (selectedBooking.participants
                                              ?.length || 1)
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <label className="text-sm font-medium text-gray-500 block mb-2">
                                        Created
                                      </label>
                                      <p className="text-sm text-gray-900 font-medium">
                                        {new Date(
                                          selectedBooking.createdAt
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <label className="text-sm font-medium text-gray-500 block mb-2">
                                        Last Updated
                                      </label>
                                      <p className="text-sm text-gray-900 font-medium">
                                        {new Date(
                                          selectedBooking.updatedAt
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons - Only show for PENDING status */}
                              {selectedBooking?.payment?.status ===
                                "PENDING" && (
                                <div className="border-t border-gray-200 pt-6">
                                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <svg
                                      className="w-5 h-5 text-gray-400 mr-2"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    </svg>
                                    Manage Booking
                                  </h3>

                                  {/* Approve Button */}
                                  <button
                                    onClick={() => {
                                      handleApproveBooking(
                                        selectedBooking?.payment?.id
                                      );
                                      setShowBookingDetail(false);
                                    }}
                                    className="w-full mb-4 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center shadow-md hover:shadow-lg"
                                  >
                                    {approveLoading ? (
                                      <>
                                        <svg
                                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                        </svg>
                                        Approving...
                                      </>
                                    ) : (
                                      <>
                                        <svg
                                          className="w-5 h-5 mr-2"
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
                                        Approve Booking
                                      </>
                                    )}
                                  </button>

                                  {/* Reject with Comments */}
                                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                                    <label className="block text-sm font-medium text-red-800 mb-2 flex items-center">
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
                                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      Reject Booking
                                    </label>
                                    <textarea
                                      placeholder="Enter reason for rejection..."
                                      rows="3"
                                      className="w-full border border-red-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-3 bg-white"
                                      value={rejectComment}
                                      onChange={(e) =>
                                        setRejectComment(e.target.value)
                                      }
                                    />
                                    <button
                                      onClick={() => {
                                        if (rejectComment.trim()) {
                                          handleRejectBooking(
                                            selectedBooking?.payment?.id,
                                            rejectComment
                                          );
                                          setShowBookingDetail(false);
                                          setRejectComment("");
                                        }
                                      }}
                                      disabled={!rejectComment.trim()}
                                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center shadow-md hover:shadow-lg"
                                    >
                                      {rejectLoading ? (
                                        <>
                                          <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                          >
                                            <circle
                                              className="opacity-25"
                                              cx="12"
                                              cy="12"
                                              r="10"
                                              stroke="currentColor"
                                              strokeWidth="4"
                                            ></circle>
                                            <path
                                              className="opacity-75"
                                              fill="currentColor"
                                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                          </svg>
                                          Rejecting...
                                        </>
                                      ) : (
                                        <>
                                          <svg
                                            className="w-5 h-5 mr-2"
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
                                          Reject Booking
                                        </>
                                      )}
                                    </button>
                                    {!rejectComment.trim() && (
                                      <p className="text-red-600 text-sm mt-2 text-center flex items-center justify-center">
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
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                          />
                                        </svg>
                                        Please provide a reason for rejection
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Close Button */}
                              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                                <button
                                  onClick={() => {
                                    setShowBookingDetail(false);
                                    setRejectComment("");
                                  }}
                                  className="border border-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
                                >
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
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  Close
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Right Column */}
            <div className="md:w-1/3">
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Documents
                </h3>
                {travelDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {travelDocuments.map((document) => (
                      <DocumentCard key={document.id} document={document} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No documents available
                  </div>
                )}
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Actions
                </h3>
                <div className="space-y-3">
                  {user?.role === "TRAVELER" ? (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => navigate(`/travel/travels/${id}/register`)}
                    >
                      Book This Travel
                    </Button>
                  ) : (
                    <>
                      {!isEditing ? (
                        <Button
                          variant="primary"
                          fullWidth
                          onClick={handleToggleEdit}
                        >
                          Edit Travel Details
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            fullWidth
                            onClick={handleToggleEdit}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            fullWidth
                            onClick={handleSaveEdit}
                          >
                            Save
                          </Button>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="warning"
                          disabled={statusUpdating}
                          onClick={() => handleStatusUpdate("ONGOING")}
                        >
                          Set Ongoing
                        </Button>
                        <Button
                          variant="secondary"
                          disabled={statusUpdating}
                          onClick={() => handleStatusUpdate("COMPLETED")}
                        >
                          Set Completed
                        </Button>
                        <Button
                          variant="danger"
                          disabled={statusUpdating}
                          onClick={() => handleStatusUpdate("CANCELLED")}
                        >
                          Cancel Travel
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={handleCancelBooking}
                        >
                          Cancel Booking
                        </Button>
                      </div>
                    </>
                  )}
                  {actionMessage && (
                    <div className="text-xs text-center text-blue-600 mt-2">
                      {actionMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Add default export
export default TravelDetailPage;
