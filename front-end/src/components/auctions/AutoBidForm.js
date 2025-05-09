// src/components/auctions/AutoBidForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const AutoBidForm = ({ auctionId, currentPrice, entryFeePaid }) => {
  const [maxBid, setMaxBid] = useState(currentPrice + 10);
  const [loading, setLoading] = useState(false);
  const [autoBidSet, setAutoBidSet] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      await axios.post(`/api/v1/auctions/${auctionId}/autobid`, {
        maxBid: parseFloat(maxBid)
      });

      toast.success('Auto-bid set successfully!');
      setAutoBidSet(true);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to set auto-bid');
    } finally {
      setLoading(false);
    }
  };

  if (!entryFeePaid) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4 rounded">
        <p className="text-yellow-800 font-medium">
          Please pay the entry fee to enable auto-bidding.
        </p>
      </div>
    );
  }

  if (autoBidSet) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="bg-green-50 p-3 rounded-md">
          <p className="text-green-700 font-medium">
            Auto-bid active up to ₹{parseFloat(maxBid).toFixed(2)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mt-4">
      <h3 className="text-lg font-semibold mb-4">Set Auto Bidding</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="maxBid" className="block text-sm font-medium text-gray-700">
            Maximum Bid Amount (₹)
          </label>
          <input
            type="number"
            id="maxBid"
            min={currentPrice + 1}
            step="0.01"
            value={maxBid}
            onChange={(e) => setMaxBid(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            The system will automatically place bids for you up to this amount.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Setting Auto-Bid...' : 'Enable Auto-Bidding'}
        </button>
      </form>
    </div>
  );
};

export default AutoBidForm;
