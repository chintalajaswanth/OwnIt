const express = require('express');
const {
  getCommunities,
  getCommunity,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  addCommunityEvent
} = require('../controllers/community.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getCommunities)
  .post(protect, createCommunity);

router.route('/:id')
  .get(getCommunity)
  .put(protect, updateCommunity)
  .delete(protect, deleteCommunity);

router.route('/:id/join')
  .put(protect, joinCommunity);

router.route('/:id/leave')
  .put(protect, leaveCommunity);

router.route('/:id/events')
  .post(protect, addCommunityEvent);

module.exports = router;