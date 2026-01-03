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

const revenueData = [
  { name: "1 Aug", value: 12000 },
  { name: "2 Aug", value: 4000 },
  { name: "3 Aug", value: 9000 },
  { name: "4 Aug", value: 7000 },
  { name: "5 Aug", value: 11000 },
  { name: "6 Aug", value: 15000 },
  { name: "7 Aug", value: 17000 },
];

const categoryData = [
  { name: "MacBook", value: 35, color: "#4F8BFF" },
  { name: "Watch", value: 25, color: "#FF9F43" },
  { name: "AirPods", value: 20, color: "#FFD166" },
  { name: "Accessories", value: 20, color: "#2ED573" },
];

export default function Dashboard() {
  return (
    <>
      {/* CARDS (DIMENSIONS LOCKED, LAYOUT UNCHANGED) */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="h-[110px] rounded-2xl bg-white p-5 text-black">
          <p className="text-sm opacity-60">Total revenue</p>
          <h2 className="text-2xl font-semibold mt-2">$ 99,560</h2>
          <span className="text-xs text-green-600">+2.5%</span>
        </div>

        <div className="h-[110px] rounded-2xl bg-white/5 p-5 backdrop-blur-xl border border-white/10">
          <p className="text-sm opacity-60">Total orders</p>
          <h2 className="text-2xl font-semibold mt-2">35</h2>
          <span className="text-xs text-red-400">-1.4%</span>
        </div>

        <div className="h-[110px] rounded-2xl bg-white/5 p-5 backdrop-blur-xl border border-white/10">
          <p className="text-sm opacity-60">Total visitors</p>
          <h2 className="text-2xl font-semibold mt-2">45,600</h2>
          <span className="text-xs text-red-400">-2.1%</span>
        </div>

        <div className="h-[110px] rounded-2xl bg-white/5 p-5 backdrop-blur-xl border border-white/10">
          <p className="text-sm opacity-60">Net profit</p>
          <h2 className="text-2xl font-semibold mt-2">$ 60,450</h2>
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
