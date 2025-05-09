const Community = require('../models/Community');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all communities
// @route   GET /api/v1/communities
// @access  Public
exports.getCommunities = asyncHandler(async (req, res, next) => {
  const { joined, created, search, page = 1, limit = 6 } = req.query;
  const queryObj = {};

  if (search) {
    queryObj.name = { $regex: search, $options: 'i' };
  }

  // Assuming req.user exists from auth middleware
  if (joined === 'true' && req.user) {
    queryObj.members = req.user.id;
  }

  if (created === 'true' && req.user) {
    queryObj.creator = req.user.id;
  }

  const total = await Community.countDocuments(queryObj);
  const communities = await Community.find(queryObj)
    .populate('creator', 'username profile.image')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const pagination = {};
  if ((page * limit) < total) {
    pagination.next = {
      page: Number(page) + 1,
      limit: Number(limit)
    };
  }

  res.status(200).json({
    success: true,
    count: communities.length,
    pagination,
    data: communities
  });
});
// @desc    Get single community
// @route   GET /api/v1/communities/:id
// @access  Public
exports.getCommunity = asyncHandler(async (req, res, next) => {
  const community = await Community.findById(req.params.id)
    .populate('creator', 'username profile.image')
    .populate('members', 'username profile.image');

  if (!community) {
    return next(
      new ErrorResponse(`Community not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: community
  });
});

// @desc    Create community
// @route   POST /api/v1/communities
// @access  Private
exports.createCommunity = asyncHandler(async (req, res, next) => {
  req.body.creator = req.user.id;

  const community = await Community.create(req.body);

  // Add creator as member
  community.members.push(req.user.id);
  await community.save();

  res.status(201).json({
    success: true,
    data: community
  });
});

// @desc    Update community
// @route   PUT /api/v1/communities/:id
// @access  Private (Creator/Admin)
exports.updateCommunity = asyncHandler(async (req, res, next) => {
  let community = await Community.findById(req.params.id);

  if (!community) {
    return next(
      new ErrorResponse(`Community not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is community creator or admin
  if (
    community.creator.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this community`,
        401
      )
    );
  }

  community = await Community.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: community
  });
});

// @desc    Delete community
// @route   DELETE /api/v1/communities/:id
// @access  Private (Creator/Admin)
exports.deleteCommunity = asyncHandler(async (req, res, next) => {
  const community = await Community.findById(req.params.id);

  if (!community) {
    return next(
      new ErrorResponse(`Community not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is community creator or admin
  if (
    community.creator.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete this community`,
        401
      )
    );
  }

  await community.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Join community
// @route   PUT /api/v1/communities/:id/join
// @access  Private
exports.joinCommunity = asyncHandler(async (req, res, next) => {
  const community = await Community.findById(req.params.id);

  if (!community) {
    return next(
      new ErrorResponse(`Community not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if community is private
  if (community.isPrivate) {
    return next(
      new ErrorResponse(
        `Community ${req.params.id} is private and requires an invitation`,
        400
      )
    );
  }

  // Check if user is already a member
  const isMember = community.members.some(
    member => member.toString() === req.user.id
  );

  if (isMember) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is already a member of this community`,
        400
      )
    );
  }

  // Add user to members
  community.members.push(req.user.id);
  await community.save();

  res.status(200).json({
    success: true,
    data: community
  });
});

// @desc    Leave community
// @route   PUT /api/v1/communities/:id/leave
// @access  Private
exports.leaveCommunity = asyncHandler(async (req, res, next) => {
  const community = await Community.findById(req.params.id);

  if (!community) {
    return next(
      new ErrorResponse(`Community not found with id of ${req.params.id}`, 404)
    );
  }

  // Check if user is a member
  const memberIndex = community.members.findIndex(
    member => member.toString() === req.user.id
  );

  if (memberIndex === -1) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not a member of this community`,
        400
      )
    );
  }

  // Remove user from members
  community.members.splice(memberIndex, 1);
  await community.save();

  res.status(200).json({
    success: true,
    data: community
  });
});

// @desc    Add community event
// @route   POST /api/v1/communities/:id/events
// @access  Private (Creator/Admin)
exports.addCommunityEvent = asyncHandler(async (req, res, next) => {
  const community = await Community.findById(req.params.id);

  if (!community) {
    return next(
      new ErrorResponse(`Community not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is community creator or admin
  if (
    community.creator.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add events to this community`,
        401
      )
    );
  }

  req.body.host = req.user.id;
  community.events.push(req.body);
  await community.save();

  res.status(200).json({
    success: true,
    data: community.events
  });
});