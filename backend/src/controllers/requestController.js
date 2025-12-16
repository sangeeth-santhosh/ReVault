import mongoose from 'mongoose';
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

    return res.json({ success: true, data: request });
  } catch (err) {
    console.error(`updateStatus ${status} error`, err);
    return res.status(500).json({ success: false, message: 'Could not update request status' });
  }
};

export const acceptRequest = (req, res) => updateStatus(req, res, 'accepted');
export const rejectRequest = (req, res) => updateStatus(req, res, 'rejected');

export const completeRequest = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const request = await Request.findOne({ _id: req.params.id, seller: req.user._id })
      .populate('inventory')
      .session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (request.status === 'completed') {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: 'Request already completed' });
    }

    if (request.status !== 'accepted') {
      await session.abortTransaction();
      return res.status(403).json({ success: false, message: 'Only accepted requests can be completed' });
    }

    if (!request.inventory) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Inventory not found for this request' });
    }

    const existingTx = await Transaction.findOne({ request: request._id }).session(session);
    if (existingTx) {
      await session.abortTransaction();
      return res.status(409).json({ success: false, message: 'Transaction already exists for this request' });
    }

    const requestedQty = request.quantity || 0;
    if (request.inventory.quantity < requestedQty) {
      await session.abortTransaction();
      return res.status(400).json({ success: false, message: 'Insufficient inventory quantity to complete request' });
    }

    request.inventory.quantity = request.inventory.quantity - requestedQty;
    await request.inventory.save({ session });

    const [transaction] = await Transaction.create(
      [
        {
          request: request._id,
          buyer: request.buyer,
          seller: request.seller,
          amount: req.body?.amount || requestedQty || 0,
          value: request.inventory?.price,
          quantity: requestedQty,
          status: 'completed',
        },
      ],
      { session }
    );

    request.status = 'completed';
    await request.save({ session });

    await session.commitTransaction();
    return res.json({ success: true, data: request, transaction });
  } catch (err) {
    await session.abortTransaction();
    console.error('completeRequest error', err);
    return res.status(500).json({ success: false, message: 'Could not complete request' });
  } finally {
    session.endSession();
  }
};

export default {
  sendRequest,
  getMyRequests,
  getIncomingRequests,
  acceptRequest,
  rejectRequest,
  completeRequest,
};
