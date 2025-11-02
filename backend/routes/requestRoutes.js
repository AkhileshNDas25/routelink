import express from 'express';
import { 
  sendRequest, 
  getIncomingRequests, 
  getOutgoingRequests, 
  updateRequestStatus,
  getConnections 
} from '../controllers/requestcontroller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, sendRequest);
router.get('/incoming', protect, getIncomingRequests);
router.get('/outgoing', protect, getOutgoingRequests);
router.get('/connections', protect, getConnections);
router.put('/:id', protect, updateRequestStatus);

export default router;
