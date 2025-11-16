import React from "react";
import { format } from "date-fns";

// Props: comment, onLikeToggle(id, likedByMe), onDelete(id), canDelete, isMine
const CommentCard = ({
  comment,
  onLikeToggle,
  onDelete,
  canDelete = false,
  isMine = false,
}) => {
  const handleLike = () =>
    onLikeToggle && onLikeToggle(comment.id, comment.likedByMe);
  const handleDelete = () => {
    if (onDelete) onDelete(comment.id);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start">
        <div className="bg-gray-100 border rounded-xl w-10 h-10 flex items-center justify-center text-xs text-gray-500">
          {comment.traveler?.name?.charAt(0) ||
            comment.traveler?.phone?.slice(-2) ||
            "?"}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-gray-900">
                  {comment.traveler?.name ||
                    comment.traveler?.phone ||
                    "Unknown"}
                </h4>
                {isMine && (
                  <span className="text-[10px] uppercase tracking-wide bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                    You
                  </span>
                )}
                {comment.type === "POST_TRAVEL" && (
                  <span className="text-[10px] uppercase tracking-wide bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                    Post
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
              </span>
            </div>
            {canDelete && (
              <button
                onClick={handleDelete}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Delete
              </button>
            )}
          </div>
          <p className="text-gray-700 mt-2 text-sm whitespace-pre-wrap">
            {comment.content}
          </p>

          <div className="mt-3 flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`text-xs flex items-center gap-1 px-2 py-1 rounded border ${
                comment.likedByMe
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{comment.likedByMe ? "Liked" : "Like"}</span>
              <span className="text-[10px] font-medium bg-gray-200 text-gray-700 px-1 rounded">
                {comment.likesCount || 0}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
