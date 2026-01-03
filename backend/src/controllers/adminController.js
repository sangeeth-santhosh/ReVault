import User from '../models/User.js';

const userSafeSelect = '-password';

const getEffectiveStatus = (user) => {
  if (user?.status) return user.status;
  if (user?.approved === false) return 'pending';
  return 'approved';
};

const applyStatusUpdate = (user, nextStatus) => {
  user.status = nextStatus;

  if (!user.appliedAt) {
    user.appliedAt = user.createdAt || new Date();
  }

  if (nextStatus === 'approved') {
    user.approved = true;
    user.approvedAt = new Date();
    return;
  }

  user.approved = false;
  if (nextStatus !== 'approved') {
    user.approvedAt = undefined;
  }
};

export const getPendingUsers = async (_req, res) => {
  try {
    const users = await User.find({ approved: false, role: 'user' }).select(userSafeSelect);
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('getPendingUsers error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch pending users' });
  }
};

export const getPendingBusinesses = async (_req, res) => {
  try {
    const users = await User.find({
      role: 'user',
      $or: [{ status: 'pending' }, { status: { $exists: false }, approved: false }],
    }).select(userSafeSelect);
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('getPendingBusinesses error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch pending businesses' });
  }
};

export const getApprovedBusinesses = async (_req, res) => {
  try {
    const users = await User.find({
      role: 'user',
      $or: [{ status: 'approved' }, { status: { $exists: false }, approved: { $ne: false } }],
    }).select(userSafeSelect);
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('getApprovedBusinesses error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch approved businesses' });
  }
};

export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    applyStatusUpdate(user, 'approved');
    await user.save();
    return res.json({
      success: true,
      data: { id: user._id, approved: user.approved, status: user.status, approvedAt: user.approvedAt },
    });
  } catch (err) {
    console.error('approveUser error', err);
    return res.status(500).json({ success: false, message: 'Could not approve user' });
  }
};

export const rejectUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    applyStatusUpdate(user, 'rejected');
    await user.save();
    return res.json({ success: true, data: { id: user._id, status: user.status } });
  } catch (err) {
    console.error('rejectUser error', err);
    return res.status(500).json({ success: false, message: 'Could not reject user' });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    applyStatusUpdate(user, 'deactivated');
    await user.save();
    return res.json({ success: true, data: { id: user._id, status: user.status } });
  } catch (err) {
    console.error('deactivateUser error', err);
    return res.status(500).json({ success: false, message: 'Could not deactivate user' });
  }
};

export default {
  getPendingUsers,
  getPendingBusinesses,
  getApprovedBusinesses,
  approveUser,
  rejectUser,
  deactivateUser,
};
