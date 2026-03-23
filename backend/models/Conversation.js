import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null,
    },
    disappearingMessagesTime: {
      type: Number,
      default: 0, // 0 = disabled, otherwise seconds
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      trim: true,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    groupAvatar: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
