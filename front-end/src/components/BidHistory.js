// src/components/BidHistory.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const BidHistory = () => {
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState([]);
  const [auction, setAuction] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setLoading(true);
        
        // Get auction details
        const auctionRes = await axios.get(`/api/v1/auctions/${id}`);
        setAuction(auctionRes.data.data);
        
        // Get bids for this auction
        const bidsRes = await axios.get(`/api/v1/auctions/${id}/bids`);
        setBids(bidsRes.data.data);
      } catch (error) {
        toast.error(error.response?.data?.error || 'Failed to fetch bid history');
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-3">Loading bid history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {auction && (
          <div className="bg-indigo-600 text-white p-4">
            <h2 className="text-xl font-semibold">Bid History</h2>
            <p className="mt-1">
              Auction: {auction.product?.name || 'Unknown Product'}
            </p>
            <p className="text-sm">
              Current Price: ${auction.currentPrice.toFixed(2)}
            </p>
          </div>
        )}

        <div className="p-4">
          {bids.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No bids have been placed yet.</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bidder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bids.map((bid) => (
                  <tr key={bid._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {bid.bidder.avatar && (
                          <div className="flex-shrink-0 h-8 w-8 mr-3">
                            <img 
                              className="h-8 w-8 rounded-full" 
                              src={bid.bidder.avatar} 
                              alt={bid.bidder.name} 
                            />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {bid.bidder.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-semibold">
                        ${bid.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {bid.isAutoBid ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Auto Bid
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Manual Bid
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(bid.timestamp), 'MMM d, yyyy h:mm a')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default BidHistory;