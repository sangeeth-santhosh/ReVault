import { Bell, Calendar, Search, Settings } from "lucide-react";

export default function AdminHeader() {
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return (
    <>
      {/* TOP BAR */}
      <div className="flex justify-between items-start mb-0">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <div className="w-[360px] max-w-full h-[44px] rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl flex items-center px-4 gap-2 text-sm text-white/60">
              <Search size={16} />
              Search
            </div>
            <span className="text-sm font-medium text-white">Today, {dateLabel}</span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold mt-7">Hello, Barbara! 👋</h1>
            <p className="text-sm opacity-50 mt-3">
              This is what’s happening in your store this month.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Settings size={18} className="text-white/70" />
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Bell size={18} className="opacity-60" />
          </div>
          <div className="w-11 h-11 rounded-full bg-white/10" />
        </div>
      </div>

      {/* HEADER RIGHT FILTER — aligned to same row */}
      <div className="flex justify-end -mt-[42px] mb-6">
        <div className="flex items-center gap-2 px-4 h-[40px] rounded-xl bg-white/5 border border-white/10 text-sm text-white/70">
          <Calendar size={16} />
          <select
            defaultValue="This month"
            className="bg-transparent outline-none appearance-none text-sm text-white/70"
          >
            <option>This month</option>
            <option>Other</option>
          </select>
          <span className="pointer-events-none select-none text-white/70">&gt;</span>
        </div>
      </div>
    </>
  );
}
