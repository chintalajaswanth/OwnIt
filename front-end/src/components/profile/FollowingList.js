import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import Spinner from "../layout/Spinner";

const FollowingList = ({ userId }) => {
  const { user, unfollowUser } = useAuth();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/users/${userId || user._id}/following`);
        const followingData = res.data.data;
        
        // Attach a 'following' property to each user to track follow status
        const updatedFollowing = followingData.map(followingUser => ({
          ...followingUser,
          following: user?.following?.includes(followingUser._id) || false
        }));

        setFollowing(updatedFollowing);
        setLoading(false);
      } catch (err) {
        toast.error("Error fetching following");
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [userId, user]);

  const handleUnfollow = async (followingId) => {
    try {
      await unfollowUser(followingId);
      setFollowing(prevFollowing => prevFollowing.map(f => 
        f._id === followingId ? { ...f, following: false } : f
      ));
    } catch (err) {
      toast.error("Failed to unfollow user");
    }
  };

  if (loading) return <Spinner />;

  if (following.length === 0) {
    return <p className="text-gray-600">You are not following anyone yet.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Following</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {following.map((followedUser) => {
  console.log("Image path:", followedUser.image); // ✅ Add this line

  return (
    <div
      key={followedUser._id}
      className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition duration-300"
    >
      <Link to={`/profile/${followedUser._id}`} className="flex items-center">
        <img
          src={
            followedUser.image
              ? `http://localhost:5000/uploads/${followedUser.image}`
              : "/img/default-avatar.png"
          }
          alt={followedUser.username}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="ml-3">
          <h3 className="font-medium">{followedUser.username}</h3>
          <p className="text-sm text-gray-500">
            {followedUser.profile?.bio?.substring(0, 30) || "No bio"}
            {followedUser.profile?.bio?.length > 30 ? "..." : ""}
          </p>
        </div>
      </Link>
      {user && user._id !== followedUser._id && (
        <button
          onClick={() => handleUnfollow(followedUser._id)}
          className="ml-auto px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Unfollow
        </button>
      )}
    </div>
  );
})}
      
      </div>
    </div>
  );
};

export default FollowingList;
