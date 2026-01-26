import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import Images from "../assets/Images.js";
import Explore from "./Explore.jsx";
import useAuth from "../hooks/useAuth.js";
import { Bell, Search, Settings } from "lucide-react";
import requestService from "../services/requestService.js";

const NOTIF_STORAGE_KEY = "revault.notifications";

const readStoredNotifications = () => {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((n) => n && typeof n === "object")
      .map((n) => ({
        message: n.message,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        isRead: Boolean(n.isRead),
        _id: n._id,
        id: n.id,
        type: n.type,
      }));
  } catch {
    return [];
  }
};

const writeStoredNotifications = (list) => {
  try {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
};

const routeForType = (type) => {
  if (type === "business_request") return "/login";
  if (type === "inventory") return "/inventory/my";
  if (type === "request") return "/requests/my";
  if (type === "transaction") return "/transactions";
  return null;
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const [incomingRequestCount, setIncomingRequestCount] = useState(0);

  const [notifOpen, setNotifOpen] = useState(false);
  const popoverRef = useRef(null);
  const [notifications, setNotifications] = useState(() =>
    readStoredNotifications(),
  );
  const [showAllUnread, setShowAllUnread] = useState(false);
  const notifBtnRef = useRef(null);
  const notifMenuRef = useRef(null);
  const [notifPos, setNotifPos] = useState({ top: 0, left: 0 });

  const getId = (n) =>
    n?._id || n?.id || `${n?.createdAt || ""}-${n?.message || ""}`;

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n?.isRead).length,
    [notifications],
  );

  const formatWhen = useMemo(
    () => (value) => {
      if (!value) return "—";
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "—";

      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHr = Math.floor(diffMs / (1000 * 60 * 60));

      const sameDay =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();

      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin} min ago`;
      if (sameDay) return "Today";
      if (diffHr < 48) return "1 day ago";
      return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
    },
    [],
  );

  const sorted = useMemo(() => {
    const copy = Array.isArray(notifications) ? [...notifications] : [];
    copy.sort((a, b) => {
      const ad = new Date(a?.createdAt || 0).getTime();
      const bd = new Date(b?.createdAt || 0).getTime();
      return bd - ad;
    });
    return copy;
  }, [notifications]);

  const visibleNotifications = useMemo(() => {
    const unread = sorted.filter((n) => !n?.isRead);

    const readSorted = sorted
      .filter((n) => n?.isRead)
      .sort((a, b) => {
        const ad = new Date(a?.createdAt || 0).getTime();
        const bd = new Date(b?.createdAt || 0).getTime();
        return bd - ad;
      });

    const unreadAllowed =
      showAllUnread || unread.length <= 10 ? unread : unread.slice(0, 10);
    const allowedUnreadIds = new Set(unreadAllowed.map(getId).filter(Boolean));
    const allowedReadIds = new Set(
      readSorted.slice(0, 3).map(getId).filter(Boolean),
    );

    return sorted.filter((n) => {
      const id = getId(n);
      if (!id) return false;
      if (!n?.isRead) return allowedUnreadIds.has(id);
      return allowedReadIds.has(id);
    });
  }, [sorted, showAllUnread]);

  const showSeeMore = unreadCount > 10 && !showAllUnread;

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
        const since = Date.now() - 7 * 24 * 60 * 60 * 1000;

        const count = list.filter((req) => {
          const raw = req?.createdAt || req?.requestedAt;
          const ts = new Date(raw || 0).getTime();
          if (!Number.isFinite(ts)) return false;
          return ts >= since;
        }).length;

        if (!cancelled) setIncomingRequestCount(count);
      } catch {
        if (!cancelled) setIncomingRequestCount(0);
      }
    };

    loadIncomingRequestCount();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    const handler = (e) => {
      const next = e?.detail?.notification || e?.detail;
      if (!next) return;
      const normalized =
        typeof next === "string"
          ? {
              message: next,
              createdAt: new Date().toISOString(),
              isRead: false,
            }
          : next;
      setNotifications((prev) => {
        const id = getId(normalized);
        if (!id) return [normalized, ...prev];
        if (prev.some((n) => getId(n) === id)) return prev;
        return [normalized, ...prev];
      });
    };

    window.addEventListener("revault:notification", handler);
    return () => {
      window.removeEventListener("revault:notification", handler);
    };
  }, []);

  useEffect(() => {
    writeStoredNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    if (!notifOpen) setShowAllUnread(false);
  }, [notifOpen]);

  const toggleNotifications = async () => {
    setNotifOpen((prev) => {
      const next = !prev;
      if (next) {
        // Mirror admin behavior: refresh notifications when opening.
        setNotifications(readStoredNotifications());
      }
      return next;
    });
    if (!notifOpen) setOpen(false);
  };

  const onClickNotification = async (n) => {
    const id = getId(n);
    if (!id) return;

    setNotifOpen(false);

    // Optimistic UI update (mark read immediately)
    setNotifications((prev) =>
      prev.map((x) =>
        getId(x) === id
          ? { ...x, isRead: true, updatedAt: new Date().toISOString() }
          : x,
      ),
    );

    const to = routeForType(n?.type);
    if (to) navigate(to);
  };

  const onClickUnreadCount = (e) => {
    e?.stopPropagation?.();
    if (!unreadCount) return;

    const now = new Date().toISOString();
    setNotifications((prev) =>
      (Array.isArray(prev) ? prev : []).map((n) =>
        n?.isRead ? n : { ...n, isRead: true, updatedAt: now },
      ),
    );
  };

  const displayName = useMemo(() => {
    if (!token) return "Login";
    const name = user?.name || user?.username || user?.email;
    if (!name) return "User";
    if (typeof name === "string" && name.includes("@"))
      return name.split("@")[0];
    return name;
  }, [token, user]);

  useEffect(() => {
    (function () {
      function bindOnce(el, handler) {
        if (!el || el.dataset.bound === "1") return false;
        el.dataset.bound = "1";
        handler(el);
        return true;
      }

      function setHeaderMode(selectedBtn) {
        const container = selectedBtn?.closest("div");
        if (!container) return;
        const buttons = Array.from(container.querySelectorAll("button"));
        buttons.forEach((b) => {
          const isActive = b === selectedBtn;
          b.classList.toggle("bg-white", isActive);
          b.classList.toggle("shadow-sm", isActive);
          b.classList.toggle("text-black", isActive);
          b.classList.toggle("text-[#979797]", !isActive);
          b.classList.toggle("rounded-full", true);
          b.setAttribute("aria-pressed", isActive ? "true" : "false");
        });
      }

      function bindHeaderToggle() {
        const headerToggle = document
          .querySelector("header div.fixed button")
          ?.closest("div");
        if (!headerToggle) return;
        const buttons = Array.from(headerToggle.querySelectorAll("button"));
        buttons.forEach((b) => {
          bindOnce(b, () => {
            b.addEventListener("click", () => {
              setHeaderMode(b);
            });
          });
        });
        const initial =
          buttons.find((b) => b.classList.contains("bg-white")) || buttons[0];
        if (initial) setHeaderMode(initial);
      }

      bindHeaderToggle();
    })();
  }, []);

  useEffect(() => {
    if (!token && open) setOpen(false);
  }, [token, open]);

  useEffect(() => {
    if (!notifOpen) return;

    const updatePosition = () => {
      const el = notifBtnRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const width = 360;
      const gap = 12;

      const left = Math.max(
        8,
        Math.min(window.innerWidth - width - 8, rect.right - width),
      );
      const top = Math.min(window.innerHeight - 8, rect.bottom + gap);
      setNotifPos({ top, left });
    };

    updatePosition();

    const onPointerDown = (e) => {
      const t = e.target;
      if (notifMenuRef.current && notifMenuRef.current.contains(t)) return;
      if (notifBtnRef.current && notifBtnRef.current.contains(t)) return;
      setNotifOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setNotifOpen(false);
    };

    const onAnyScroll = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", onAnyScroll, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", onAnyScroll, true);
    };
  }, [notifOpen]);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const width = 224;
      const gap = 12;
      const left = Math.max(
        8,
        Math.min(window.innerWidth - width - 8, rect.right - width),
      );
      const top = Math.min(window.innerHeight - 8, rect.bottom + gap);
      setMenuPos({ top, left });
    };

    updatePosition();

    const onPointerDown = (e) => {
      const t = e.target;
      if (menuRef.current && menuRef.current.contains(t)) return;
      if (triggerRef.current && triggerRef.current.contains(t)) return;
      setOpen(false);
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    const onAnyScroll = () => {
      updatePosition();
    };

    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", onAnyScroll, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", onAnyScroll, true);
    };
  }, [open]);

  const onLoginOrUserClick = () => {
    if (!token) {
      navigate("/login");
      return;
    }
    setOpen((v) => !v);
  };

  const showAccessToast = () => {
    try {
      window.dispatchEvent(
        new CustomEvent("revault:toast", {
          detail: { message: "Please log in to access this feature" },
        }),
      );
    } catch {
      // ignore
    }
  };

  const onClickDashboardToggle = (e) => {
    e?.preventDefault?.();
    if (!token) {
      showAccessToast();
      return;
    }
    navigate("/dashboard", { replace: false });
  };

  const onClickWebsiteToggle = (e) => {
    e?.preventDefault?.();
    navigate("/", { replace: false });
  };

  const exploreTitle =
    location.pathname === "/dashboard"
      ? "Dashboard"
      : location.pathname === "/requests/incoming"
        ? "Incoming Requests"
        : location.pathname === "/requests/my"
          ? "My Requests"
          : location.pathname === "/inventory/my"
            ? "My Inventory"
            : location.pathname === "/chats"
              ? "Chats"
              : location.pathname === "/transactions"
                ? "Transactions"
                : location.pathname === "/reports"
                  ? "Reports"
                  : location.pathname === "/inventory/add"
                    ? "Add Inventory"
                    : location.pathname.startsWith("/inventory/update")
                      ? "Edit"
                      : "Explore";

  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          backgroundColor: "#fff",
        }}
      >
        <header className="relative flex items-center justify-between mb-6 max-md:flex-col max-md:items-start max-md:gap-4">
          <div className="flex items-start gap-2">
            <span className="text-4xl font-semibold leading-none">
              {incomingRequestCount}
            </span>
            <div className="h-4 w-px bg-gray-300 mt-1 self-center"></div>
            <div className="leading-tight mt-[1px]">
              <div className="text-sm font-semibold text-black">Requests</div>
              <div className="text-xs text-gray-400">Last 7 days</div>
            </div>
          </div>

          <div className="fixed top-6 left-1/2 -translate-x-1/2 flex bg-gray-100 p-1.5 rounded-full z-20 max-md:static max-md:translate-x-0 max-md:mx-auto">
            <button
              data-router-bound="1"
              onClick={onClickDashboardToggle}
              className="px-6 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-black"
            >
              Dashboard
            </button>
            <button
              data-router-bound="1"
              onClick={onClickWebsiteToggle}
              className="px-6 py-2 text-[#979797] text-sm font-medium"
            >
              Website
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div ref={popoverRef} className="relative z-50">
              <button
                ref={notifBtnRef}
                type="button"
                onClick={toggleNotifications}
                aria-label="Notifications"
                className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
              >
                <Bell size={22} className="opacity-60" />
                {unreadCount > 0 ? (
                  <span className="absolute -top-1 -right-1 min-w-[17px] h-[15px] px-1 rounded-full bg-blue-500 text-black text-[11px] leading-[13px] text-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </button>
            </div>

            {notifOpen
              ? createPortal(
                  <div
                    ref={notifMenuRef}
                    className="w-[360px] max-w-[calc(100vw-32px)] rounded-2xl bg-white/90 border border-black/10 backdrop-blur-xl overflow-hidden"
                    style={{
                      position: "fixed",
                      top: notifPos.top,
                      left: notifPos.left,
                      zIndex: 9999,
                    }}
                  >
                    <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
                      <p className="text-sm font-semibold text-black/100">
                        Notifications
                      </p>
                      <button
                        onClick={onClickUnreadCount}
                        className="text-xs text-black/100"
                      >
                        {unreadCount} unread
                      </button>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-black/100">
                        No notifications yet.
                      </div>
                    ) : (
                      <div className="max-h-[360px] overflow-y-auto no-scrollbar">
                        {visibleNotifications.map((n) => {
                          const id = getId(n);
                          const isUnread = !n?.isRead;
                          return (
                            <button
                              key={id}
                              type="button"
                              onClick={() => onClickNotification(n)}
                              className={`w-full text-left px-4 py-3 border-b border-black/10 last:border-b-0 hover:bg-black/5 ${
                                isUnread ? "bg-black/5" : "bg-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <p
                                  className={`flex-1 text-sm truncate ${
                                    isUnread ? "text-black" : "text-black/70"
                                  }`}
                                >
                                  {n?.message || "Notification"}
                                </p>
                                <p className="text-xs text-black/60 shrink-0">
                                  {formatWhen(n?.createdAt)}
                                </p>
                              </div>
                            </button>
                          );
                        })}

                        {showSeeMore ? (
                          <button
                            type="button"
                            onClick={() => setShowAllUnread(true)}
                            className="w-full text-left px-4 py-3 hover:bg-black/5 text-sm text-black/70"
                          >
                            See more
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>,
                  document.body,
                )
              : null}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 relative">
              <img
                src={Images.Spidi}
                className="w-10 h-10 rounded-full object-cover bg-pink-100"
              />
              <span
                ref={triggerRef}
                className="text-sm font-semibold cursor-pointer"
                onClick={onLoginOrUserClick}
              >
                {displayName}
              </span>
            </div>
          </div>
        </header>
        {<Explore title={exploreTitle} />}
      </div>
    </>
  );
};

export default Header;
