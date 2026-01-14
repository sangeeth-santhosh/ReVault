import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const lastNavRef = useRef({ path: "", time: 0 });

  const ACCESS_MESSAGE = "Please log in to access this feature";

  const showAccessToast = () => {
    window.dispatchEvent(
      new CustomEvent("revault:toast", {
        detail: { message: ACCESS_MESSAGE },
      })
    );
  };

  const ACTIVE_CLASS =
    "flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200 transition-all";
  const INACTIVE_CLASS =
    "flex items-center gap-3 px-4 py-3 text-black hover:bg-gray-50 rounded-xl transition-all";

  const isModifiedClick = (e) =>
    e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.button !== 0;

  const normalizePath = (path) => {
    if (!path) return "/";
    return path.startsWith("/") ? path : `/${path}`;
  };

  const isPathActive = (toPath, currentPath) => {
    const to = normalizePath(toPath);
    const current = normalizePath(currentPath);
    if (to === "/") return current === "/";
    if (current === to) return true;
    return current.startsWith(`${to}/`);
  };

  const handleNavClick = (e, toPath, activeNow) => {
    if (!token) {
      e.preventDefault();
      showAccessToast();
      return;
    }
    if (isModifiedClick(e)) return;
    e.preventDefault();

    const nextPath = normalizePath(toPath);
    const now = Date.now();
    if (activeNow) return;
    if (lastNavRef.current.path === nextPath && now - lastNavRef.current.time < 400) return;

    lastNavRef.current = { path: nextPath, time: now };
    navigate(nextPath, { replace: false });
  };

  const handleQuickActionClick = (e, toPath) => {
    if (!token) {
      e.preventDefault();
      showAccessToast();
      return;
    }
    if (isModifiedClick(e)) return;
    e.preventDefault();
    navigate(normalizePath(toPath), { replace: false });
  };

  const navItems = [
    {
      href: "/requests/incoming",
      label: "Incoming requests",
      dataSidebarNav: "Popular Products",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="#000000" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 10V3L4 14h7v7l9-11h-7z"
          ></path>
        </svg>
      ),
    },
    {
      href: "/requests/my",
      label: "My requests",
      dataSidebarNav: "Explore New",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="#000000" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          ></path>
        </svg>
      ),
    },
    {
      href: "/chats",
      label: "Chats",
      dataSidebarNav: "Clothing and Shoes",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="#000000" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          ></path>
        </svg>
      ),
    },
    {
      href: "/transactions",
      label: "Transactions",
      dataSidebarNav: "Gifts and Living - Transactions",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="#000000" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          ></path>
        </svg>
      ),
    },
    {
      href: "/reports",
      label: "Reports",
      dataSidebarNav: "Gifts and Living - Reports",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="#000000" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          ></path>
        </svg>
      ),
    },
  ];

  const quickActions = [
    { message: "Add inventory", label: "Add inventory", href: "/inventory/add" },
    { message: "My inventory", label: "My inventory", href: "/inventory/my" },
  ];

  const lastOrders = [
    {
      img: "https://csspicker.dev/api/image/?q=sneaker+shoes&image_type=photo",
      who: "demo",
    },
    {
      img: "https://csspicker.dev/api/image/?q=jacket+fashion&image_type=photo",
      who: "demo",
    },
  ];

  return (
    <aside className="w-60 border-r border-gray-200 p-6 flex flex-col max-md:w-full max-md:border-r-0 max-md:border-b max-md:p-4">
      <div className="relative mb-12 inline-block">
        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          ReVault
        </span>
        <div className="absolute -bottom-1 left-[42px] w-6 h-[3px] bg-blue-600 rounded-full"></div>
      </div>
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const activeNow = isPathActive(item.href, location.pathname);

          return (
            <a
              key={item.dataSidebarNav}
              href={item.href}
              data-sidebar-nav={item.dataSidebarNav}
              {...(activeNow ? { "aria-current": "page" } : {})}
              className={activeNow ? ACTIVE_CLASS : INACTIVE_CLASS}
              onClick={(e) => handleNavClick(e, item.href, activeNow)}
            >
              {item.svg}
              <span className="text-sm font-medium">{item.label}</span>
            </a>
          );
        })}
        <div className="py-4">
          <div className="h-px bg-gray-200 w-44 mx-auto"></div>
        </div>
        <div>
          <p className="px-4 text-[12px] font-semibold text-gray-500 tracking-widest mb-3">
            Quick actions
          </p>
          {quickActions.map((action) => (
            <button
              key={action.message}
              type="button"
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-gray-50 rounded-xl"
              onClick={(e) => handleQuickActionClick(e, action.href)}
            >
              <span className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="#000000"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 5v14M5 12h14"
                  ></path>
                </svg>
              </span>
              {action.label}
            </button>
          ))}
        </div>
        <div className="py-4">
          <div className="h-px bg-gray-200 w-44 mx-auto"></div>
        </div>
        <div>
          <p className="px-4 text-[12px] font-semibold text-gray-500 tracking-widest mb-3">
            Last orders <span className="text-gray-800">37</span>
          </p>
          <div className="px-4 space-y-3">
            {lastOrders.map((order) => (
              <div key={order.img} className="flex items-center gap-3">
                <img
                  src={order.img}
                  className="w-8 h-8 rounded-lg object-cover bg-gray-100"
                />
                <span className="text-xs text-black">
                  <span className="font-semibold text-gray-800">
                    {order.who}
                  </span>
                  …view order
                </span>
              </div>
            ))}
            <button className="text-xs font-medium text-gray-500 hover:underline">
              See all
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
