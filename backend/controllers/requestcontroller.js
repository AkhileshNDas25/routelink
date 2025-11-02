import Request from '../models/Request.js';

// @desc    Send help request
// @route   POST /api/requests
// @access  Private
export const sendRequest = async (req, res) => {
  try {
    const { receiverId, routeId, message } = req.body;

    // Check if request already exists
    const existingRequest = await Request.findOne({
      senderId: req.user._id,
      routeId,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const request = await Request.create({
      senderId: req.user._id,
      receiverId,
      routeId,
      message
    });

    const populatedRequest = await Request.findById(request._id)
      .populate('senderId', 'name email profilePic')
      .populate('receiverId', 'name email profilePic')
      .populate('routeId');

    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get incoming requests
// @route   GET /api/requests/incoming
// @access  Private
export const getIncomingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ receiverId: req.user._id })
      .populate('senderId', 'name email profilePic')
      .populate('routeId')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get outgoing requests
// @route   GET /api/requests/outgoing
// @access  Private
export const getOutgoingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ senderId: req.user._id })
      .populate('receiverId', 'name email profilePic')
      .populate('routeId')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status
// @route   PUT /api/requests/:id
// @access  Private
export const updateRequestStatus = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.receiverId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = req.body.status;
    await request.save();

    const populatedRequest = await Request.findById(request._id)
      .populate('senderId', 'name email profilePic')
      .populate('receiverId', 'name email profilePic')
      .populate('routeId');

    res.json(populatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get accepted connections
// @route   GET /api/requests/connections
// @access  Private
export const getConnections = async (req, res) => {
  try {
    const requests = await Request.find({
      $or: [
        { senderId: req.user._id, status: 'accepted' },
        { receiverId: req.user._id, status: 'accepted' }
      ]
    })
      .populate('senderId', 'name email profilePic')
      .populate('receiverId', 'name email profilePic')
      .populate('routeId')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
