const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const fs = require('fs');
const path = require('path');
// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Public
  exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profile.image')
      .populate('following', 'username profile.image');

    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: user
    });
  });
  exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profile.image')
      .populate('following', 'username profile.image')
      .populate({
        path: 'auctionsWon',
        select: 'product currentPrice endTime status',
        populate: {
          path: 'product',
          select: 'name image'
        }
      });
  
    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }
  
    res.status(200).json({
      success: true,
      data: user
    });
  });

  exports.getWonAuctions = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id)
      .select('auctionsWon')
      .populate({
        path: 'auctionsWon',
        select: 'product currentPrice endTime status',
        populate: {
          path: 'product',
          select: 'name image description'
        }
      });
  
    if (!user) {
      return next(
        new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
      );
    }
  
    res.status(200).json({
      success: true,
      count: user.auctionsWon.length,
      data: user.auctionsWon
    });
  });
  
// @desc    Follow user
// @route   PUT /api/v1/users/:id/follow
// @access  Private
exports.followUser = asyncHandler(async (req, res, next) => {
  const userToFollow = await User.findById(req.params.id);

  if (!userToFollow) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is trying to follow themselves
  if (req.params.id === req.user.id) {
    return next(new ErrorResponse(`You cannot follow yourself`, 400));
  }

  // Check if already following
  const isFollowing = req.user.following.some(
    id => id.toString() === req.params.id
  );

  if (isFollowing) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is already following ${req.params.id}`,
        400
      )
    );
  }

  // Add to following list
  req.user.following.push(req.params.id);
  await req.user.save();

  // Add to followers list of the other user
  userToFollow.followers.push(req.user.id);
  await userToFollow.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Unfollow user
// @route   PUT /api/v1/users/:id/unfollow
// @access  Private
exports.unfollowUser = asyncHandler(async (req, res, next) => {
  const userToUnfollow = await User.findById(req.params.id);

  if (!userToUnfollow) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is trying to unfollow themselves
  if (req.params.id === req.user.id) {
    return next(new ErrorResponse(`You cannot unfollow yourself`, 400));
  }

  // Check if not following
  const followingIndex = req.user.following.findIndex(
    id => id.toString() === req.params.id
  );

  if (followingIndex === -1) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not following ${req.params.id}`,
        400
      )
    );
  }

  // Remove from following list
  req.user.following.splice(followingIndex, 1);
  await req.user.save();

  // Remove from followers list of the other user
  const followerIndex = userToUnfollow.followers.findIndex(
    id => id.toString() === req.user.id
  );
  userToUnfollow.followers.splice(followerIndex, 1);
  await userToUnfollow.save();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get user's followers
// @route   GET /api/v1/users/:id/followers
// @access  Public
exports.getFollowers = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate(
    'followers',
    'username image'
  );

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: user.followers.length,
    data: user.followers
  });
});

// @desc    Get users followed by user
// @route   GET /api/v1/users/:id/following
// @access  Public
exports.getFollowing = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .populate('following', 'username image'); // No need to populate profile if image is a direct field

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: user.following.length,
    data: user.following
  });
});

// @desc    Update user role
// @route   PUT /api/v1/users/:id/role
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
  }

  // Build update object
  const updateData = {
    username: req.body.username,
    email: req.body.email,
    bio: req.body.bio,
    profile: {
      about: req.body.about,
      location: req.body.location
    }
  };

  // Handle image upload
  if (req.file) {
    if (user.image) {
      const oldImagePath = path.join(__dirname, '../uploads/', user.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    updateData.image = req.file.filename;
  }

  user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`User not found with id of ${req.params.id}`, 404)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});