import React, { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const EntryFeeWalletPayment = ({ auctionId, entryFeeAmount, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { wallet, refreshWallet } = useWallet();

  const handleWalletPayment = async () => {
    setLoading(true);
    try {
      // Call backend API to pay entry fee from wallet
      const { data } = await axios.post(`http://localhost:5000/api/v1/payment/pay-entry/wallet/${auctionId}`);
      
      // Refresh wallet to update balance
      await refreshWallet();
      
      // Notify success
      toast.success('Entry fee paid successfully from your wallet!');
      
      // Call the success callback
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sufficientBalance = wallet && wallet.balance >= entryFeeAmount;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-2">
        <span>Your wallet balance:</span>
        <span className="font-semibold">₹{wallet?.balance.toFixed(2) || 0}</span>
      </div>
      
      {!sufficientBalance && (
        <p className="text-red-500 text-sm mb-2">
          Insufficient balance. Please add funds to your wallet.
        </p>
      )}
      
      <button
        className="w-full px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-400"
        onClick={handleWalletPayment}
        disabled={loading || !sufficientBalance}
      >
        {loading ? 'Processing...' : `Pay ₹${entryFeeAmount} from Wallet`}
      </button>
    </div>
  );
};

export default EntryFeeWalletPayment;