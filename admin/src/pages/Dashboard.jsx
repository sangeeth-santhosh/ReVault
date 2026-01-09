import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { fetchAdminDashboard } from "../services/adminService";

export default function Dashboard() {
  const [range, setRange] = useState("This month");

  const [cards, setCards] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalVisitors: 0,
    netProfit: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const apiRange = useMemo(
    () => (range === "This month" ? "this_month" : "other"),
    [range]
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetchAdminDashboard(apiRange);
        const data = res?.data || {};

        if (cancelled) return;

        setCards({
          totalRevenue: Number(data?.cards?.totalRevenue || 0),
          totalOrders: Number(data?.cards?.totalOrders || 0),
          totalVisitors: Number(data?.cards?.totalVisitors || 0),
          netProfit: Number(data?.cards?.netProfit || 0),
        });
        setRevenueData(
          Array.isArray(data?.revenueData) ? data.revenueData : []
        );
        setCategoryData(
          Array.isArray(data?.categoryData) ? data.categoryData : []
        );
      } catch (err) {
        console.error("Failed to load admin dashboard", err);
        if (!cancelled) {
          setCards({
            totalRevenue: 0,
            totalOrders: 0,
            totalVisitors: 0,
            netProfit: 0,
          });
          setRevenueData([]);
          setCategoryData([]);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [apiRange]);

  const formatMoney = (n) => {
    const value = Number.isFinite(n) ? n : 0;
    const rounded = Math.round(value);
    return rounded.toLocaleString();
  };

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Hello, Admin! 👋</h1>
          <p className="text-sm opacity-50 mt-3">
            This is what’s happening in your store this month.
          </p>
        </div>

        <div className="relative flex items-center gap-2 px-4 h-[40px] rounded-xl bg-white/5 border border-white/10 text-sm text-white/70">
          <Calendar size={16} />
          <span className="text-sm text-white/70">{range}</span>
          <span className="pointer-events-none select-none text-white/70">
            &gt;
          </span>

          <select
            aria-label="Date range"
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          >
            <option value="This month">This month</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* CARDS (DIMENSIONS LOCKED, LAYOUT UNCHANGED) */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="h-[110px] rounded-2xl bg-white p-5 text-black">
          <p className="text-sm opacity-60">Total revenue</p>
          <h2 className="text-2xl font-semibold mt-2">
            $ {formatMoney(cards.totalRevenue)}
          </h2>
          <span className="text-xs text-green-600">+2.5%</span>
        </div>

        <div className="h-[110px] rounded-2xl bg-white/5 p-5 backdrop-blur-xl border border-white/10">
          <p className="text-sm opacity-60">Total orders</p>
          <h2 className="text-2xl font-semibold mt-2">{cards.totalOrders}</h2>
          <span className="text-xs text-red-400">-1.4%</span>
        </div>

        <div className="h-[110px] rounded-2xl bg-white/5 p-5 backdrop-blur-xl border border-white/10">
          <p className="text-sm opacity-60">Total visitors</p>
          <h2 className="text-2xl font-semibold mt-2">
            {cards.totalVisitors.toLocaleString()}
          </h2>
          <span className="text-xs text-red-400">-2.1%</span>
        </div>

        <div className="h-[110px] rounded-2xl bg-white/5 p-5 backdrop-blur-xl border border-white/10">
          <p className="text-sm opacity-60">Net profit</p>
          <h2 className="text-2xl font-semibold mt-2">
            $ {formatMoney(cards.netProfit)}
          </h2>
          <span className="text-xs text-green-400">+5.2%</span>
        </div>
      </div>

      {/* CHART + PIE (UNCHANGED) */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-2xl bg-white/5 p-6 backdrop-blur-xl border border-white/10">
          <h3 className="mb-4">Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <XAxis dataKey="name" stroke="#555" />
              <YAxis stroke="#555" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4F8BFF"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-xl border border-white/10">
          <h3 className="mb-4">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={categoryData}
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
              >
                {categoryData.map((c, i) => (
                  <Cell key={i} fill={c.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
