import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import Transaction from '../models/Transaction.js';
import Inventory from '../models/Inventory.js';

const transactionQueryForUser = (userId) => ({
  status: 'completed',
  $or: [{ buyer: userId }, { seller: userId }],
});

export const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find(transactionQueryForUser(userId)).populate({
      path: 'request',
      populate: { path: 'inventory', select: 'title quantity owner' },
    });

    const totalCompletedTransactions = transactions.length;
    const totalQuantityTransferred = transactions.reduce(
      (sum, tx) => sum + (tx.quantity || tx.request?.quantity || 0),
      0
    );
    const totalInventoryPosted = await Inventory.countDocuments({ owner: userId });

    return res.json({
      success: true,
      data: { totalCompletedTransactions, totalQuantityTransferred, totalInventoryPosted },
    });
  } catch (err) {
    console.error('getTransactionSummary error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch reports data' });
  }
};

const mapTransactions = (transactions) =>
  transactions.map((tx) => ({
    itemName: tx.request?.inventory?.title || tx.request?.inventory?.name || 'Item',
    quantity: tx.quantity || tx.request?.quantity || 0,
    date: tx.createdAt,
    sender: tx.seller?.name || 'Seller',
    receiver: tx.buyer?.name || 'Buyer',
  }));

export const downloadTransactionsCsv = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find(transactionQueryForUser(userId))
      .populate({ path: 'request', populate: { path: 'inventory', select: 'title name' } })
      .populate('buyer', 'name email businessName')
      .populate('seller', 'name email businessName');

    console.log('transactions for csv report', transactions.length);

    const rows = transactions.map((tx) => ({
      itemName: tx.request?.inventory?.title || tx.request?.inventory?.name || 'Item',
      quantity: tx.quantity || tx.request?.quantity || 0,
      sellerBusinessName: tx.seller?.businessName || tx.seller?.name || 'Seller',
      buyerBusinessName: tx.buyer?.businessName || tx.buyer?.name || 'Buyer',
      completedAt: tx.createdAt,
    }));

    const parser = new Parser({
      fields: ['itemName', 'quantity', 'sellerBusinessName', 'buyerBusinessName', 'completedAt'],
    });
    const csv = parser.parse(rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('downloadTransactionsCsv error', err);
    return res.status(500).json({ success: false, message: 'Could not generate CSV' });
  }
};

export const downloadTransactionsPdf = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find(transactionQueryForUser(userId))
      .populate({ path: 'request', populate: { path: 'inventory', select: 'title name' } })
      .populate('buyer', 'name email businessName')
      .populate('seller', 'name email businessName');

    console.log('transactions for pdf report', transactions.length);

    const rows = transactions.map((tx) => ({
      itemName: tx.request?.inventory?.title || tx.request?.inventory?.name || 'Item',
      quantity: tx.quantity || tx.request?.quantity || 0,
      sellerBusinessName: tx.seller?.businessName || tx.seller?.name || 'Seller',
      buyerBusinessName: tx.buyer?.businessName || tx.buyer?.name || 'Buyer',
      completedAt: tx.createdAt,
    }));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.pdf"');

    const doc = new PDFDocument({ margin: 30 });
    doc.pipe(res);

    doc.fontSize(16).text('Transactions Report', { align: 'left' });
    doc.moveDown();

    doc.fontSize(10);
    const headers = ['Item', 'Quantity', 'Date', 'Sender', 'Receiver'];
    doc.text(headers.join(' | '));
    doc.moveDown(0.5);

    rows.forEach((row) => {
      const line = [
        row.itemName,
        row.quantity,
        new Date(row.date).toLocaleDateString(),
        row.sender,
        row.receiver,
      ].join(' | ');
      doc.text(line);
    });

    doc.end();
  } catch (err) {
    console.error('downloadTransactionsPdf error', err);
    return res.status(500).json({ success: false, message: 'Could not generate PDF' });
  }
};

export default {
  getTransactionSummary,
  downloadTransactionsCsv,
  downloadTransactionsPdf,
};
