import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CommentCard from "../../components/comments/CommentCard";
import DocumentCard from "../../components/documents/DocumentCard";
import Button from "../../components/ui/Button";
import { getTravel } from "../../services/travelService";
import { comments, documents } from "../../utils/dummyData";
import { formatCurrency, getStatusBadge } from "../../utils/helpers";

const TravelDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [newComment, setNewComment] = useState("");

  const [travel, setTravel] = useState([]);

  useEffect(() => {
    const fetchTravels = async () => {
      const data = await getTravel(id);
      console.log(data?.data);
      setTravel(data?.data || []);
    };
    fetchTravels();
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
          <h1 className="text-2xl font-bold text-gray-800">{travel.title}</h1>
          <div className="flex items-center mt-2">
            <span
              className={`px-2 py-1 rounded-full text-xs ${
                getStatusBadge(travel.status).color
              }`}
            >
              {getStatusBadge(travel.status).text}
            </span>
            <span className="ml-3 text-gray-600">
              {travel.startDate} - {travel.endDate}
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
                  "https://i0.wp.com/visitbalitour.com/wp-content/uploads/2015/07/bali-tour.jpg?fit=1500%2C834&ssl=1"
                }
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Travel Details
                  </h3>
                  <p className="text-gray-600 mb-6">{travel.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">
                        Price
                      </h4>
                      <p className="text-xl font-bold">
                        {formatCurrency(travel.price)}
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
                  <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-sans">
                    {travel.itinerary || "No itinerary available"}
                  </pre>
                </div>
              )}

              {activeTab === "requirements" && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Requirements
                  </h3>
                  <pre className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-sans">
                    {travel.requirements || "No special requirements"}
                  </pre>
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
              <Button variant="primary" fullWidth>
                Edit Travel Details
              </Button>
              <Button variant="secondary" fullWidth>
                Manage Bookings
              </Button>
              <Button variant="warning" fullWidth>
                Update Status
              </Button>
              <Button variant="danger" fullWidth>
                Cancel Travel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add default export
export default TravelDetailPage;
