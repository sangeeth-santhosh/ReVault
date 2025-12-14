import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quantity: { type: Number },
    message: { type: String },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

const Request = mongoose.model('Request', requestSchema);

export default Request;
