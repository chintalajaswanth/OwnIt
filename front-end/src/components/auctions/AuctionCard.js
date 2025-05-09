import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const AuctionCard = ({ auction }) => {
  // Format the end time for display
  const formattedEndTime = format(new Date(auction.endTime), 'MMM dd, yyyy h:mm a');
  
  // Determine status badge color
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  return (
    <Link 
      to={`/auctions/${auction._id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {/* Auction Image */}
      <div className="h-48 bg-gray-200 relative">
        {auction.product?.image ? (
          <img
            src={`http://localhost:5000/uploads/products/${auction.product.image}`}
            alt={auction.product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No image available
          </div>
        )}
        {/* Status Badge */}
        <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${statusColors[auction.status] || 'bg-gray-100 text-gray-800'}`}>
          {auction.status?.charAt(0).toUpperCase() + auction.status?.slice(1)}
        </span>
      </div>

      {/* Auction Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
          {auction.product?.name || 'Untitled Auction'}
        </h3>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Current Bid:</span>
          <span className="font-medium text-teal-600">
            ₹{auction.currentPrice || auction.basePrice}
          </span>
        </div>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Ends:</span>
          <span className="text-sm font-medium text-gray-700">
            {formattedEndTime}
          </span>
        </div>

        {auction.entryFees && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Entry Fee:</span>
            <span className="text-sm font-medium text-indigo-600">
              ₹{auction.entryFees}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default AuctionCard;