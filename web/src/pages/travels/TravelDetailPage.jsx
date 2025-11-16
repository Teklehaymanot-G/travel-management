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
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Bookings
                      </h3>
                      {Array.isArray(travel?.bookings) &&
                      travel.bookings.length > 0 ? (
                        <div className="space-y-4">
                          {travel.bookings.map((b) => (
                            <div
                              key={b.id}
                              className="border rounded-lg p-4 bg-gray-50 flex flex-col gap-2"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">
                                  Booking #{b.id}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${
                                    b.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : b.status === "APPROVED"
                                      ? "bg-green-100 text-green-700"
                                      : b.status === "REJECTED"
                                      ? "bg-red-100 text-red-600"
                                      : "bg-gray-200 text-gray-600"
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(b.createdAt).toLocaleString()}
                              </div>
                              <div className="text-sm">
                                <span className="font-medium">Traveler:</span>{" "}
                                {b.traveler?.name ||
                                  b.traveler?.phone ||
                                  "Unknown"}
                              </div>
                              {Array.isArray(b.participants) &&
                                b.participants.length > 0 && (
                                  <div>
                                    <span className="text-sm font-medium">
                                      Participants:
                                    </span>
                                    <ul className="list-disc ml-5 text-sm mt-1">
                                      {b.participants.map((p, idx) => (
                                        <li key={idx}>
                                          {p.name || `Traveler ${idx + 1}`}{" "}
                                          (Age: {p.age})
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No bookings found for this travel.
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
