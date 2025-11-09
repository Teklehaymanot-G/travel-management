import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import CommentCard from "../../components/comments/CommentCard";
import DocumentCard from "../../components/documents/DocumentCard";
import Button from "../../components/ui/Button";
import { getTravel, updateTravel } from "../../services/travelService";
import { comments, documents } from "../../utils/dummyData";
import { formatCurrency, getStatusBadge } from "../../utils/helpers";

const TravelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("details");
  const [newComment, setNewComment] = useState("");

  const [travel, setTravel] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const fetchTravel = async () => {
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
    };
    fetchTravel();
  }, [id]);

  if (!travel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
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
      </div>
    );
  }

  // Filter related documents and comments
  const travelDocuments = documents.filter((doc) => doc.travelId === travel.id);
  const travelComments = comments.filter(
    (comment) => comment.travelId === travel.id
  );

  const handleToggleEdit = () => setIsEditing((e) => !e);

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEdit = async () => {
    try {
      setActionMessage("");
      await updateTravel(travel.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        price: Number(editForm.price),
        itinerary: editForm.itinerary,
        requirements: editForm.requirements,
      });
      setIsEditing(false);
      const refreshed = await getTravel(travel.id);
      setTravel(refreshed.data);
      setActionMessage("Travel updated successfully.");
      setTimeout(() => setActionMessage(""), 3000);
    } catch (e) {
      console.error(e);
      setActionMessage("Failed to update travel.");
    }
  };

  const handleStatusUpdate = async (nextStatus) => {
    try {
      setStatusUpdating(true);
      setActionMessage("");
      await updateTravel(travel.id, { status: nextStatus });
      const refreshed = await getTravel(travel.id);
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

  const handleAddComment = () => {
    if (newComment.trim() === "") return;
    // In a real app, this would call an API
    console.log("Adding comment:", newComment);
    setNewComment("");
    alert("Comment added! (This is a demo)");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            {isEditing ? (
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => handleEditChange("title", e.target.value)}
                className="border px-2 py-1 rounded w-full max-w-sm"
              />
            ) : (
              travel.title
            )}
          </h1>
          <div className="flex items-center mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                getStatusBadge(travel.status).color
              }`}
            >
              {getStatusBadge(travel.status).text}
            </span>
            <span className="ml-3 text-gray-600">
              {new Date(travel.startDate).toLocaleDateString()} -{" "}
              {new Date(travel.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Button onClick={() => navigate("/admin/travels")} variant="secondary">
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
                  travel.imageUrl && travel.imageUrl.trim() !== ""
                    ? travel.imageUrl
                    : "https://i0.wp.com/visitbalitour.com/wp-content/uploads/2015/07/bali-tour.jpg?fit=1500%2C834&ssl=1"
                }
                alt={travel.title || "Travel image"}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {["details", "itinerary", "requirements", "comments"].map(
                  (tab) => (
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
                  )
                )}
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
                      value={editForm.description}
                      onChange={(e) =>
                        handleEditChange("description", e.target.value)
                      }
                      className="w-full border rounded p-2 mb-4"
                    />
                  ) : (
                    <p className="text-gray-600 mb-6">{travel.description}</p>
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
                            value={editForm.price}
                            onChange={(e) =>
                              handleEditChange("price", e.target.value)
                            }
                            className="border rounded px-2 py-1 w-32"
                          />
                        ) : (
                          formatCurrency(travel.price)
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">per person</p>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-green-800 mb-1">
                        Bookings
                      </h4>
                      <p className="text-xl font-bold">{travel.bookings}</p>
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
                      value={editForm.itinerary}
                      onChange={(e) =>
                        handleEditChange("itinerary", e.target.value)
                      }
                      className="w-full border rounded p-2 whitespace-pre-wrap font-mono text-sm"
                      placeholder="Day 1: ...\nDay 2: ..."
                    />
                  ) : (
                    <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-sans">
                      {travel.itinerary || "No itinerary available"}
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
                      value={editForm.requirements}
                      onChange={(e) =>
                        handleEditChange("requirements", e.target.value)
                      }
                      className="w-full border rounded p-2 whitespace-pre-wrap font-mono text-sm"
                      placeholder="Passport validity, vaccination, ..."
                    />
                  ) : (
                    <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-sans">
                      {travel.requirements || "No special requirements"}
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

                  {travelComments.length > 0 ? (
                    <div className="space-y-4">
                      {travelComments.map((comment) => (
                        <CommentCard key={comment.id} comment={comment} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No comments yet. Be the first to comment!
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
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
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
                    <Button variant="secondary" onClick={handleCancelBooking}>
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
    </div>
  );
};

// Add default export
export default TravelDetailPage;
