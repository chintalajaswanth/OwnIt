

import React, { useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { toast } from 'react-toastify';
import CheckoutForm from './CheckOutForm';
import { Elements } from '@stripe/react-stripe-js';

import stripePromise from '../payments/StripePaymentForm';
const WalletDetails = () => {
    const { wallet, loading, error, refreshWallet, withdrawFunds } = useWallet();
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [amount, setAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [showWithdraw, setShowWithdraw] = useState(false);
  
    const handleAddFunds = () => {
      setShowAddFunds(true);
    };
  
    const handleWithdraw = async (e) => {
      e.preventDefault();
      
      try {
        await withdrawFunds(Number(withdrawAmount));
        toast.success('Withdrawal successful');
        setWithdrawAmount('');
        setShowWithdraw(false);
      } catch (err) {
        toast.error(err.message);
      }
    };
  
    const handleSuccess = () => {
      setShowAddFunds(false);
      setAmount('');
      refreshWallet();
    };
  
    if (loading) return <p>Loading wallet...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!wallet) return <p>No wallet found</p>;
  
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Your Wallet</h2>
        
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-lg">Current Balance</p>
          <p className="text-3xl font-bold text-green-600">₹{wallet.balance.toFixed(2)}</p>
        </div>
        
        <div className="flex space-x-3 mb-6">
          <button
            onClick={handleAddFunds}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Funds
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Withdraw
          </button>
        </div>
  
        {showAddFunds && (
          <div className="mt-4 p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Add Funds</h3>
            <div className="mb-4">
              <label className="block mb-2">Amount (₹)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 border rounded"
                min="1"
                step="1"
              />
            </div>
            
            {amount && Number(amount) > 0 && (
              <Elements stripe={stripePromise}>
                <CheckoutForm amount={Number(amount)} onSuccess={handleSuccess} />
              </Elements>
            )}
            
            <button
              onClick={() => setShowAddFunds(false)}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        )}
  
        {showWithdraw && (
          <div className="mt-4 p-4 border rounded-lg">
            <h3 className="text-xl font-semibold mb-3">Withdraw Funds</h3>
            <form onSubmit={handleWithdraw}>
              <div className="mb-4">
                <label className="block mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full p-2 border rounded"
                  min="1"
                  max={wallet.balance}
                  step="1"
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Confirm Withdrawal
                </button>
                <button
                  type="button"
                  onClick={() => setShowWithdraw(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
  
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Transaction History</h3>
          {wallet.transactions.length === 0 ? (
            <p className="text-gray-500">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wallet.transactions.map((transaction, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                        {transaction.type.replace('_', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}>
                          {transaction.type === 'withdrawal' ? '-' : '+'} ₹{transaction.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : transaction.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  export default WalletDetails;