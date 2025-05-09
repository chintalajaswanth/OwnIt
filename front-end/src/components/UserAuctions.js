import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';

const UserAuctions = () => {
  const [auctions, setAuctions] = useState({
    selling: [],
    participating: [],
    won: []
  });
  const [activeTab, setActiveTab] = useState('selling');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserAuctions = async () => {
      try {
        // Fetch auctions where user is seller
        const sellingResponse = await axios.get('/api/v1/auctions?seller=' + user._id);
        
        // Fetch auctions where user is participating
        const participatingResponse = await axios.get('/api/v1/auctions?participant=' + user._id);
        
        // Fetch auctions where user is winner
        const wonResponse = await axios.get('/api/v1/auctions?winner=' + user._id);
        
        setAuctions({
          selling: sellingResponse.data.data,
          participating: participatingResponse.data.data,
          won: wonResponse.data.data
        });
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load your auctions');
        setLoading(false);
      }
    };

    if (user) {
      fetchUserAuctions();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        Please log in to view your auctions
      </div>
    );
  }

  if (loading) return <div className="text-center py-8">Loading your auctions...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Auctions</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('selling')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'selling'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Selling ({auctions.selling.length})
            </button>
            <button
              onClick={() => setActiveTab('participating')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'participating'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Participating ({auctions.participating.length})
            </button>
            <button
              onClick={() => setActiveTab('won')}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === 'won'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Won ({auctions.won.length})
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {auctions[activeTab].length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              {activeTab === 'selling'
                ? "You haven't created any auctions yet"
                : activeTab === 'participating'
                ? "You're not participating in any auctions"
                : "You haven't won any auctions yet"}
            </div>
          ) : (
            <div className="space-y-4">
              {auctions[activeTab].map(auction => (
                <Link
                  key={auction._id}
                  to={`/auctions/${auction._id}`}
                  className="block border rounded p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{auction.product.name}</h3>
                      <p className="text-sm text-gray-500">
                        {activeTab === 'selling'
                          ? `${auction.bids.length} bids`
                          : `Current price: $${auction.currentPrice.toFixed(2)}`}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        auction.status === 'active' ? 'bg-green-100 text-green-800' :
                        auction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        auction.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="mt-2 flex justify-between text-sm">
                    <div>
                      <p className="text-gray-600">
                        {auction.status === 'completed'
                          ? `Ended ${moment(auction.endTime).fromNow()}`
                          : auction.status === 'active'
                          ? `Ends ${moment(auction.endTime).fromNow()}`
                          : `Starts ${moment(auction.startTime).fromNow()}`}
                      </p>
                    </div>
                    {activeTab === 'won' && (
                      <p className="font-semibold text-green-600">
                        You won at ${auction.currentPrice.toFixed(2)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAuctions;