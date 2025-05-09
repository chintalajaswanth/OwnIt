// src/components/auctions/BidForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const BidForm = ({ auctionId, currentPrice, onBidPlaced }) => {
  const [amount, setAmount] = useState(currentPrice + 1);
  const [loading, setLoading] = useState(false);
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
      const response = await axios.post(`/api/v1/auctions/${auctionId}/bids`, {
        amount: parseFloat(amount)
      });
      
      toast.success('Bid placed successfully!');
      setAmount(parseFloat(amount) + 1);
      
      if (onBidPlaced) {
        onBidPlaced(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Place Your Bid</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Bid Amount ($)
          </label>
          <input
            type="number"
            id="amount"
            min={currentPrice + 1}
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Minimum bid: ${(currentPrice + 1).toFixed(2)}
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {loading ? 'Placing Bid...' : 'Place Bid'}
        </button>
      </form>
    </div>
  );
};

export default BidForm;