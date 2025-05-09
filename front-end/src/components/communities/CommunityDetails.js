import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../layout/Spinner';
import EventCard from './EventCard';

const CommunityDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  
  useEffect(() => {
    loadCommunity();
  }, [id]);

  const loadCommunity = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/v1/communities/${id}`);
      setCommunity(res.data.data);
      setLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error loading community');
      setLoading(false);
      navigate('/communities');
    }
  };

  const joinCommunity = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/v1/communities/${id}/join`);
      setCommunity(res.data.data);
      toast.success('Successfully joined community');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error joining community');
    }
  };

  const leaveCommunity = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/v1/communities/${id}/leave`);
      setCommunity(res.data.data);
      toast.success('Successfully left community');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error leaving community');
    }
  };

  if (loading) return <Spinner />;
  
  if (!community) return (
    <div className="container mx-auto px-4 py-8 text-center bg-[#FFFDD0]">
      <p className="text-xl text-indigo-600">Community not found.</p>
    </div>
  );

  const isMember = community.members.some(member => 
    member._id === user?._id || member === user?._id
  );
  const isCreator = community.creator._id === user?._id || community.creator === user?._id;
  const hasEvents = community.events && community.events.length > 0;

  return (
    <div className="container mx-auto px-4 py-8 bg-[#FFFDD0]">
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-indigo-100">
        {/* Community Header */}
        <div className="bg-indigo-900 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-yellow-300">{community.name}</h1>
              <div className="flex items-center text-indigo-200 text-sm">
                <span>{community.members.length} members</span>
                {community.isPrivate && (
                  <span className="ml-3 bg-indigo-100 text-indigo-900 px-2 py-1 rounded text-xs">
                    Private
                  </span>
                )}
              </div>
            </div>

            <div>
              {user ? (
                isCreator ? (
                  <Link 
                    to={`/communities/${community._id}/edit`}
                    className="bg-white text-teal-600 px-4 py-2 rounded font-medium"
                  >
                    Manage Community
                  </Link>
                ) : isMember ? (
                  <button 
                    onClick={leaveCommunity}
                    className="bg-white text-red-600 px-4 py-2 rounded font-medium"
                  >
                    Leave Community
                  </button>
                ) : (
                  <button 
                    onClick={joinCommunity}
                    className="bg-white text-teal-600 px-4 py-2 rounded font-medium"
                    disabled={community.isPrivate}
                  >
                    {community.isPrivate ? 'Private Community' : 'Join Community'}
                  </button>
                )
              ) : (
                <Link 
                  to="/login" 
                  className="bg-white text-teal-600 px-4 py-2 rounded font-medium"
                >
                  Login to Join
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-indigo-100">
          <nav className="flex">
            <button 
              onClick={() => setActiveTab('about')}
              className={`px-4 py-3 font-medium text-sm ${
                activeTab === 'about' 
                  ? 'border-b-2 border-teal-600 text-teal-600' 
                  : 'text-indigo-600 hover:text-indigo-900'
              }`}
            >
              About
            </button>
            <button 
              onClick={() => setActiveTab('members')}
              className={`px-4 py-3 font-medium text-sm ${
                activeTab === 'members' 
                  ? 'border-b-2 border-teal-600 text-teal-600' 
                  : 'text-indigo-600 hover:text-indigo-900'
              }`}
            >
              Members
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`px-4 py-3 font-medium text-sm ${
                activeTab === 'events' 
                  ? 'border-b-2 border-teal-600 text-teal-600' 
                  : 'text-indigo-600 hover:text-indigo-900'
              }`}
            >
              Events {hasEvents && `(${community.events.length})`}
            </button>
            {isMember && community.chatRoom && (
              <button 
                onClick={() => navigate(`/chat/${community.chatRoom}`)}
                className="px-4 py-3 font-medium text-sm text-indigo-600 hover:text-indigo-900 ml-auto"
              >
                Open Chat
              </button>
            )}
          </nav>
        </div>

        {/* Content Based on Active Tab */}
        <div className="p-6">
          {activeTab === 'about' && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-indigo-900">About</h2>
              <p className="text-indigo-600 whitespace-pre-line">
                {community.description}
              </p>

              {community.tags && community.tags.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2 text-indigo-900">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {community.tags.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-indigo-100 text-indigo-900 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-indigo-900">Members</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {community.members.map(member => (
                  <div 
                    key={member._id || member} 
                    className="flex items-center p-3 border rounded border-indigo-100"
                  >
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-teal-600">
                      {member.username ? member.username.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-indigo-900">
                        {member.username || 'Unknown User'}
                      </p>
                      {member._id === community.creator._id || member === community.creator._id ? (
                        <span className="text-xs text-teal-600">Creator</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-indigo-900">Events</h2>
                {isCreator && (
                  <Link 
                    to={`/communities/${community._id}/events/new`}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded text-sm"
                  >
                    Add Event
                  </Link>
                )}
              </div>

              {hasEvents ? (
                <div className="space-y-4">
                  {community.events.map((event, index) => (
                    <EventCard 
                      key={index} 
                      event={event} 
                      communityId={community._id} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-indigo-600 py-8 text-center">
                  No events scheduled for this community.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityDetails;