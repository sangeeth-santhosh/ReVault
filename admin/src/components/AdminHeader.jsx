import { Bell, Search, Settings } from "lucide-react";

export default function AdminHeader() {
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="flex justify-between items-start mb-0">
      <div className="flex items-center gap-4">
        <div className="w-[360px] max-w-full h-[44px] rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl flex items-center px-4 gap-2 text-sm text-white/60">
          <Search size={16} />
          Search
        </div>
        <span className="text-sm font-medium text-white">Today, {dateLabel}</span>
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
  );
}
