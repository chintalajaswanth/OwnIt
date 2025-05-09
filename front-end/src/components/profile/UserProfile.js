import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import FollowersList from './FollowersList';
import FollowingList from './FollowingList';
import Spinner from '../layout/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import AuctionCard from '../auctions/AuctionCard';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isFollowing, setIsFollowing] = useState(false);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [auctionsLoading, setAuctionsLoading] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/v1/users/${id}`);
        setUser(res.data.data);
  
        if (isAuthenticated && currentUser) {
          const followingRes = await axios.get(`http://localhost:5000/api/v1/users/${currentUser._id}/following`);
          const followingList = followingRes.data.data || [];
          setIsFollowing(followingList.some((followedUser) => followedUser._id === id));
        }
  
        setLoading(false);
      } catch (err) {
        toast.error(err.response?.data?.error || 'Error fetching user profile');
        navigate('/');
      }
    };
  
    fetchUserProfile();
  }, [id, currentUser, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchWonAuctions = async () => {
      if (activeTab === 'auctions' && user?.role === 'bidder') {
        setAuctionsLoading(true);
        try {
          const res = await axios.get(`http://localhost:5000/api/v1/users/${id}/auctions-won`);
          setWonAuctions(res.data.data || []);
        } catch (err) {
          toast.error(err.response?.data?.error || 'Error fetching won auctions');
        } finally {
          setAuctionsLoading(false);
        }
      }
    };

    fetchWonAuctions();
  }, [activeTab, id, user?.role]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to follow users');
      return navigate('/login');
    }

    try {
      if (isFollowing) {
        await axios.put(`http://localhost:5000/api/v1/users/${id}/unfollow`);
        toast.success(`Unfollowed ${user.username}`);
        setIsFollowing(false);
      } else {
        await axios.put(`http://localhost:5000/api/v1/users/${id}/follow`);
        toast.success(`Following ${user.username}`);
        setIsFollowing(true);
      }

      const res = await axios.get(`http://localhost:5000/api/v1/users/${id}`);
      setUser(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed');
    }
  };

  const handleMessage = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to message users');
      return navigate('/login');
    }

    if (!isFollowing) {
      toast.info('You need to follow this user before starting a chat');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${currentUser.token}` };
      const existingRoomRes = await axios.get(`http://localhost:5000/api/v1/chat/private/${id}`, { headers });

      if (existingRoomRes.data.success && existingRoomRes.data.data?._id) {
        navigate(`/chat/${existingRoomRes.data.data._id}`);
      } else {
        const newRoomRes = await axios.post(`http://localhost:5000/api/v1/chat/private/${id}`);
        if (newRoomRes.data.success && newRoomRes.data.data?._id) {
          navigate(`/chat/${newRoomRes.data.data._id}`);
        } else {
          throw new Error('Failed to create chat room');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error starting chat');
      console.error('Chat room error:', err);
    }
  };

  if (loading) return <Spinner />;
  if (!user) return null;

  const isOwnProfile = isAuthenticated && currentUser && currentUser._id === id;
  const showAuctionsTab = user.role === 'bidder' && (isOwnProfile || wonAuctions.length > 0);

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-t from-indigo-900 to-gray-900 text-white">
      <div className="bg-gradient-to-t from-indigo-700 to-blue-900 rounded-lg shadow-lg overflow-hidden p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-indigo-500">
              {user.image ? (
                <img
                  src={`http://localhost:5000/uploads/${user.image}`}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>

            <div className="ml-6 text-gray-200">
              <h1 className="text-3xl font-bold">{user.username}</h1>
              <p className="text-sm">{user.email}</p>
              <div className="flex mt-2 space-x-4">
                <div className="cursor-pointer" onClick={() => setActiveTab('followers')}>
                  <span className="font-semibold">{user.followers?.length || 0}</span>
                  <span className="text-gray-400 ml-1">Followers</span>
                </div>
                <div className="cursor-pointer" onClick={() => setActiveTab('following')}>
                  <span className="font-semibold">{user.following?.length || 0}</span>
                  <span className="text-gray-400 ml-1">Following</span>
                </div>
              </div>
              {user.bio && <p className="mt-3 text-gray-100">{user.bio}</p>}
              {user.profile?.location && (
                <p className="text-sm text-gray-300 mt-2">📍 {user.profile.location}</p>
              )}
              <p className="text-sm text-gray-300 mt-2">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            {!isOwnProfile && (
              <>
                <button
                  onClick={handleFollow}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isFollowing ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button
                  onClick={handleMessage}
                  disabled={!isFollowing}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isFollowing ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Message
                </button>
              </>
            )}
            {isOwnProfile && (
              <Link
                to={`/profile/edit`}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Edit Profile
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-600 mt-6">
        <div className="flex">
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'profile' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          {showAuctionsTab && (
            <button
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'auctions' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'
              }`}
              onClick={() => setActiveTab('auctions')}
            >
              My Auctions
            </button>
          )}
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'followers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => setActiveTab('followers')}
            >
            Followers
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'following' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'
            }`}
            onClick={() => setActiveTab('following')}
          >
            Following
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6 text-gray-100">
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              {user.profile?.about ? (
                <p className="whitespace-pre-line">{user.profile.about}</p>
              ) : (
                <p className="text-gray-400">No about information available</p>
              )}
            </div>
          )}

          {activeTab === 'auctions' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-100">My Won Auctions</h2>
              {auctionsLoading ? (
                <Spinner />
              ) : wonAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wonAuctions.map((auction) => (
                    <AuctionCard 
                      key={auction._id} 
                      auction={auction} 
                      showSeller={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No auctions won yet</p>
                  {isOwnProfile && (
                    <Link 
                      to="/auctions" 
                      className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Browse Auctions
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'followers' && <FollowersList followers={user.followers} />}
          {activeTab === 'following' && <FollowingList following={user.following} />}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;