import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Canonical B2B name field (kept alongside legacy title for compatibility)
    name: { type: String },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    quantity: { type: Number, default: 0 },
    unit: { type: String },
    location: { type: String },
    price: { type: Number },
    // Legacy field retained to avoid breaking older reads
    expiry: { type: String },
    expiryDate: { type: Date },
    condition: { type: String },
    images: {
      type: [{ type: String }],
      default: [],
      validate: {
        validator: (arr) => !arr || arr.length <= 4,
        message: 'A maximum of 4 images is allowed',
      },
    },
    status: {
      type: String,
      enum: ['available', 'active', 'draft', 'archived'],
      default: 'available',
    },
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
