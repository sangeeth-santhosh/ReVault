import User from '../models/User.js';
import { createToken } from '../utils/tokenUtils.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, company, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, company, phone });
    const token = createToken({ id: user._id, role: user.role });

    return res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, approved: user.approved },
      token,
    });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const match = await user.matchPassword(password || '');
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = createToken({ id: user._id, role: user.role });
    return res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, approved: user.approved },
      token,
    });
  } catch (err) {
    console.error('login error', err);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const getMe = async (req, res) => {
  return res.json({ success: true, user: req.user });
};

export default { register, login, getMe };
