const express = require('express');
const {
  getUser,
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,updateUser,getWonAuctions
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const upload=require("../middleware/fileUpload")
const router = express.Router();

router.route('/:id')
  .get(getUser);
  router.put('/:id/updatedetails', protect, upload.single('image'), updateUser);


router.route('/:id/followers')
  .get(getFollowers);

router.route('/:id/following')
  .get(getFollowing);

router.route('/:id/follow')
  .put(protect, followUser);

router.route('/:id/unfollow')
  .put(protect, unfollowUser);
router.route('/:id/auctions-won')
  .get(getWonAuctions);
module.exports = router;