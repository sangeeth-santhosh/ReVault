import Transaction from '../models/Transaction.js';

export const getMyTransactions = async (req, res) => {
  try {
    const data = await Transaction.find({ buyer: req.user._id })
      .populate({ path: 'request', populate: { path: 'inventory', select: 'title name' } })
      .sort({ createdAt: -1 });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getMyTransactions error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch transactions' });
  }
};

export const getSellerTransactions = async (req, res) => {
  try {
    const data = await Transaction.find({ seller: req.user._id })
      .populate({ path: 'request', populate: { path: 'inventory', select: 'title name' } })
      .sort({ createdAt: -1 });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getSellerTransactions error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch transactions' });
  }
};

export default { getMyTransactions, getSellerTransactions };
