import { createElement } from "react";
import { ArrowLeftRight, BarChart2, Boxes, Home, LogOut, Users } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { adminLogout } from "../services/adminService.js";

const sidebarItems = [
  { id: "home", icon: Home, to: "/admin" },
  { id: "inventory", icon: Boxes, to: "/admin/inventory" },
  { id: "transactions", icon: ArrowLeftRight, to: "/admin/transactions" },
  { id: "chart", icon: BarChart2, to: "/admin/reports" },
  { id: "users", icon: Users, to: "/admin/users" },
];

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location?.pathname || "";

  const isActive = (to) => {
    if (to === "/admin") return pathname === "/" || pathname === "/admin";
    return pathname === to;
  };

  const onLogout = () => {
    adminLogout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className="w-[88px] bg-[#151515] flex flex-col items-center justify-between py-6">
      <div className="flex flex-col items-center gap-8">
        <div className="w-12 h-12 rounded-full bg-white/10 mt-2 mb-2 flex items-center justify-center">
          RV
        </div>

        {sidebarItems.map(({ id, icon, to }) => (
          <Link
            key={id}
            to={to}
            className={`w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer transition ${
              isActive(to)
                ? "bg-white text-black"
                : "text-white/60 hover:bg-white/10"
            }`}
          >
            {createElement(icon, { size: 20 })}
          </Link>
        ))}
      </div>

      <button
        type="button"
        onClick={onLogout}
        aria-label="Log out"
        title="Log out"
        className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/15"
      >
        <LogOut size={15} />
      </button>
    </aside>
  );
}

export { AdminSidebar };
export default AdminSidebar;
