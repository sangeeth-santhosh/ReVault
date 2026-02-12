import Inventory from '../models/Inventory.js';
import { cloudinary, cloudinaryUploadOptions } from '../config/cloudinary.js';
import Notification from '../models/Notification.js';

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

const parseDateOnly = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

const isPastDate = (d) => {
  if (!d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

const toPositiveNumber = (value) => {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
};

export const addInventory = async (req, res) => {
  try {
    const files = req.files || [];
    if (files.length > 4) {
      return res.status(400).json({ success: false, message: 'A maximum of 4 images is allowed' });
    }
    const uploadedUrls = await Promise.all(files.map(uploadBufferToCloudinary));

    const name = (req.body.name || req.body.title || '').toString().trim();
    const title = (req.body.title || req.body.name || '').toString().trim();
    const category = (req.body.category || '').toString().trim();
    const unit = (req.body.unit || '').toString().trim();
    const condition = (req.body.condition || '').toString().trim();
    const description = (req.body.description || '').toString().trim();
    const location = (req.body.location || '').toString().trim();

    const quantity = toPositiveNumber(req.body.quantity);
    const expiryDate = parseDateOnly(req.body.expiryDate || req.body.expiry);

    if (!name) return res.status(400).json({ success: false, message: 'name is required' });
    if (!category) return res.status(400).json({ success: false, message: 'category is required' });
    if (!unit) return res.status(400).json({ success: false, message: 'unit is required' });
    if (!condition) return res.status(400).json({ success: false, message: 'condition is required' });
    if (!description) return res.status(400).json({ success: false, message: 'description is required' });
    if (quantity === null || quantity <= 0) {
      return res.status(400).json({ success: false, message: 'quantity must be greater than 0' });
    }
    if (!expiryDate) {
      return res.status(400).json({ success: false, message: 'expiryDate is required' });
    }
    if (isPastDate(expiryDate)) {
      return res.status(400).json({ success: false, message: 'expiryDate cannot be in the past' });
    }

    const expiryIso = expiryDate.toISOString().slice(0, 10);

    const item = await Inventory.create({
      owner: req.user._id,
      name,
      title: title || name,
      description,
      category,
      quantity,
      unit,
      condition,
      location: location || undefined,
      expiryDate,
      expiry: expiryIso,
      images: uploadedUrls,
      status: 'available',
    });

    try {
      const businessLabel = req.user?.businessName || req.user?.name || 'a business';
      await Notification.create({
        type: 'inventory',
        message: `New inventory added by ${businessLabel}`,
        isRead: false,
      });
    } catch (notifyErr) {
      console.error('addInventory notification error', notifyErr);
    }
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error('addInventory error', err);
    return res.status(500).json({ success: false, message: err?.message || 'Could not add inventory' });
  }
};

export const getAllInventory = async (_req, res) => {
  try {
    const items = await Inventory.find()
      .populate('owner', 'businessName name company')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('getAllInventory error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch inventory' });
  }
};

export const getInventoryById = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id).populate('owner', 'businessName name company address');
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
    if (files.length > 4) {
      return res.status(400).json({ success: false, message: 'A maximum of 4 images is allowed' });
    }
    const keepImages = normalizeImages(req.body.images);
    const uploadedUrls = await Promise.all(files.map(uploadBufferToCloudinary));

    const nextImages = [...keepImages, ...uploadedUrls];
    if (nextImages.length > 4) {
      return res.status(400).json({ success: false, message: 'A maximum of 4 images is allowed' });
    }

    const { images, ...rest } = req.body;

    if (rest.name || rest.title) {
      const nextName = (rest.name || rest.title || '').toString().trim();
      if (nextName) {
        item.name = nextName;
        item.title = (rest.title || nextName).toString().trim() || nextName;
      }
    }
    if (rest.category !== undefined) item.category = (rest.category || '').toString().trim();
    if (rest.unit !== undefined) item.unit = (rest.unit || '').toString().trim();
    if (rest.condition !== undefined) item.condition = (rest.condition || '').toString().trim();
    if (rest.description !== undefined) item.description = (rest.description || '').toString().trim();
    if (rest.location !== undefined) item.location = (rest.location || '').toString().trim() || undefined;

    if (rest.quantity !== undefined) {
      const qty = toPositiveNumber(rest.quantity);
      if (qty === null || qty <= 0) {
        return res.status(400).json({ success: false, message: 'quantity must be greater than 0' });
      }
      item.quantity = qty;
    }

    if (rest.expiryDate !== undefined || rest.expiry !== undefined) {
      const nextExpiryDate = parseDateOnly(rest.expiryDate || rest.expiry);
      if (!nextExpiryDate) {
        return res.status(400).json({ success: false, message: 'expiryDate is required' });
      }
      if (isPastDate(nextExpiryDate)) {
        return res.status(400).json({ success: false, message: 'expiryDate cannot be in the past' });
      }
      item.expiryDate = nextExpiryDate;
      item.expiry = nextExpiryDate.toISOString().slice(0, 10);
    }

    // Do not allow client to edit system fields like status/owner/price.
    item.images = nextImages;
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

export const adminDeleteInventory = async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    await item.deleteOne();
    return res.json({ success: true, message: 'Item deleted' });
  } catch (err) {
    console.error('adminDeleteInventory error', err);
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
  adminDeleteInventory,
};
