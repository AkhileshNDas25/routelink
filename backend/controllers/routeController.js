import Route from '../models/Route.js';

// @desc    Get all routes with optional filters
// @route   GET /api/routes
// @access  Public
export const getRoutes = async (req, res) => {
  try {
    const { source, destination, date } = req.query;
    const filter = { status: 'active' };

    if (source) filter.source = new RegExp(source, 'i');
    if (destination) filter.destination = new RegExp(destination, 'i');
    if (date) {
      const searchDate = new Date(date);
      filter.date = {
        $gte: searchDate,
        $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
      };
    }

    const routes = await Route.find(filter)
      .populate('userId', 'name email profilePic')
      .sort({ date: 1 });

    res.json(routes);
  } catch (error) {
    console.error('getRoutes error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new route
// @route   POST /api/routes
// @access  Private
export const createRoute = async (req, res) => {
  try {
    const { source, destination, date, mode, description } = req.body;

    const route = await Route.create({
      userId: req.user._id,
      source,
      destination,
      date,
      mode,
      description
    });

    const populatedRoute = await Route.findById(route._id)
      .populate('userId', 'name email profilePic');

    res.status(201).json(populatedRoute);
  } catch (error) {
    console.error('createRoute error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's own routes
// @route   GET /api/routes/my-routes
// @access  Private
export const getMyRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ userId: req.user._id })
      .populate('userId', 'name email profilePic')
      .sort({ date: -1 });

    res.json(routes);
  } catch (error) {
    console.error('getMyRoutes error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update route status
// @route   PUT /api/routes/:id
// @access  Private
export const updateRouteStatus = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({ message: 'Route not found' });
    }

    if (route.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    route.status = req.body.status || route.status;
    await route.save();

    res.json(route);
  } catch (error) {
    console.error('updateRouteStatus error:', error);
    res.status(500).json({ message: error.message });
  }
};