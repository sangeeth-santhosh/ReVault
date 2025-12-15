import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import images from "../../assets/assets.js";

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState("dashboard");

  const asideClass = `w-64 bg-[#000304] text-slate-100 flex flex-col flex-shrink-0 min-h-screen overflow-y-auto relative z-10`;

  const baseBtn = "w-full flex items-center gap-3 px-6 py-3";
  const activeClasses =
    "bg-emerald-500/15 text-emerald-300 border-l-4 border-emerald-400";
  const inactiveClasses = "hover:bg-sidebarSoft/60 transition text-slate-400";

  const links = [
    { to: "/dashboard", label: "Dashboard", key: "dashboard" },
    { to: "/inventory/add", label: "Add Inventory", key: "addInventory" },
    { to: "/inventory/my", label: "My Inventory", key: "myInventory" },
    { to: "/requests/incoming", label: "Incoming Requests", key: "incomingRequests" },
    { to: "/requests/my", label: "My Requests", key: "myRequests" },
    { to: "/chats", label: "Chats", key: "chats" },
    { to: "/transactions", label: "Transactions", key: "transactions" },
    { to: "/reports", label: "Reports", key: "reports" },
    { to: "/settings", label: "Settings", key: "settings" },
  ];

  return (
    <aside className={asideClass}>
      {/* Logo (Dark version, now styled differently as per the image) */}
      <div className="px-9 pt-6 pb-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
          <img
            src={images}
            alt="Logo"
            className="w-10 h-10 rounded-full bg-emerald-500"
          />
        </div>
        <div>
          <p className="text-xl font-semibold tracking-wide">ReVault</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 mt-4 ml-2 text-sm font-medium">
        <ul>
          {links.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                onClick={() => setActiveItem(link.key)}
                className={`${baseBtn} ${
                  location.pathname === link.to ? activeClasses : inactiveClasses
                }`}
              >
                {/* Preserve existing icon markup */}
                {link.label === "Dashboard" && (
                  <svg
                    className="w-5 h-5 stroke-current"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="7" height="9" rx="1" />
                    <rect x="14" y="3" width="7" height="5" rx="1" />
                    <rect x="14" y="12" width="7" height="9" rx="1" />
                    <rect x="3" y="16" width="7" height="5" rx="1" />
                  </svg>
                )}
                {link.label === "Add Inventory" && (
                  <svg
                    className="w-5 h-5 stroke-current"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14" />
                    <path d="M5 12h14" />
                  </svg>
                )}
                {link.label === "My Inventory" && (
                  <svg
                    className="w-5 h-5 stroke-current"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z" />
                    <path d="M3.29 7 12 12l8.71-5" />
                    <path d="M12 22V12" />
                  </svg>
                )}
                {link.label === "Incoming Requests" && (
                  <svg
                    className="w-5 h-5 stroke-current"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
                  </svg>
                )}
                {link.label === "My Requests" && (
                  <svg
                    className="w-5 h-5 stroke-current"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                )}
                {link.label === "Chats" && (
                  <svg
                    className="w-5 h-5 stroke-current"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
                  </svg>
                )}
                {link.label === "Transactions" && (
                  <svg
                    className="w-5 h-5 stroke-current"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3h18v4H3z" />
                    <path d="M3 11h18v10H3z" />
                  </svg>
                )}
                {link.label === "Reports" && (
                  <svg
                    className="w-5 h-5 stroke-current"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 3v18h18" />
                    <path d="M18 17V9" />
                    <path d="M13 17V5" />
                    <path d="M8 17v-3" />
                  </svg>
                )}
                {link.label === "Settings" && (
                  <svg
                    className="w-5 h-5 stroke-current"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                )}
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <hr className="border-gray-800 mt-10 mb-10" />

      <div className="ml-4 mb-10">
        <button className="w-full flex items-center gap-3 px-6 py-3 text-xs text-slate-400 hover:bg-sidebarSoft/60">
          {/* Settings Icon (Gear) */}
          <svg
            className="w-4 h-4 stroke-current"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0-.33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0 .33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          Settings
        </button>
        <button
          onClick={() => {
            localStorage.removeItem("adminToken");
            navigate("/admin/login");
          }}
          className="w-full flex items-center gap-3 px-6 py-4 text-xs text-red-400 hover:bg-sidebarSoft/60"
        >
          {/* Log Out Icon (Exit) */}
          <svg
            className="w-4 h-4 stroke-current"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
