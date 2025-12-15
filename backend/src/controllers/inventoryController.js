import Inventory from '../models/Inventory.js';
import { cloudinary, cloudinaryUploadOptions } from '../config/cloudinary.js';

const uploadBufferToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(cloudinaryUploadOptions, (error, result) => {
      if (error) return reject(error);
      return resolve(result.secure_url);
    });
    stream.end(file.buffer);
  });

const normalizeImages = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input.filter(Boolean);
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch (_err) {
    /* ignore */
  }
  return [input].filter(Boolean);
};

export const addInventory = async (req, res) => {
  try {
    const files = req.files || [];
    const uploadedUrls = await Promise.all(files.map(uploadBufferToCloudinary));

    const item = await Inventory.create({
      ...req.body,
      title: req.body.title || req.body.name,
      owner: req.user._id,
      images: uploadedUrls,
    });
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error('addInventory error', err);
    return res.status(500).json({ success: false, message: err?.message || 'Could not add inventory' });
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
    const files = req.files || [];
    const keepImages = normalizeImages(req.body.images);
    const uploadedUrls = await Promise.all(files.map(uploadBufferToCloudinary));

    const { images, ...rest } = req.body;
    if (!rest.title && rest.name) {
      rest.title = rest.name;
    }
    Object.assign(item, rest);
    item.images = [...keepImages, ...uploadedUrls];
    await item.save();
    return res.json({ success: true, data: item });
  } catch (err) {
    console.error('updateInventory error', err);
    return res.status(500).json({ success: false, message: err?.message || 'Could not update item' });
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
