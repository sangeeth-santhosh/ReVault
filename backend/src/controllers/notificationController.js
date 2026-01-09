import Notification from '../models/Notification.js';

export const getAdminNotifications = async (req, res) => {
  try {
    const limitRaw = req.query.limit;
    const limit = Math.min(Math.max(Number(limitRaw || 25) || 25, 1), 100);

    const [data, unreadCount] = await Promise.all([
      Notification.find().sort({ createdAt: -1 }).limit(limit),
      Notification.countDocuments({ isRead: false }),
    ]);

    return res.json({ success: true, data, unreadCount });
  } catch (err) {
    console.error('getAdminNotifications error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch notifications' });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    const unreadCount = await Notification.countDocuments({ isRead: false });
    return res.json({ success: true, data: notification, unreadCount });
  } catch (err) {
    console.error('markNotificationRead error', err);
    return res.status(500).json({ success: false, message: 'Could not update notification' });
  }
};

export default { getAdminNotifications, markNotificationRead };
