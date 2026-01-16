import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, Settings } from "lucide-react";
import adminProfileImage from "../assets/spidi.jpg";

const routeForType = (type) => {
  if (type === "business_request") return "/admin/users";
  if (type === "inventory") return "/admin/inventory";
  if (type === "transaction") return "/admin/transactions";
  return "/admin";
};

export default function AdminHeader({
  notifications = [],
  unreadCount = 0,
  onRefreshNotifications,
  onMarkNotificationRead,
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showAllUnread, setShowAllUnread] = useState(false);
  const popoverRef = useRef(null);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

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
    []
  );

  useEffect(() => {
    if (!open) return;

    const onDocMouseDown = (e) => {
      const el = popoverRef.current;
      if (!el) return;
      if (el.contains(e.target)) return;
      setOpen(false);
    };

    const onDocKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) setShowAllUnread(false);
  }, [open]);

  const toggleNotifications = async () => {
    setOpen((prev) => !prev);
    if (!open) {
      try {
        await onRefreshNotifications?.();
      } catch {
        // ignore
      }
    }
  };

  const onClickNotification = async (n) => {
    const id = n?._id || n?.id;
    if (!id) return;

    setOpen(false);
    try {
      await onMarkNotificationRead?.(id);
    } catch {
      // ignore
    }
    navigate(routeForType(n?.type));
  };

  const onClickUnreadCount = async (e) => {
    e?.stopPropagation?.();
    if (!unreadCount) return;

    const unread = (Array.isArray(notifications) ? notifications : []).filter((n) => !n?.isRead);
    const ids = unread.map((n) => n?._id || n?.id).filter(Boolean);
    if (ids.length === 0) return;

    await Promise.allSettled(ids.map((id) => onMarkNotificationRead?.(id)));
  };

  const getId = (n) => n?._id || n?.id;

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

    const unreadAllowed = showAllUnread || unread.length <= 10 ? unread : unread.slice(0, 10);
    const allowedUnreadIds = new Set(unreadAllowed.map(getId).filter(Boolean));

    const allowedReadIds = new Set(readSorted.slice(0, 3).map(getId).filter(Boolean));

    return sorted.filter((n) => {
      const id = getId(n);
      if (!id) return false;
      if (!n?.isRead) return allowedUnreadIds.has(id);
      return allowedReadIds.has(id);
    });
  }, [sorted, showAllUnread]);

  const showSeeMore = unreadCount > 10 && !showAllUnread;

  return (
    <div className="relative z-50 flex justify-between items-start mb-0">
      <div className="flex items-center gap-4">
        <div className="w-[360px] max-w-full h-[44px] rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xl flex items-center px-4 gap-2 text-sm text-white/60">
          <Search size={16} />
          Search
        </div>
        <span className="text-sm font-medium text-white">Today, {dateLabel}</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Settings"
          className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
        >
          <Settings size={18} className="text-white/70" />
        </button>

        <div ref={popoverRef} className="relative z-50">
          <button
            type="button"
            onClick={toggleNotifications}
            aria-label="Notifications"
            className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center"
          >
            <Bell size={18} className="opacity-60" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-white text-black text-[11px] leading-[18px] text-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </button>

          {open ? (
            <div className="absolute right-0 z-50 mt-3 w-[360px] max-w-[calc(100vw-32px)] rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Notifications</p>
                <button onClick={onClickUnreadCount} className="text-xs text-white/60">
                  {unreadCount} unread
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-sm text-white/60">No notifications yet.</div>
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
            </div>
          ) : null}
        </div>

        {/* AdminProfile */}
        <div className="w-11 h-11 rounded-full bg-white/10 overflow-hidden">
          <img
            src={adminProfileImage}
            alt="Admin profile"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
