import Inventory from '../models/Inventory.js';

export const addInventory = async (req, res) => {
  try {
    const item = await Inventory.create({ ...req.body, owner: req.user._id });
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error('addInventory error', err);
    return res.status(500).json({ success: false, message: 'Could not add inventory' });
  }
};

export const getAllInventory = async (_req, res) => {
  try {
    const items = await Inventory.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('getAllInventory error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch inventory' });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    console.error('getInventoryById error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch item' });
  }
};

export const getMyInventory = async (req, res) => {
  try {
    const items = await Inventory.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('getMyInventory error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch your inventory' });
  }
};

export const updateInventory = async (req, res) => {
  try {
    const item = await Inventory.findOne({ _id: req.params.id, owner: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    Object.assign(item, req.body);
    await item.save();
    return res.json({ success: true, data: item });
  } catch (err) {
    console.error('updateInventory error', err);
    return res.status(500).json({ success: false, message: 'Could not update item' });
  }
};

export const deleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findOne({ _id: req.params.id, owner: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    await item.deleteOne();
    return res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    console.error('deleteInventory error', err);
    return res.status(500).json({ success: false, message: 'Could not delete item' });
  }
};

export default {
  addInventory,
  getAllInventory,
  getInventoryById,
  getMyInventory,
  updateInventory,
  deleteInventory,
};
