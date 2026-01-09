import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['business_request', 'inventory', 'transaction'],
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', NotificationSchema);
