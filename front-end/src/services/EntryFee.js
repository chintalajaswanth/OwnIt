import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // replace with your backend base URL

export const payEntryFee = async (auctionId, paymentMethod) => {
  try {
    const res = await axios.post(`${BASE_URL}/api/v1/payments/pay-entry/${auctionId}`, { 
      paymentMethod 
    }, { withCredentials: true });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const checkEntryFeeStatus = async (auctionId) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/payments/pay-entry/status/${auctionId}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};

export const getEntryFees = async (auctionId) => {
  try {
    const res = await axios.get(`${BASE_URL}/api/v1/payments/entry-fees/${auctionId}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};
