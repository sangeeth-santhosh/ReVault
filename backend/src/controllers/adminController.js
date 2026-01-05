import User from '../models/User.js';

const userSafeSelect = '-password';

const applyStatusUpdate = (user, nextStatus) => {
  user.status = nextStatus;

  if (!user.appliedAt) {
    user.appliedAt = user.createdAt || new Date();
  }

  if (nextStatus === 'approved') {
    user.approvedAt = new Date();
    return;
  }

  if (nextStatus !== 'approved') {
    user.approvedAt = undefined;
  }
};

const buildStatusUpdate = (user, nextStatus) => {
  const now = new Date();
  const $set = {
    status: nextStatus,
  };
  const $unset = {};

  if (!user.appliedAt) {
    $set.appliedAt = user.createdAt || now;
  }

  if (nextStatus === 'approved') {
    $set.approvedAt = now;
  } else {
    $unset.approvedAt = 1;
  }

  return Object.keys($unset).length ? { $set, $unset } : { $set };
};

export const getPendingUsers = async (_req, res) => {
  try {
    const users = await User.find({ role: 'user', status: 'pending' }).select(userSafeSelect);
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
      status: 'pending',
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
      $or: [{ status: 'approved' }, { status: { $exists: false } }],
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
    const update = buildStatusUpdate(user, 'approved');
    const updated = await User.findByIdAndUpdate(user._id, update, { new: true });
    return res.json({
      success: true,
      data: {
        id: updated?._id || user._id,
        status: updated?.status,
        approvedAt: updated?.approvedAt,
      },
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
    const update = buildStatusUpdate(user, 'rejected');
    const updated = await User.findByIdAndUpdate(user._id, update, { new: true });
    return res.json({
      success: true,
      data: { id: updated?._id || user._id, status: updated?.status || 'rejected' },
    });
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
    const update = buildStatusUpdate(user, 'deactivated');
    const updated = await User.findByIdAndUpdate(user._id, update, { new: true });
    return res.json({
      success: true,
      data: { id: updated?._id || user._id, status: updated?.status || 'deactivated' },
    });
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
