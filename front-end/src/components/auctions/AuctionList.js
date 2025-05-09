import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, Users, TrendingUp, Package, Plus, Loader2 } from 'lucide-react';

const AuctionList = ({ productId }) => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const url = productId 
          ? `/api/v1/auctions/products/${productId}/auctions` 
          : 'http://localhost:5000/api/v1/auctions';
        
        const response = await axios.get(url);
        setAuctions(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load auctions');
        setLoading(false);
      }
    };

    fetchAuctions();
  }, [productId]);

  const formatTimeLeft = (endTime) => {
    const end = moment(endTime);
    const now = moment();
    
    if (now > end) return 'Ended';
    
    const duration = moment.duration(end.diff(now));
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    
    if (days > 0) {
      return `${days}d ${hours}h left`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-[400px] text-red-600 bg-red-50 rounded-lg">
      <p className="text-lg">{error}</p>
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-indigo-50 to-white min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-indigo-900">Active Auctions</h2>
          </div>
          {user && user.role === 'seller' && (
            <Link 
              to={productId ? `/products/${productId}/create-auction` : '/create-auction'} 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Auction
            </Link>
          )}
        </div>
        
        {auctions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center shadow-md">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No auctions found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {auctions.map(auction => (
              <Link 
                to={`/auctions/${auction._id}`} 
                key={auction._id}
                className="transform hover:scale-[1.02] transition-all duration-300"
              >
                <div className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden">
                  <div className="relative">
                    {auction.product.image ? (
                      <img 
                        src={`http://localhost:5000/uploads/products/${auction.product.image}`}
                        alt={auction.product.name}
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">
                        <Package className="h-16 w-16 text-indigo-300" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        auction.status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' :
                        auction.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                        auction.status === 'completed' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                        'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate">
                      {auction.product.name}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-indigo-50 rounded-lg p-3">
                        <p className="text-sm text-indigo-600 mb-1">Current Bid</p>
                        <p className="text-lg font-bold text-indigo-900">
                          ₹{auction.currentPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <p className="text-sm text-purple-600 mb-1">Total Bids</p>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-purple-500 mr-1" />
                          <p className="text-lg font-bold text-purple-900">{auction.bids.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-indigo-600">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{formatTimeLeft(auction.endTime)}</span>
                      </div>
                      <span className="text-gray-500">
                        {auction.participants.length} participants
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuctionList;