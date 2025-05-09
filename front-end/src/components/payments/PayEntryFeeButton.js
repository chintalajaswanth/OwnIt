import React, { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';
import EntryFeeWalletPayment from './EntryFeeWalletPayment';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PayEntryFeeButton = ({ auctionId, entryFeeAmount, onSuccess }) => {
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(null); // 'stripe' or 'wallet'

  const handleSuccess = () => {
    setShowPaymentOptions(false);
    setPaymentMethod(null);
    if (onSuccess) onSuccess();
  };

  return (
    <div className="mt-4">
      {!showPaymentOptions ? (
        <button
          onClick={() => setShowPaymentOptions(true)}
          className="w-full px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
        >
          Pay Entry Fee (₹{entryFeeAmount})
        </button>
      ) : (
        <div className="p-4 border rounded">
          <h3 className="text-lg font-semibold mb-3">Choose Payment Method</h3>
          
          <div className="flex space-x-3 mb-4">
            <button
              onClick={() => setPaymentMethod('wallet')}
              className={`flex-1 px-3 py-2 border rounded ${
                paymentMethod === 'wallet' ? 'bg-blue-50 border-blue-500' : ''
              }`}
            >
              Wallet
            </button>
            <button
              onClick={() => setPaymentMethod('stripe')}
              className={`flex-1 px-3 py-2 border rounded ${
                paymentMethod === 'stripe' ? 'bg-blue-50 border-blue-500' : ''
              }`}
            >
              Credit Card
            </button>
          </div>
          
          {paymentMethod === 'wallet' && (
            <EntryFeeWalletPayment 
              auctionId={auctionId} 
              entryFeeAmount={entryFeeAmount} 
              onSuccess={handleSuccess} 
            />
          )}
          
          {paymentMethod === 'stripe' && (
            <Elements stripe={stripePromise}>
              <StripePaymentForm 
                auctionId={auctionId} 
                entryFeeAmount={entryFeeAmount} 
                onSuccess={handleSuccess} 
              />
            </Elements>
          )}
          
          <button
            onClick={() => {
              setShowPaymentOptions(false);
              setPaymentMethod(null);
            }}
            className="mt-4 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default PayEntryFeeButton;