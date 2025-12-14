import Request from '../models/Request.js';
import Inventory from '../models/Inventory.js';
import Transaction from '../models/Transaction.js';

export const sendRequest = async (req, res) => {
  try {
    const { inventoryId, quantity, message } = req.body;
    const inventory = await Inventory.findById(inventoryId);
    if (!inventory) {
      return res.status(404).json({ success: false, message: 'Inventory not found' });
    }

    const request = await Request.create({
      inventory: inventoryId,
      buyer: req.user._id,
      seller: inventory.owner,
      quantity,
      message,
    });

    return res.status(201).json({ success: true, data: request });
  } catch (err) {
    console.error('sendRequest error', err);
    return res.status(500).json({ success: false, message: 'Could not send request' });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ buyer: req.user._id })
      .populate('inventory')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: requests });
  } catch (err) {
    console.error('getMyRequests error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch requests' });
  }
};

export const getIncomingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ seller: req.user._id })
      .populate('inventory')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: requests });
  } catch (err) {
    console.error('getIncomingRequests error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch incoming requests' });
  }
};

const updateStatus = async (req, res, status) => {
  try {
    const request = await Request.findOne({ _id: req.params.id, seller: req.user._id }).populate('inventory');
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    request.status = status;
    await request.save();

    if (status === 'completed') {
      await Transaction.create({
        request: request._id,
        buyer: request.buyer,
        seller: request.seller,
        amount: req.body?.amount || 0,
        // simple value using inventory price if available
        value: request.inventory?.price,
      });
    }

    return res.json({ success: true, data: request });
  } catch (err) {
    console.error(`updateStatus ${status} error`, err);
    return res.status(500).json({ success: false, message: 'Could not update request status' });
  }
};

export const acceptRequest = (req, res) => updateStatus(req, res, 'accepted');
export const rejectRequest = (req, res) => updateStatus(req, res, 'rejected');
export const completeRequest = (req, res) => updateStatus(req, res, 'completed');

export default {
  sendRequest,
  getMyRequests,
  getIncomingRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
};
