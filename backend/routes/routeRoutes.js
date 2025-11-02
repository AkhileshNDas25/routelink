import express from 'express';
import { getRoutes, createRoute, getMyRoutes, updateRouteStatus } from '../controllers/routeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getRoutes);
router.post('/', protect, createRoute);
router.get('/my-routes', protect, getMyRoutes);
router.put('/:id', protect, updateRouteStatus);

export default router;