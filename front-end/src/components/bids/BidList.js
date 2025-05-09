import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import BidControl from '../bids/BidControl';
import PayEntryFeeButton from '../payments/PayEntryFeeButton';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { format } from 'date-fns'; // Import date-fns for date formatting

const AuctionDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entryFeePaid, setEntryFeePaid] = useState(false);
  const [bidCount, setBidCount] = useState(0);
  const [lastBidTime, setLastBidTime] = useState(null);

  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/v1/auctions/${id}`);
        setAuction(data.data);

        // Initialize bid info if present
        setBidCount(data.data.bids?.length || 0);
        if (data.data.bids && data.data.bids.length > 0) {
          const lastBid = data.data.bids[data.data.bids.length - 1];
          setLastBidTime(new Date(lastBid.createdAt));
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load auction details');
        toast.error(err.response?.data?.message || 'Failed to load auction details');
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]);

  useEffect(() => {
    const checkEntryFeeStatus = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/v1/payment/pay-entry/status/${id}`);
  
        // Find if any payment is 'paid' by the current user
        const hasPaid = data.data.some(payment => payment.user._id === user._id && payment.status === 'paid');
  
        setEntryFeePaid(hasPaid);
      } catch (err) {
        toast.error('Failed to check entry fee status');
      }
    };
  
    if (user) checkEntryFeeStatus();
  }, [user, id]);
  
  if (loading) return <div>Loading...</div>;
  if (error || !auction) return <div>Error loading auction details</div>;

  const handleBidPlaced = (newBid) => {
    // Update auction price
    setAuction(prev => ({
      ...prev,
      currentPrice: newBid.amount
    }));

    // Update bid info
    setBidCount(prev => prev + 1);
    setLastBidTime(new Date());
  };

  const isBidder = user?.role === 'bidder';

  // Format last bid time, ensuring proper display
  const formattedLastBidTime = lastBidTime ? format(new Date(lastBidTime), 'MMM d, yyyy h:mm a') : 'No bids yet';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            {auction.product?.image ? (
              <img
                src={`http://localhost:5000/uploads/products/${auction.product.image}`}
                alt={auction.product.name}
                className="w-full h-80 object-cover rounded"
              />
            ) : (
              <div className="h-80 flex items-center justify-center bg-gray-100 text-gray-500">
                No image available
              </div>
            )}

            <h1 className="text-2xl font-bold mt-4">{auction.product?.name}</h1>
            <p className="text-gray-700 mt-2">{auction.product?.description}</p>

            <div className="mt-4 flex items-center space-x-4">
              <span className={`text-lg font-semibold ${auction.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                {auction.status?.charAt(0).toUpperCase() + auction.status?.slice(1) || 'Status Unknown'}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xl font-semibold">Starting Bid: ₹{auction.basePrice}</p>
              <p className="text-xl font-semibold">Current Bid: ₹{auction.currentPrice || auction.basePrice}</p>
            </div>

            {auction.entryFees && isBidder && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-lg font-semibold">Entry Fee: ₹{auction.entryFees}</p>
                {entryFeePaid ? (
                  <p className="mt-2 text-green-600 font-medium">Entry fee paid</p>
                ) : (
                  <Elements stripe={stripePromise}>
                    <PayEntryFeeButton 
                      auctionId={auction._id} 
                      entryFeeAmount={auction.entryFees}
                      onSuccess={() => setEntryFeePaid(true)} 
                    />
                  </Elements>
                )}
              </div>
            )}

            {/* Auction Timing Info */}
            <div className="mt-6 text-sm text-gray-600">
              <p><strong>Start Time:</strong> {new Date(auction.startTime).toLocaleString()}</p>
              <p><strong>End Time:</strong> {new Date(auction.endTime).toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          {auction.status === 'active' && entryFeePaid && (
            <BidControl auction={auction} onBidPlaced={handleBidPlaced} />
          )}

          {/* Bid Summary Block */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Auction Activity</h2>
            <div className="space-y-4">
              <p className="text-lg">
                <strong>Total Bids:</strong> {bidCount}
              </p>
              <p className="text-lg">
                <strong>Last Bid Time:</strong> {formattedLastBidTime}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;
