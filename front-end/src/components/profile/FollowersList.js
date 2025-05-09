import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import Spinner from "../layout/Spinner";
import { useAuth } from "../../contexts/AuthContext"; // Import AuthContext

const FollowersList = () => {
  const { id } = useParams();  // Get user ID from URL params
  const { user, followUser, unfollowUser } = useAuth(); // Get current user and follow functions
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/users/${id}/followers`);
        const followersData = res.data.data;

        // Attach a 'following' property to each follower to track follow status
        const updatedFollowers = followersData.map(follower => ({
          ...follower,
          following: user?.following?.includes(follower._id) || false
        }));

        setFollowers(updatedFollowers);
        setLoading(false);
      } catch (err) {
        toast.error("Error fetching followers");
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [id, user]);  // Remove userId from dependency array and use id from useParams

  const handleFollow = async (followerId) => {
    try {
      const follower = followers.find(f => f._id === followerId);
      if (!follower) return;

      // Toggle follow status
      if (follower.following) {
        await unfollowUser(followerId);
        setFollowers(prevFollowers =>
          prevFollowers.map(f =>
            f._id === followerId ? { ...f, following: false } : f
          )
        );
      } else {
        await followUser(followerId);
        setFollowers(prevFollowers =>
          prevFollowers.map(f =>
            f._id === followerId ? { ...f, following: true } : f
          )
        );
      }
    } catch (err) {
      toast.error("Action failed");
    }
  };

  if (loading) return <Spinner />;

  if (followers.length === 0) {
    return <p className="text-gray-600">No followers yet.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Followers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {followers.map((follower) => (
          <div
            key={follower._id}
            className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition duration-300"
          >
            <Link to={`/profile/${follower._id}`} className="flex items-center">
              <img
                src={
                  follower?.image
                    ? `http://localhost:5000/uploads/${follower.image}`
                    : "/img/default-avatar.png"
                }
                alt={follower.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="ml-3">
                <h3 className="font-medium">{follower.username}</h3>
                <p className="text-sm text-gray-500">
                  {follower.bio?.substring(0, 30) || "No bio"}
                  {follower.bio?.length > 30 ? "..." : ""}
                </p>
              </div>
            </Link>
            {user && user._id !== follower._id && (
              <button
                onClick={() => handleFollow(follower._id)}
                className={`ml-auto px-4 py-2 rounded-md font-semibold transition duration-200 ${
                  follower.following
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {follower.following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowersList;
