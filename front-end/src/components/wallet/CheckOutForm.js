
import React, { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import {  CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe - replace with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { addFunds, confirmDeposit } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    try {
      setLoading(true);
      
      // Create payment intent
      const paymentData = await addFunds(amount);
      
      // Confirm card payment
      const result = await stripe.confirmCardPayment(paymentData.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Confirm the deposit on backend
        await confirmDeposit(result.paymentIntent.id, amount);
        toast.success('Payment successful!');
        onSuccess();
      }
    } catch (err) {
      toast.error(err.message || 'Payment failed');
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
        {loading ? 'Processing...' : `Pay ₹${amount}`}
      </button>
    </form>
  );
};
export default CheckoutForm;