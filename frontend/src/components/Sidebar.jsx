import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import requestService from "../services/requestService.js";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const lastNavRef = useRef({ path: "", time: 0 });
  const [incomingRequestCount, setIncomingRequestCount] = useState(0);
  const [totalRequests, setTotalRequests] = useState([]);

  const ACCESS_MESSAGE = "Please log in to access this feature";

  const showAccessToast = () => {
    window.dispatchEvent(
      new CustomEvent("revault:toast", {
        detail: { message: ACCESS_MESSAGE },
      }),
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
    if (
      lastNavRef.current.path === nextPath &&
      now - lastNavRef.current.time < 400
    )
      return;

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

  const lastRequests = (e, toPath) => {
    if (!token) {
      e.preventDefault();
      showAccessToast();
      return;
    }
    if (token) {
      navigate("/requests/incoming", { replace: false });
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadIncomingRequestCount = async () => {
      if (!token) {
        if (!cancelled) setIncomingRequestCount(0);
        return;
      }

      try {
        const res = await requestService.getIncoming();
        const list = Array.isArray(res?.data) ? res.data : [];
        setTotalRequests(list);
        const since = Date.now() - 7 * 24 * 60 * 60 * 1000;

        const count = list.filter((req) => {
          const raw = req?.createdAt || req?.requestedAt;
          const ts = new Date(raw || 0).getTime();
          if (!Number.isFinite(ts)) return false;
          return ts >= since;
        });

        if (!cancelled) {
          setIncomingRequestCount(count.length);
        }
      } catch {
        if (!cancelled) setIncomingRequestCount(0);
      }
    };

    loadIncomingRequestCount();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const navItems = [
    {
      href: "/requests/incoming",
      label: "Requests",
      dataSidebarNav: "Popular Products",
      svg: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="#000000"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 4h16v2a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm0 6h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V10zm4 4h8"
          />
        </svg>
      ),
    },
    {
      href: "/chats",
      label: "Chats",
      dataSidebarNav: "Clothing and Shoes",
      svg: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="#000000"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 01-4-.8l-4 1 1-4A8.96 8.96 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      ),
    },
    {
      href: "/transactions",
      label: "Transactions",
      dataSidebarNav: "Gifts and Living - Transactions",
      svg: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="#000000"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 9V7a5 5 0 00-10 0v2M5 12h14l-1.68 7.39A2 2 0 0115.36 21H8.64a2 2 0 01-1.96-1.61L5 12z"
          />
        </svg>
      ),
    },
    {
      href: "/reports",
      label: "Reports",
      dataSidebarNav: "Gifts and Living - Reports",
      svg: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="#000000"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m4 0v-4a2 2 0 012-2h2a2 2 0 012 2v4"
          />
        </svg>
      ),
    },
  ];

  const quickActions = [
    {
      message: "My inventory",
      label: "My inventory",
      href: "/inventory/my",
    },
    { message: "My requests", label: "My requests", href: "/requests/my" },
  ];

  return (
    <aside className="w-60 border-r border-gray-200 p-6 flex flex-col max-md:w-full max-md:border-r-0 max-md:border-b max-md:p-4">
      {/* <pre>{JSON.stringify(totalRequests, null, 2)}</pre> */}
      <div className="relative mb-12">
        <span className="text-2xl font-semibold tracking-tight text-slate-900">
          ReVault
        </span>
        <div className="absolute -bottom-1 left-[42px] w-6 h-[3px] bg-blue-600 rounded-full"></div>
      </div>
      <nav className="space-y-1.5 flex-1 mt-3">
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
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-black hover:bg-gray-50 rounded-xl focus:outline-none transition-all"
              onClick={(e) => handleQuickActionClick(e, action.href)}
              tabIndex={0}
              aria-label={action.label}
            >
              <span className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="#000000"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
            Last Requests{" "}
            <span className="text-gray-800">{incomingRequestCount}</span>
          </p>
          <div className="px-4 space-y-3">
            {totalRequests.slice(0, 2).map((requests) => (
              <div key={requests._id} className="flex items-center gap-3">
                <img
                  src={
                    requests.inventory?.images?.[0] || "/placeholder-image.png"
                  }
                  className="w-8 h-8 rounded-lg object-cover bg-gray-100"
                  alt={requests.inventory?.title || "Inventory Item"}
                />
                <span className="text-xs text-black flex items-center">
                  <span className="font-semibold text-gray-800 max-w-[90px] inline-block truncate align-bottom">
                    {requests.inventory?.title || "Inventory Item"}
                  </span>
                  <span className="font-semibold text-gray-500 whitespace-nowrap">
                    ...view
                  </span>
                </span>
              </div>
            ))}
            <button
              className="text-xs font-medium text-gray-500 hover:underline focus:outline-none focus:underline"
              onClick={(e) => lastRequests(e)}
            >
              See all
            </button>
          </div>
        </div>
      </nav>
      <button
        type="button"
        className="mt-6 flex items-center gap-2 px-4 py-3 rounded-xl"
        onClick={logout}
      >
        <svg
          className="w-5 h-5 relative top-[1px]"
          fill="none"
          stroke="#ed0000"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>

        <span className="text-sm font-medium leading-none text-red-600">
          Log out
        </span>
      </button>
    </aside>
  );
};

export default Sidebar;
