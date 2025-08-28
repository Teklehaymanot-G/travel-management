import React from "react";
import { format } from "date-fns";

const CommentCard = ({ comment }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
        <div className="ml-3 flex-1">
          <div className="flex justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              {comment.userName}
            </h4>
            <span className="text-xs text-gray-500">
              {format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}
            </span>
          </div>
          <p className="text-gray-600 mt-2">{comment.content}</p>

          {comment.type === "POST_TRAVEL" && (
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2">
              Post-Travel Feedback
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex space-x-3">
        <button className="text-sm text-blue-600 hover:text-blue-800">
          Reply
        </button>
        <button className="text-sm text-gray-500 hover:text-gray-700">
          Mark as Resolved
        </button>
      </div>
    </div>
  );
};

export default CommentCard;
