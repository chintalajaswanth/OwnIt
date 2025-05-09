// src/components/comments/CommentSection.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
const CommentSection = ({ auctionId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
//const { user } = useAuth();
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/v1/auctions/${auctionId}/comments`);
        setComments(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setLoading(false);
      }
    };

    fetchComments();
  }, [auctionId]);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (newComment.trim() === '') return;

    try {
      const response = await axios.post(`http://localhost:5000/api/v1/auctions/${auctionId}/comments`, { content: newComment });
      setComments((prevComments) => [response.data.data, ...prevComments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Comments</h3>

      {loading ? (
        <div className="text-center">Loading comments...</div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="border-b pb-4">
              <p className="font-semibold">{comment.user.username}</p>
              <p>{comment.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4">
        <textarea
          value={newComment}
          onChange={handleCommentChange}
          className="w-full p-2 border border-gray-300 rounded-lg"
          placeholder="Add a comment"
        />
        <button
          onClick={handleCommentSubmit}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Post Comment
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
