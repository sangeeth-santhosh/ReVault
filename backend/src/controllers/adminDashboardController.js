import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import Transaction from '../models/Transaction.js';
import Request from '../models/Request.js';

const monthRange = (now = new Date()) => {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  end.setHours(0, 0, 0, 0);
  return { start, end };
};

const formatDayLabel = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  return `${day} ${month}`;
};

export const getAdminDashboard = async (req, res) => {
  try {
    const range = String(req.query.range || 'this_month');

    // Only "this_month" is currently supported; other options safely fall back.
    const { start, end } = monthRange();

    const [totalBusinesses, pendingBusinessRequests, activeInventories, completedOrders] = await Promise.all([
      User.countDocuments({ role: 'user', status: 'approved' }),
      User.countDocuments({ role: 'user', status: 'pending' }),
      Inventory.countDocuments({ status: 'available' }),
      Transaction.countDocuments({ status: 'completed', createdAt: { $gte: start, $lt: end } }),
    ]);

    // Revenue totals (sum of quantity * value) for completed transactions in range.
    const revenueExpr = {
      $cond: [
        { $gt: [{ $ifNull: ['$value', 0] }, 0] },
        {
          $multiply: [
            { $ifNull: ['$quantity', 0] },
            { $ifNull: ['$value', 0] },
          ],
        },
        { $ifNull: ['$amount', 0] },
      ],
    };

    const revenueTotals = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: revenueExpr },
        },
      },
    ]);

    const totalRevenue = Number(revenueTotals?.[0]?.totalRevenue || 0);
    const netProfit = totalRevenue;

    // Daily revenue series for the line chart.
    const revenueDaily = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          value: { $sum: revenueExpr },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with 0 so the chart is stable.
    const revenueDailyMap = new Map(revenueDaily.map((r) => [r._id, r.value]));
    const revenueData = [];
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().slice(0, 10);
      revenueData.push({ name: formatDayLabel(d), value: revenueDailyMap.get(key) || 0 });
    }

    // Sales by category for the pie chart (completed transactions joined to inventory category).
    const categoryAgg = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: start, $lt: end },
        },
      },
      {
        $lookup: {
          from: Request.collection.name,
          localField: 'request',
          foreignField: '_id',
          as: 'requestDoc',
        },
      },
      { $unwind: { path: '$requestDoc', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: Inventory.collection.name,
          localField: 'requestDoc.inventory',
          foreignField: '_id',
          as: 'inventoryDoc',
        },
      },
      { $unwind: { path: '$inventoryDoc', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          category: { $ifNull: ['$inventoryDoc.category', 'Other'] },
          revenue: revenueExpr,
        },
      },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$revenue' },
        },
      },
      { $sort: { value: -1 } },
    ]);

    const palette = ['#4F8BFF', '#FF9F43', '#FFD166', '#2ED573', '#A855F7', '#22C55E', '#F97316'];
    const categoryData = categoryAgg.map((row, idx) => ({
      name: row._id || 'Other',
      value: Number(row.value || 0),
      color: palette[idx % palette.length],
    }));

    return res.json({
      success: true,
      data: {
        range,
        cards: {
          totalRevenue,
          totalOrders: completedOrders,
          totalVisitors: totalBusinesses,
          netProfit,
        },
        counts: {
          totalBusinesses,
          pendingBusinessRequests,
          activeInventories,
          completedOrders,
        },
        revenueData,
        categoryData,
      },
    });
  } catch (err) {
    console.error('getAdminDashboard error', err);
    return res.status(500).json({ success: false, message: 'Could not fetch dashboard data' });
  }
};

export default { getAdminDashboard };
