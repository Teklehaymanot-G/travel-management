import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import {
  getWitnessById,
  getWitnessComments,
  addWitnessComment,
  deleteWitnessComment,
} from "../../services/witnessService";
import { useAuth } from "../../contexts/AuthContext";

export default function WitnessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        getWitnessById(id),
        getWitnessComments(id, { page: 1, limit: 20 }),
      ]);
      setItem(p?.data || null);
      setComments(c?.data || []);
    } catch (e) {
      // noop
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const onAdd = async (e) => {
    e.preventDefault();
    if (!user) return alert("Please login to comment");
    if (!commentText.trim()) return;
    await addWitnessComment(id, { content: commentText.trim() });
    setCommentText("");
    load();
  };

  const canDelete = (c) => {
    if (!user) return false;
    const role = (user.role || "").toUpperCase();
    if (role === "MANAGER" || role === "SUPERVISOR") return true;
    return c?.user?.id === user?.id;
  };

  const onDelete = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    await deleteWitnessComment(commentId);
    load();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading witness...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="max-w-4xl mx-auto p-6">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Witness Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The witness you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/admin/witnesses")}>
            Back to Witnesses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => navigate("/admin/witnesses")}
          className="flex items-center gap-2"
        >
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Witnesses
        </Button>
        <div className="text-sm text-gray-500">
          {item?.author?.name || "Unknown"} •{" "}
          {new Date(item.createdAt).toLocaleString()}
        </div>
      </div>

      {/* Witness Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {item.title}
          </h1>
          <div className="flex items-center gap-4 mb-6">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                item.status === "PUBLISHED"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {item.status}
            </span>
            <span className="text-gray-500">
              {comments.length} comment{comments.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div
            className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap"
            style={{ fontFamily: "inherit" }}
          >
            {item.content}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Comments ({comments.length})
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">
                      {comment?.user?.name || "Anonymous"}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {canDelete(comment) && (
                    <button
                      onClick={() => onDelete(comment.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Form */}
        <div className="p-6 border-t border-gray-200">
          <form onSubmit={onAdd}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add a Comment
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
              placeholder={
                user
                  ? "Write your comment..."
                  : "Please login to write a comment"
              }
              disabled={!user}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-sm text-gray-500">
                {user
                  ? `Commenting as ${user.name}`
                  : "You must be logged in to comment"}
              </span>
              <Button type="submit" disabled={!user || !commentText.trim()}>
                Post Comment
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
