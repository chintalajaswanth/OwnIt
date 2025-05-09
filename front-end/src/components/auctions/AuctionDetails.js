import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import BidControl from '../bids/BidControl';
import PayEntryFeeButton from '../payments/PayEntryFeeButton';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { formatDistanceToNow, format } from 'date-fns';
import io from 'socket.io-client';
import { Clock, Gavel, Users, TrendingUp, AlertTriangle, Package } from 'lucide-react';

const AuctionDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entryFeePaid, setEntryFeePaid] = useState(false);
  const [bidCount, setBidCount] = useState(0);
  const [lastBidTime, setLastBidTime] = useState(null);
  const [socket, setSocket] = useState(null);

  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Set up socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      socket.emit('joinAuction', id);
    });

    socket.on('newBid', (bid) => {
      setAuction(prev => ({ ...prev, currentPrice: bid.amount }));
      setBidCount(prev => prev + 1);
      if (bid.createdAt) {
        try {
          const bidDate = new Date(bid.createdAt);
          if (!isNaN(bidDate.getTime())) {
            setLastBidTime(bidDate);
            localStorage.setItem(`lastBidTime_${id}`, bidDate.toISOString());
          }
        } catch (err) {
          console.error('Error parsing bid date:', err);
        }
      }
    });

    return () => {
      socket.off('connect');
      socket.off('newBid');
    };
  }, [socket, id]);

  const fetchAuction = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/v1/auctions/${id}`);
      setAuction(data.data);
      setBidCount(data.data.bids?.length || 0);
      
      // First try to get the last bid time from localStorage
      const storedLastBidTime = localStorage.getItem(`lastBidTime_${id}`);
      
      if (storedLastBidTime) {
        const parsedDate = new Date(storedLastBidTime);
        if (!isNaN(parsedDate.getTime())) {
          setLastBidTime(parsedDate);
        }
      } else if (data.data.bids && data.data.bids.length > 0) {
        // If no stored time, get it from the latest bid
        const sortedBids = [...data.data.bids].sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        
        const latestBidDate = new Date(sortedBids[0].createdAt);
        if (!isNaN(latestBidDate.getTime())) {
          setLastBidTime(latestBidDate);
          localStorage.setItem(`lastBidTime_${id}`, latestBidDate.toISOString());
        }
      }
    } catch (err) {
      console.error('Auction fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load auction details');
      toast.error(err.response?.data?.message || 'Failed to load auction details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuction();
  }, [id]);

  useEffect(() => {
    const checkEntryFeeStatus = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/v1/payment/pay-entry/status/${id}`);
        const hasPaid = data.data.some(payment => payment.user._id === user._id && payment.status === 'paid');
        setEntryFeePaid(hasPaid);
      } catch (err) {
        toast.error('Failed to check entry fee status');
      }
    };

    if (user) checkEntryFeeStatus();
  }, [user, id]);

  const handleBidPlaced = (newBid) => {
    setAuction(prev => ({ ...prev, currentPrice: newBid.amount }));
    setBidCount(prev => prev + 1);
    const now = new Date();
    setLastBidTime(now);
    localStorage.setItem(`lastBidTime_${id}`, now.toISOString());
  };

  const isBidder = user?.role === 'bidder';

  const formatLastBidTime = () => {
    if (!lastBidTime) return 'No bids yet';
    
    try {
      const bidDate = lastBidTime instanceof Date ? lastBidTime : new Date(lastBidTime);
      if (isNaN(bidDate.getTime())) return 'No bids yet';
      return format(bidDate, 'MMM d, yyyy h:mm a');
    } catch (err) {
      console.error('Error formatting last bid time:', err);
      return 'No bids yet';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );
  
  if (error || !auction) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-red-600 bg-red-100 px-6 py-4 rounded-lg shadow">
        <AlertTriangle className="h-6 w-6 inline mr-2" />
        Error loading auction details
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-white shadow-lg z-10 backdrop-blur-sm bg-white/90">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-bold text-indigo-900">{auction.product?.name}</h1>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${
            auction.status === 'active' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <Clock className="h-4 w-4 mr-2" />
            {auction.status?.charAt(0).toUpperCase() + auction.status?.slice(1) || 'Status Unknown'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Product Details */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Product Image */}
              {auction.product?.image ? (
                <div className="relative h-96">
                  <img
                    src={`http://localhost:5000/uploads/products/${auction.product.image}`}
                    alt={auction.product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <h2 className="text-2xl font-bold text-white">{auction.product?.name}</h2>
                  </div>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
                  <Package className="h-20 w-20 text-indigo-300" />
                </div>
              )}

              {/* Product Info */}
              <div className="p-6 space-y-6">
                <div className="prose max-w-none">
                  <p className="text-gray-600">{auction.product?.description}</p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="text-sm text-indigo-600 mb-1">Starting Bid</p>
                    <p className="text-2xl font-bold text-indigo-900">₹{auction.basePrice}</p>
                  </div>
                  <div className="bg-teal-50 rounded-xl p-4">
                    <p className="text-sm text-teal-600 mb-1">Current Bid</p>
                    <p className="text-2xl font-bold text-teal-900">₹{auction.currentPrice || auction.basePrice}</p>
                  </div>
                </div>

                {/* Entry Fee */}
                {auction.entryFees && isBidder && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-lg font-semibold text-indigo-900">
                        Entry Fee
                      </p>
                      <span className="text-xl font-bold text-purple-600">₹{auction.entryFees}</span>
                    </div>
                    {entryFeePaid ? (
                      <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Entry fee paid
                      </div>
                    ) : (
                      <Elements stripe={stripePromise}>
                        <PayEntryFeeButton
                          auctionId={auction._id}
                          entryFeeAmount={auction.entryFees}
                          onSuccess={() => setEntryFeePaid(true)}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-lg"
                        />
                      </Elements>
                    )}
                  </div>
                )}

                {/* Timing Info */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Start Time</p>
                      <p className="text-lg">{new Date(auction.startTime).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">End Time</p>
                      <p className="text-lg">{new Date(auction.endTime).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Bidding and Activity */}
          <div className="lg:col-span-7 space-y-8">
            {/* Bidding Control */}
            {auction.status === 'active' && entryFeePaid && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Gavel className="h-6 w-6 text-indigo-600" />
                  <h2 className="text-2xl font-bold text-indigo-900">Place Your Bid</h2>
                </div>
                <BidControl auction={auction} onBidPlaced={handleBidPlaced} socket={socket} />
              </div>
            )}

            {/* Auction Activity */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-indigo-900">Auction Activity</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <p className="text-lg font-medium text-indigo-900">Total Bids</p>
                  </div>
                  <p className="text-3xl font-bold text-indigo-600">{bidCount}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="h-5 w-5 text-purple-600" />
                    <p className="text-lg font-medium text-purple-900">Last Bid</p>
                  </div>
                  <p className="text-xl font-bold text-purple-600">
                    {lastBidTime && formatDistanceToNow(lastBidTime, { addSuffix: true })}
                  </p>
                  <p className="text-sm text-purple-500 mt-1">{formatLastBidTime()}</p>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800">Important Disclaimer</h3>
                  <p className="text-sm text-yellow-700 mt-2">
                    The auction platform acts only as a venue for transactions. We do not guarantee the quality, 
                    safety, or legality of items listed. Bidders must make their own determinations about the 
                    products before bidding. The auction host accepts no responsibility for product assurance 
                    or authenticity. Please bid at your own discretion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetails;