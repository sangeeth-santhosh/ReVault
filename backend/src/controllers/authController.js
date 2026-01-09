import User from '../models/User.js';
import { createToken } from '../utils/tokenUtils.js';
import Notification from '../models/Notification.js';

const buildUserResponse = (user) => ({
  id: user._id,
  businessName: user.businessName,
  name: user.name,
  email: user.email,
  role: user.role,
  company: user.company,
  phone: user.phone,
  address: user.address,
  status: user.status,
  appliedAt: user.appliedAt,
  approvedAt: user.approvedAt,
});

export const register = async (req, res) => {
  try {
    const { businessName, name, email, password, company, phone, address = {} } = req.body;
    if (!businessName || !name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'Business name, contact name, email, and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      const effectiveStatus = existing.status || 'approved';
      if (effectiveStatus === 'approved') {
        return res.status(400).json({
          success: false,
          message: 'This business is already registered. Please login.',
        });
      }
      if (effectiveStatus === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Your request is already pending admin approval.',
        });
      }
      if (effectiveStatus === 'rejected' || effectiveStatus === 'deactivated') {
        existing.status = 'pending';
        existing.appliedAt = new Date();
        existing.approvedAt = undefined;

        // Allow updating business/contact details, but never reset password.
        existing.businessName = businessName.trim();
        existing.name = name.trim();
        existing.company = company?.trim() || undefined;
        existing.phone = phone?.trim() || undefined;
        existing.address = {
          street: address?.street,
          city: address?.city,
          state: address?.state,
          pincode: address?.pincode,
        };

        await existing.save();

        try {
          await Notification.create({
            type: 'business_request',
            message: `New business request from ${existing.businessName || 'a business'}`,
            isRead: false,
          });
        } catch (notifyErr) {
          console.error('register notification error', notifyErr);
        }

        return res.status(201).json({
          success: true,
          user: buildUserResponse(existing),
          token: null,
          message: 'Your business registration is pending admin approval',
        });
      }
    }

    const user = await User.create({
      businessName: businessName.trim(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      company: company?.trim() || undefined,
      phone: phone?.trim() || undefined,
      address: {
        street: address?.street,
        city: address?.city,
        state: address?.state,
        pincode: address?.pincode,
      },
      status: 'pending',
      appliedAt: new Date(),
    });

    try {
      await Notification.create({
        type: 'business_request',
        message: `New business request from ${user.businessName || 'a business'}`,
        isRead: false,
      });
    } catch (notifyErr) {
      console.error('register notification error', notifyErr);
    }

    return res.status(201).json({
      success: true,
      user: buildUserResponse(user),
      token: null,
      message: 'Your business registration is pending admin approval',
    });
  } catch (err) {
    console.error('register error', err);
    return res.status(500).json({ success: false, message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const effectiveStatus = user.status || 'approved';
    if (effectiveStatus !== 'approved') {
      if (effectiveStatus === 'pending') {
        return res
          .status(403)
          .json({ success: false, message: 'Your business is pending admin approval', status: effectiveStatus });
      }
      if (effectiveStatus === 'deactivated') {
        return res
          .status(403)
          .json({ success: false, message: 'Your business account is deactivated', status: effectiveStatus });
      }
      if (effectiveStatus === 'rejected') {
        return res
          .status(403)
          .json({ success: false, message: 'Your business registration was rejected', status: effectiveStatus });
      }
      return res
        .status(403)
        .json({ success: false, message: 'Your business is pending admin approval', status: effectiveStatus });
    }

    const match = await user.matchPassword(password || '');
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = createToken({ id: user._id, role: user.role });
    return res.json({
      success: true,
      user: buildUserResponse(user),
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

export const getRegistrationStatus = async (req, res) => {
  try {
    const email = ((req.query.email ?? req.body?.email) || '').toString().trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'email is required' });
    }

    const user = await User.findOne({ email }).select('status appliedAt');

    if (!user) {
      return res.json({ success: true, exists: false, status: null, appliedAt: null });
    }

    const status = user.status || 'approved';
    return res.json({
      success: true,
      exists: true,
      status,
      appliedAt: status === 'pending' ? user.appliedAt || null : null,
    });
  } catch (err) {
    console.error('getRegistrationStatus error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch registration status' });
  }
};

export default { register, login, getMe, getRegistrationStatus };
