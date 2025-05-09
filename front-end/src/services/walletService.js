import axios from 'axios';

export const getWallet = async () => {
  try {
    const res = await axios.get('/api/v1/wallet');
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const addFunds = async (amount) => {
  try {
    const res = await axios.post('/api/v1/wallet/add-funds', { amount });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const confirmDeposit = async (paymentIntentId, amount) => {
  try {
    const res = await axios.post('/api/v1/wallet/confirm-deposit', {
      paymentIntentId,
      amount
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const withdrawFunds = async (amount) => {
  try {
    const res = await axios.post('/api/v1/wallet/withdraw', { amount });
    return res.data;
  } catch (err) {
    throw err;
  }
};
