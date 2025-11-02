import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  mode: {
    type: String,
    enum: ['Bus', 'Train', 'Car', 'Flight', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  }
}, { timestamps: true });

// Index for better search performance
routeSchema.index({ source: 1, destination: 1, date: 1 });

export default mongoose.model('Route', routeSchema);
