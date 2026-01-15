import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import Images from "../assets/Images.js";
import Explore from "./Explore.jsx";
import useAuth from "../hooks/useAuth.js";
import { Bell, Search, Settings } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const [notifOpen, setNotifOpen] = useState(false);
  const popoverRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [showAllUnread, setShowAllUnread] = useState(false);
  const notifBtnRef = useRef(null);
  const notifMenuRef = useRef(null);
  const [notifPos, setNotifPos] = useState({ top: 0, left: 0 });

  const getId = (n) => n?._id || n?.id || `${n?.createdAt || ""}-${n?.message || ""}`;

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n?.isRead).length,
    [notifications]
  );

  const visibleNotifications = useMemo(() => {
    const unread = notifications.filter((n) => !n?.isRead);
    return showAllUnread ? unread : unread.slice(0, 8);
  }, [notifications, showAllUnread]);

  const showSeeMore = useMemo(() => {
    if (showAllUnread) return false;
    const unread = notifications.filter((n) => !n?.isRead);
    return unread.length > visibleNotifications.length;
  }, [notifications, showAllUnread, visibleNotifications.length]);

  const formatWhen = (createdAt) => {
    const t = createdAt ? new Date(createdAt).getTime() : NaN;
    if (!Number.isFinite(t)) return "";
    const diff = Date.now() - t;
    if (diff < 60_000) return "now";
    if (diff < 3_600_000) return `${Math.max(1, Math.floor(diff / 60_000))}m`;
    if (diff < 86_400_000) return `${Math.max(1, Math.floor(diff / 3_600_000))}h`;
    return `${Math.max(1, Math.floor(diff / 86_400_000))}d`;
  };

  useEffect(() => {
    const handler = (e) => {
      const next = e?.detail?.notification || e?.detail;
      if (!next) return;
      const normalized =
        typeof next === "string"
          ? { message: next, createdAt: new Date().toISOString(), isRead: false }
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

  const toggleNotifications = () => {
    setShowAllUnread(false);
    setNotifOpen((v) => !v);
    if (!notifOpen) setOpen(false);
  };

  const onClickNotification = (n) => {
    const id = getId(n);
    setNotifications((prev) =>
      prev.map((x) => (getId(x) === id ? { ...x, isRead: true } : x))
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

      const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width));
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
      setNotifOpen(false);
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
        Math.min(window.innerWidth - width - 8, rect.right - width)
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
      setOpen(false);
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

  return (
    <>
      <div style={{ position: "sticky", top: 0, zIndex: 30, backgroundColor: "#fff" }}>
        <header className="relative flex items-center justify-between mb-6 max-md:flex-col max-md:items-start max-md:gap-4">
          <div className="flex items-start gap-2">
            <span className="text-4xl font-semibold leading-none">37</span>
            <div className="h-4 w-px bg-gray-200 self-center"></div>
            <div className="leading-tight mt-[1px]">
              <div className="text-sm font-semibold text-black">Orders</div>
              <div className="text-xs text-gray-400">Last 7 days</div>
            </div>
          </div>
          <div className="fixed top-6 left-1/2 -translate-x-1/2 flex bg-gray-100 p-1.5 rounded-full z-20 max-md:static max-md:translate-x-0 max-md:mx-auto">
            <button className="px-6 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-black">
              Dashboard
            </button>
            <button className="px-6 py-2 text-[#979797] text-sm font-medium">
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
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[11px] leading-[18px] text-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </button>
            </div>

            {notifOpen
              ? createPortal(
                  <div
                    ref={notifMenuRef}
                    className="w-[360px] max-w-[calc(100vw-32px)] rounded-2xl bg-white-100/50 border border-black/10 backdrop-blur-xl overflow-hidden"
                    style={{ position: "fixed", top: notifPos.top, left: notifPos.left, zIndex: 9999 }}
                  >
                    <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
                      <p className="text-sm font-semibold text-black/100">Notifications</p>
                      <p className="text-xs text-black/100">{unreadCount} unread</p>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-sm text-black/100">No notifications yet.</div>
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
                              className={`w-full text-left px-4 py-3 border-b border-white/10 last:border-b-0 hover:bg-white/5 ${
                                isUnread ? "bg-white/10" : "bg-transparent"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <p className={`flex-1 text-sm truncate ${isUnread ? "text-white" : "text-white/70"}`}>
                                  {n?.message || "Notification"}
                                </p>
                                <p className="text-xs text-white/60 shrink-0">{formatWhen(n?.createdAt)}</p>
                              </div>
                            </button>
                          );
                        })}

                        {showSeeMore ? (
                          <button
                            type="button"
                            onClick={() => setShowAllUnread(true)}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 text-sm text-white/70"
                          >
                            See more
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>,
                  document.body
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
              {token && open
                ? createPortal(
                    <div
                      ref={menuRef}
                      className="w-56 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 flex flex-col"
                      style={{
                        position: "fixed",
                        top: menuPos.top,
                        left: menuPos.left,
                        zIndex: 60,
                      }}
                      onClick={(e) => {
                        const btn = e.target?.closest?.(
                          'button[data-action-toast="Logged out (demo)"]'
                        );
                        if (!btn) return;
                        logout();
                        setOpen(false);
                      }}
                    >
                      <button
                        type="button"
                        data-action-toast="Logged out (demo)"
                        className="mt-auto flex items-center gap-3 px-4 py-3 text-black hover:text-red-500 transition-colors"
                      >
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
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          ></path>
                        </svg>
                        <span className="text-sm font-medium">Log out</span>
                      </button>
                    </div>,
                    document.body
                  )
                : null}
            </div>
          </div>
        </header>
        <Explore />
      </div>
    </>
  );
};

export default Header;
