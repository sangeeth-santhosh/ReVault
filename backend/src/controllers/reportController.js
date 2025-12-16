import mongoose from 'mongoose';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import Transaction from '../models/Transaction.js';
import Inventory from '../models/Inventory.js';

const toObjectId = (id) => (mongoose.Types.ObjectId.isValid(String(id)) ? new mongoose.Types.ObjectId(String(id)) : id);
const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '');
const ellipsize = (value, max = 80) => {
  if (value === undefined || value === null) return '';
  const str = String(value);
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
};

const renderTable = (doc, columns, rows) => {
  const startX = doc.page.margins.left;
  const tableWidth = columns.reduce((sum, col) => sum + col.width, 0);
  const headerHeight = 22;
  const rowHeight = 18;
  let y = doc.y;

  const drawHeader = () => {
    doc.save();
    doc.rect(startX, y, tableWidth, headerHeight).fill('#f5f5f5');
    doc.restore();
    doc.lineWidth(0.5).strokeColor('#e5e7eb').moveTo(startX, y + headerHeight).lineTo(startX + tableWidth, y + headerHeight).stroke();
    doc.fontSize(10).font('Helvetica-Bold');
    let x = startX;
    columns.forEach((col) => {
      doc.text(col.label, x + 6, y + 6, { width: col.width - 12, align: col.align || 'left' });
      x += col.width;
    });
    y += headerHeight;
    doc.font('Helvetica');
  };

  drawHeader();

  rows.forEach((row) => {
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
      drawHeader();
    }
    let x = startX;
    columns.forEach((col) => {
      const raw = col.format ? col.format(row[col.key], row) : row[col.key];
      const text = ellipsize(raw, col.maxChars || 80);
      doc.text(text ?? '', x + 6, y + 4, { width: col.width - 12, align: col.align || 'left' });
      x += col.width;
    });
    doc.lineWidth(0.5).strokeColor('#e5e7eb').moveTo(startX, y + rowHeight).lineTo(startX + tableWidth, y + rowHeight).stroke();
    y += rowHeight;
  });
};

// ---------------- Inventory Posted ----------------
export const getInventoryPostedReport = async (req, res) => {
  try {
    const ownerId = toObjectId(req.user._id);
    const items = await Inventory.find({ owner: ownerId }).select('title name category quantity createdAt');
    console.log('report inventoryPosted', items.length);
    return res.json({
      success: true,
      data: items.map((inv) => ({
        itemName: inv.title || inv.name || 'Item',
        category: inv.category || '—',
        quantity: inv.quantity ?? 0,
        createdAt: inv.createdAt,
      })),
    });
  } catch (err) {
    console.error('getInventoryPostedReport error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch inventory report' });
  }
};

export const downloadInventoryPostedCsv = async (req, res) => {
  try {
    const ownerId = toObjectId(req.user._id);
    const items = await Inventory.find({ owner: ownerId }).select('title name category quantity createdAt');
    console.log('csv inventoryPosted', items.length);

    const rows = items.map((inv) => ({
      itemName: inv.title || inv.name || 'Item',
      category: inv.category || '—',
      quantity: inv.quantity ?? 0,
      createdAt: inv.createdAt,
    }));

    const parser = new Parser({
      fields: [
        { label: 'Item', value: 'itemName' },
        { label: 'Category', value: 'category' },
        { label: 'Quantity', value: 'quantity' },
        { label: 'Created', value: (row) => formatDate(row.createdAt) },
      ],
    });
    const csv = parser.parse(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory-posted.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('downloadInventoryPostedCsv error', err);
    return res.status(500).json({ success: false, message: 'Could not generate CSV' });
  }
};

export const downloadInventoryPostedPdf = async (req, res) => {
  try {
    const ownerId = toObjectId(req.user._id);
    const items = await Inventory.find({ owner: ownerId }).select('title name category quantity createdAt');
    console.log('pdf inventoryPosted', items.length);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="inventory-posted.pdf"');

    const doc = new PDFDocument({ size: 'A4', margin: 45 });
    doc.pipe(res);
    doc.fontSize(16).text('Inventory Posted', { align: 'left' });
    doc.moveDown(0.5);

    const rows = items.map((inv) => ({
      itemName: inv.title || inv.name || 'Item',
      category: inv.category || '—',
      quantity: inv.quantity ?? 0,
      createdAt: inv.createdAt,
    }));

    renderTable(doc, [
      { key: 'itemName', label: 'Item Name', width: 220 },
      { key: 'category', label: 'Category', width: 120 },
      { key: 'quantity', label: 'Quantity', width: 80, align: 'center' },
      { key: 'createdAt', label: 'Created Date', width: 85, align: 'center', format: formatDate, maxChars: 20 },
    ], rows);

    doc.end();
  } catch (err) {
    console.error('downloadInventoryPostedPdf error', err);
    return res.status(500).json({ success: false, message: 'Could not generate PDF' });
  }
};

// ---------------- Completed Transactions ----------------
const completedTxFilter = (userId) => ({
  status: 'completed',
  $or: [{ buyer: userId }, { seller: userId }],
});

export const getCompletedTransactionsReport = async (req, res) => {
  try {
    const userId = toObjectId(req.user._id);
    const tx = await Transaction.find(completedTxFilter(userId))
      .populate({ path: 'request', populate: { path: 'inventory', select: 'title name' } })
      .populate('buyer', 'name businessName')
      .populate('seller', 'name businessName');
    console.log('report completedTransactions', tx.length);
    const data = tx.map((t) => ({
      itemName: t.request?.inventory?.title || t.request?.inventory?.name || 'Item',
      quantity: t.quantity || t.request?.quantity || 0,
      sellerName: t.seller?.businessName || t.seller?.name || 'Seller',
      buyerName: t.buyer?.businessName || t.buyer?.name || 'Buyer',
      completedAt: t.updatedAt || t.createdAt,
    }));
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getCompletedTransactionsReport error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch completed transactions report' });
  }
};

export const downloadCompletedTransactionsCsv = async (req, res) => {
  try {
    const userId = toObjectId(req.user._id);
    const tx = await Transaction.find(completedTxFilter(userId))
      .populate({ path: 'request', populate: { path: 'inventory', select: 'title name' } })
      .populate('buyer', 'name businessName')
      .populate('seller', 'name businessName');
    console.log('csv completedTransactions', tx.length);
    const rows = tx.map((t) => ({
      itemName: t.request?.inventory?.title || t.request?.inventory?.name || 'Item',
      quantity: t.quantity || t.request?.quantity || 0,
      sellerName: t.seller?.businessName || t.seller?.name || 'Seller',
      buyerName: t.buyer?.businessName || t.buyer?.name || 'Buyer',
      completedAt: t.updatedAt || t.createdAt,
    }));
    const parser = new Parser({
      fields: [
        { label: 'Item', value: 'itemName' },
        { label: 'Quantity', value: 'quantity' },
        { label: 'Seller', value: 'sellerName' },
        { label: 'Buyer', value: 'buyerName' },
        { label: 'Completed', value: (row) => formatDate(row.completedAt) },
      ],
    });
    const csv = parser.parse(rows);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="completed-transactions.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('downloadCompletedTransactionsCsv error', err);
    return res.status(500).json({ success: false, message: 'Could not generate CSV' });
  }
};

export const downloadCompletedTransactionsPdf = async (req, res) => {
  try {
    const userId = toObjectId(req.user._id);
    const tx = await Transaction.find(completedTxFilter(userId))
      .populate({ path: 'request', populate: { path: 'inventory', select: 'title name' } })
      .populate('buyer', 'name businessName')
      .populate('seller', 'name businessName');
    console.log('pdf completedTransactions', tx.length);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="completed-transactions.pdf"');
    const doc = new PDFDocument({ size: 'A4', margin: 45 });
    doc.pipe(res);
    doc.fontSize(16).text('Completed Transactions', { align: 'left' });
    doc.moveDown(0.5);
    const rows = tx.map((t) => ({
      itemName: t.request?.inventory?.title || t.request?.inventory?.name || 'Item',
      quantity: t.quantity || t.request?.quantity || 0,
      sellerName: t.seller?.businessName || t.seller?.name || 'Seller',
      buyerName: t.buyer?.businessName || t.buyer?.name || 'Buyer',
      completedAt: t.updatedAt || t.createdAt,
    }));

    renderTable(doc, [
      { key: 'itemName', label: 'Item Name', width: 165 },
      { key: 'quantity', label: 'Quantity', width: 70, align: 'center' },
      { key: 'sellerName', label: 'Sender', width: 110 },
      { key: 'buyerName', label: 'Receiver', width: 110 },
      { key: 'completedAt', label: 'Completed Date', width: 50, align: 'center', format: formatDate, maxChars: 20 },
    ], rows);

    doc.end();
  } catch (err) {
    console.error('downloadCompletedTransactionsPdf error', err);
    return res.status(500).json({ success: false, message: 'Could not generate PDF' });
  }
};

// ---------------- Quantity Transferred ----------------
export const getQuantityTransferredReport = async (req, res) => {
  try {
    const rows = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      {
        $lookup: {
          from: 'requests',
          localField: 'request',
          foreignField: '_id',
          as: 'req',
        },
      },
      { $unwind: '$req' },
      {
        $lookup: {
          from: 'inventories',
          localField: 'req.inventory',
          foreignField: '_id',
          as: 'inv',
        },
      },
      { $unwind: { path: '$inv', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$req.inventory',
          totalQuantity: { $sum: { $ifNull: ['$quantity', '$req.quantity'] } },
          itemName: { $first: { $ifNull: ['$inv.title', '$inv.name', 'Item'] } },
        },
      },
    ]);
    console.log('report quantityTransferred', rows.length);
    const data = rows.map((r) => ({ itemName: r.itemName || 'Item', totalQuantity: r.totalQuantity || 0 }));
    return res.json({ success: true, data });
  } catch (err) {
    console.error('getQuantityTransferredReport error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch quantity transferred report' });
  }
};

export const downloadQuantityTransferredCsv = async (req, res) => {
  try {
    const rows = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      {
        $lookup: {
          from: 'requests',
          localField: 'request',
          foreignField: '_id',
          as: 'req',
        },
      },
      { $unwind: '$req' },
      {
        $lookup: {
          from: 'inventories',
          localField: 'req.inventory',
          foreignField: '_id',
          as: 'inv',
        },
      },
      { $unwind: { path: '$inv', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$req.inventory',
          totalQuantity: { $sum: { $ifNull: ['$quantity', '$req.quantity'] } },
          itemName: { $first: { $ifNull: ['$inv.title', '$inv.name', 'Item'] } },
        },
      },
    ]);
    console.log('csv quantityTransferred', rows.length);
    const data = rows.map((r) => ({ itemName: r.itemName || 'Item', totalQuantity: r.totalQuantity || 0 }));
    const parser = new Parser({
      fields: [
        { label: 'Item', value: 'itemName' },
        { label: 'Total Quantity', value: 'totalQuantity' },
      ],
    });
    const csv = parser.parse(data);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="quantity-transferred.csv"');
    return res.status(200).send(csv);
  } catch (err) {
    console.error('downloadQuantityTransferredCsv error', err);
    return res.status(500).json({ success: false, message: 'Could not generate CSV' });
  }
};

export const downloadQuantityTransferredPdf = async (req, res) => {
  try {
    const rows = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      {
        $lookup: {
          from: 'requests',
          localField: 'request',
          foreignField: '_id',
          as: 'req',
        },
      },
      { $unwind: '$req' },
      {
        $lookup: {
          from: 'inventories',
          localField: 'req.inventory',
          foreignField: '_id',
          as: 'inv',
        },
      },
      { $unwind: { path: '$inv', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$req.inventory',
          totalQuantity: { $sum: { $ifNull: ['$quantity', '$req.quantity'] } },
          itemName: { $first: { $ifNull: ['$inv.title', '$inv.name', 'Item'] } },
        },
      },
    ]);
    console.log('pdf quantityTransferred', rows.length);
    const data = rows.map((r) => ({ itemName: r.itemName || 'Item', totalQuantity: r.totalQuantity || 0 }));
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="quantity-transferred.pdf"');
    const doc = new PDFDocument({ size: 'A4', margin: 45 });
    doc.pipe(res);
    doc.fontSize(16).text('Quantity Transferred', { align: 'left' });
    doc.moveDown(0.5);
    renderTable(doc, [
      { key: 'itemName', label: 'Item Name', width: 360 },
      { key: 'totalQuantity', label: 'Total Quantity', width: 145, align: 'center' },
    ], data);
    doc.end();
  } catch (err) {
    console.error('downloadQuantityTransferredPdf error', err);
    return res.status(500).json({ success: false, message: 'Could not generate PDF' });
  }
};

// Keep the old summary for dashboard compatibility
export const getTransactionSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const transactions = await Transaction.find({ status: 'completed', $or: [{ buyer: userId }, { seller: userId }] }).populate({
      path: 'request',
      populate: { path: 'inventory', select: 'title quantity owner' },
    });
    const totalCompletedTransactions = transactions.length;
    const totalQuantityTransferred = transactions.reduce(
      (sum, tx) => sum + (tx.quantity || tx.request?.quantity || 0),
      0
    );
    const totalInventoryPosted = await Inventory.countDocuments({ owner: userId });
    return res.json({ success: true, data: { totalCompletedTransactions, totalQuantityTransferred, totalInventoryPosted } });
  } catch (err) {
    console.error('getTransactionSummary error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch reports data' });
  }
};

export default {
  getInventoryPostedReport,
  downloadInventoryPostedCsv,
  downloadInventoryPostedPdf,
  getCompletedTransactionsReport,
  downloadCompletedTransactionsCsv,
  downloadCompletedTransactionsPdf,
  getQuantityTransferredReport,
  downloadQuantityTransferredCsv,
  downloadQuantityTransferredPdf,
  getTransactionSummary,
};
