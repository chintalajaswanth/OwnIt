import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const BidControl = ({ auction, onBidPlaced }) => {
  const { user } = useAuth();
  const [bidAmount, setBidAmount] = useState('');
  const [maxAutoBid, setMaxAutoBid] = useState('');
  const [bidType, setBidType] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [minimumBid, setMinimumBid] = useState(0);

  useEffect(() => {
    if (user && auction) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/v1/users/${user._id}`);
          setWalletBalance(response.data.data.wallet);
        } catch (err) {
          console.error('Error fetching wallet balance:', err);
        }
      };

      fetchUserData();
      setMinimumBid(auction.currentPrice + 1);
      setBidAmount(auction.currentPrice + 1);
    }
  }, [user, auction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!user) {
      toast.error('Please log in to place a bid');
      return;
    }
  
    try {
      setLoading(true);
  
      if (bidType === 'manual') {
        if (Number(bidAmount) <= auction.currentPrice) {
          toast.error(`Bid must be higher than current price: $${auction.currentPrice}`);
          return;
        }
  
        // Wallet check removed here
  
        const response = await axios.post(
          `http://localhost:5000/api/v1/bids/auctions/${auction._id}/bids`,
          { amount: Number(bidAmount) }
        );
  
        toast.success('Bid placed successfully!');
        setBidAmount(auction.currentPrice + 1);
        onBidPlaced && onBidPlaced(response.data.data);
      } else {
        if (Number(maxAutoBid) <= auction.currentPrice) {
          toast.error(`Max auto bid must be higher than current price: $${auction.currentPrice}`);
          return;
        }
  
        // Wallet check removed here
  
        const response = await axios.post(
          `http://localhost:5000/api/v1/bids/auctions/${auction._id}/autobid`,
          { maxBid: Number(maxAutoBid) }
        );
  
        toast.success('Auto bid set successfully!');
        setMaxAutoBid('');
        onBidPlaced && onBidPlaced(response.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };
  

  const canBid = () => {
    if (!user || !auction) return false;
    if (auction.status !== 'active') return false;
    if (new Date(auction.endTime) < new Date()) return false;
    return auction.participants.includes(user._id);

  };

  const getTimeRemaining = () => {
    if (!auction) return '';
    const endTime = new Date(auction.endTime);
    const now = new Date();
    if (endTime <= now) return 'Auction ended';

    const diffTime = endTime - now;
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m remaining`;
  };

  if (!auction) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">Current Price:  ${Number(auction.currentPrice ?? 0).toFixed(2)}</h3>
          <p className="text-sm text-gray-600">{getTimeRemaining()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm">Your Balance</p>
        
        </div>
      </div>

      {!canBid() ? (
        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <p className="text-yellow-800">
            {!user ? (
              'Please log in to place a bid'
            ) : auction.status !== 'active' ? (
              'This auction is not currently active'
            ) : new Date(auction.endTime) < new Date() ? (
              'This auction has ended'
            ) : (
              'You need to join this auction before bidding'
            )}
          </p>
         
         {user && auction.status === 'active' && new Date(auction.endTime) >= new Date() && !canBid() && (
          <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={async () => {
              try {
                await axios.post(`http://localhost:5000/api/v1/auctions/${auction._id}/join`);
                toast.success('You have joined the auction!');
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to join auction');
              }
            }}
          >
            Join Auction
          </button>
        )}
        
        </div>
      ) : (
        <div>
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md ${
                bidType === 'manual' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}
              onClick={() => setBidType('manual')}
            >
              Manual Bid
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md ${
                bidType === 'auto' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
              }`}
              onClick={() => setBidType('auto')}
            >
              Auto Bid
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {bidType === 'manual' ? (
              <div className="mb-4">
                <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Bid Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="bidAmount"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    min={minimumBid}
                    step="0.01"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Minimum bid: ${minimumBid.toFixed(2)}</p>
              </div>
            ) : (
              <div className="mb-4">
                <label htmlFor="maxAutoBid" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Auto-Bid Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="maxAutoBid"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                    placeholder="0.00"
                    min={minimumBid}
                    step="0.01"
                    value={maxAutoBid}
                    onChange={(e) => setMaxAutoBid(e.target.value)}
                    required
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  The system will automatically bid up to this amount to keep you as the highest bidder
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Processing...' : bidType === 'manual' ? 'Place Bid' : 'Set Auto Bid'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BidControl;
