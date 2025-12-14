import User from '../models/User.js';

export const getPendingUsers = async (_req, res) => {
  try {
    const users = await User.find({ approved: false, role: 'user' }).select('-password');
    return res.json({ success: true, data: users });
  } catch (err) {
    console.error('getPendingUsers error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch pending users' });
  }
};

export const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.approved = true;
    await user.save();
    return res.json({ success: true, data: { id: user._id, approved: user.approved } });
  } catch (err) {
    console.error('approveUser error', err);
    return res.status(500).json({ success: false, message: 'Could not approve user' });
  }
};

export default { getPendingUsers, approveUser };
