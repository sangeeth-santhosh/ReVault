import Request from '../models/Request.js';
import Message from '../models/Message.js';

export const sendMessage = async (req, res) => {
  try {
    const { requestId, body, content } = req.body;
    const text = body || content;
    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const isParticipant =
      request.buyer.toString() === req.user._id.toString() ||
      request.seller.toString() === req.user._id.toString();
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not a participant in this request' });
    }

    if (!text) {
      return res.status(400).json({ success: false, message: 'Message body required' });
    }

    const message = await Message.create({ request: requestId, sender: req.user._id, body: text });
    return res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error('sendMessage error', err);
    return res.status(500).json({ success: false, message: 'Could not send message' });
  }
};

export const getChatByRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    const isParticipant =
      request.buyer.toString() === req.user._id.toString() ||
      request.seller.toString() === req.user._id.toString();
    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Not a participant in this request' });
    }

    const messages = await Message.find({ request: req.params.requestId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 });

    return res.json({ success: true, data: messages });
  } catch (err) {
    console.error('getChatByRequest error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch chat' });
  }
};

export default { sendMessage, getChatByRequest };
