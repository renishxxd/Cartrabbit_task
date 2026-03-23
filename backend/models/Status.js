import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String, // String can hold text or mediaUrl
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video'],
    default: 'text'
  },
  backgroundColor: {
    type: String,
    default: '#000000'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000), // 24 hours from now
    index: { expires: '1m' } // Mongoose TTL index
  }
}, { timestamps: true });

const Status = mongoose.model('Status', statusSchema);

export default Status;
