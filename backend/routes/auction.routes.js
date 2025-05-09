const express = require('express');
const {
  getAuctions,
  getAuction,
  createAuction,
  updateAuction,
  deleteAuction,
  startAuction,
  endAuction,
  joinAuction,
  endExpiredAuctions
} = require('../controllers/auction.controller');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(getAuctions);

router.route('/:id')
  .get(getAuction)
  .put(protect, updateAuction)
  .delete(protect, deleteAuction);

router.route('/:id/start')
  .put(protect, authorize('admin'), startAuction);

router.route('/:id/end')
  .put(protect, authorize('admin', 'seller'), endAuction);
  router.put('/end-expired', protect, authorize('admin'), endExpiredAuctions);

router.route('/:id/join')
  .post(protect, authorize('bidder'), joinAuction);

router.route('/products/:productId/auctions')
  .get(getAuctions)
  .post(protect, authorize('seller'), createAuction);
  
module.exports = router;