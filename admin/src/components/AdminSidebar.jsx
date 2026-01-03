import { BarChart2, Home, LogOut, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const sidebarItems = [
  { id: "home", icon: Home, to: "/admin" },
  { id: "chart", icon: BarChart2, to: "/admin/reports" },
  { id: "users", icon: Users, to: "/admin/users" },
];

function AdminSidebar() {
  const location = useLocation();
  const pathname = location?.pathname || "";

  const isActive = (to) => {
    if (to === "/admin") return pathname === "/" || pathname === "/admin";
    return pathname === to;
  };

  return (
    <aside className="w-[88px] bg-[#151515] flex flex-col items-center justify-between py-6">
      <div className="flex flex-col items-center gap-8">
        <div className="w-12 h-12 rounded-full bg-white/10 mt-2 mb-2 flex items-center justify-center">
          RV
        </div>

        {sidebarItems.map(({ id, icon: Icon, to }) => (
          <Link
            key={id}
            to={to}
            className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition ${
              isActive(to)
                ? "bg-white text-black"
                : "text-white/60 hover:bg-white/10"
            }`}
          >
            <Icon size={20} />
          </Link>
        ))}
      </div>

      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
        <LogOut size={15} />
      </div>
    </aside>
  );
}

export { AdminSidebar };
export default AdminSidebar;
