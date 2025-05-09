import React, { useState, useEffect } from 'react';

import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { payEntryFee } from '../../services/EntryFee';

// Initialize Stripe - replace with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const StripePaymentForm = ({ entryFeeAmount, auctionId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    try {
      setLoading(true);
      
      // Pay entry fee with Stripe
      const response = await payEntryFee(auctionId, 'stripe');
      
      // Confirm card payment
      const result = await stripe.confirmCardPayment(response.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

       console.log(result.data)
        toast.success('Entry fee payment successful!');
        onSuccess();
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 border rounded">
        <CardElement className="p-2" />
      </div>
      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : `Pay ₹${entryFeeAmount}`}
      </button>
    </form>
  );
};

export default stripePromise;