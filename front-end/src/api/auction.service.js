// src/api/auction.service.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1';

// Auction CRUD Operations
export const getAuctions = async (filters = {}) => {
  let queryString = '';
  
  if (Object.keys(filters).length > 0) {
    queryString = '?' + new URLSearchParams(filters).toString();
  }
  
  return axios.get(`${API_URL}/auctions${queryString}`);
};

export const getAuctionById = async (id) => {
  return axios.get(`${API_URL}/auctions/${id}`);
};
export const createAuction = async (productId, auctionData) => {
  return axios.post(`${API_URL}/products/${productId}/auctions`, auctionData);
};

export const updateAuction = async (id, auctionData) => {
  return axios.put(`${API_URL}/auctions/${id}`, auctionData);
};

export const deleteAuction = async (id) => {
  return axios.delete(`${API_URL}/auctions/${id}`);
};

// Auction Actions
export const startAuction = async (id) => {
  return axios.put(`${API_URL}/auctions/${id}/start`);
};

export const endAuction = async (id) => {
  return axios.put(`${API_URL}/auctions/${id}/end`);
};

export const joinAuction = async (id) => {
  return axios.post(`${API_URL}/auctions/${id}/join`);
};

// Bid Operations
export const placeBid = async (auctionId, bidData) => {
  return axios.post(`${API_URL}/bids`, { auction: auctionId, ...bidData });
};

export const getAuctionBids = async (auctionId) => {
  return axios.get(`${API_URL}/auctions/${auctionId}/bids`);
};

// Constants (usually these would be in a separate config file)
export const AUCTION_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const NOTIFICATION_TYPES = {
  NEW_BID: 'new_bid',
  OUTBID: 'outbid',
  AUCTION_START: 'auction_start',
  AUCTION_END: 'auction_end',
  AUCTION_WON: 'auction_won',
  NEW_MESSAGE: 'new_message'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  SELLER: 'seller',
  BIDDER: 'bidder'
};

export const SOCKET_EVENTS = {
  NEW_BID: 'new_bid',
  AUCTION_START: 'auction_start',
  AUCTION_END: 'auction_end',
  NEW_MESSAGE: 'new_message',
  NEW_NOTIFICATION: 'new_notification'
};

// If you really need an initialization function
export const initializeAuctionService = (config = {}) => {
  // Apply any configurations here
  return {
    getAuctions,
    getAuctionById,
    createAuction,
    updateAuction,
    deleteAuction,
    startAuction,
    endAuction,
    joinAuction,
    placeBid,
    getAuctionBids,
    constants: {
      AUCTION_STATUS,
      NOTIFICATION_TYPES,
      USER_ROLES,
      SOCKET_EVENTS
    }
  };
};