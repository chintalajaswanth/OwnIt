import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchWallet = async () => {
      if (isAuthenticated && user) {
        try {
          setLoading(true);
          const res = await axios.get('http://localhost:5000/api/v1/wallet');
          setWallet(res.data.data);
          setError(null);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to fetch wallet');
        } finally {
          setLoading(false);
        }
      } else {
        setWallet(null);
        setLoading(false);
      }
    };

    fetchWallet();
  }, [isAuthenticated, user]);

  const addFunds = async (amount) => {
    try {
      const res = await axios.post('http://localhost:5000/api/v1/wallet/add-funds', { amount });
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add funds');
    }
  };

  const confirmDeposit = async (paymentIntentId, amount) => {
    try {
      const res = await axios.post('http://localhost:5000/api/v1/wallet/confirm-deposit', { paymentIntentId, amount });
      setWallet(res.data.data);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to confirm deposit');
    }
  };

  const withdrawFunds = async (amount) => {
    try {
      const res = await axios.post('http://localhost:5000/api/v1/wallet/withdraw', { amount });
      setWallet(res.data.data);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to withdraw funds');
    }
  };

  const refreshWallet = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/v1/wallet');
      setWallet(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refresh wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        loading,
        error,
        addFunds,
        confirmDeposit,
        withdrawFunds,
        refreshWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
