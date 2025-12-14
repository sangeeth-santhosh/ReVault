import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    quantity: { type: Number, default: 0 },
    unit: { type: String },
    location: { type: String },
    price: { type: Number },
    expiry: { type: String },
    condition: { type: String },
    image: { type: String },
    status: { type: String, enum: ['active', 'draft', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
