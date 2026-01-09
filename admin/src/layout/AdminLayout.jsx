import { useCallback, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";
import apiClient from "../services/apiClient.js";

export default function AdminLayout() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await apiClient.get("/admin/notifications?limit=100");
      setNotifications(Array.isArray(res?.data) ? res.data : []);
      setUnreadCount(Number.isFinite(res?.unreadCount) ? res.unreadCount : 0);
    } catch {
      // Keep admin UI stable if notifications fail.
    }
  }, []);

  const markNotificationRead = useCallback(async (id) => {
    if (!id) return;

    // Optimistic UI update (mark read immediately)
    setNotifications((prev) => {
      const wasUnread = prev.find((n) => (n?._id || n?.id) === id && !n?.isRead);
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.map((n) => {
        const nid = n?._id || n?.id;
        if (nid !== id) return n;
        return { ...n, isRead: true, updatedAt: new Date().toISOString() };
      });
    });

    try {
      const res = await apiClient.put(`/admin/notifications/${id}/read`);
      if (Number.isFinite(res?.unreadCount)) setUnreadCount(res.unreadCount);
      const updated = res?.data;
      if (updated) {
        setNotifications((prev) =>
          prev.map((n) => {
            const nid = n?._id || n?.id;
            const uid = updated?._id || updated?.id;
            return nid === uid ? { ...n, ...updated } : n;
          })
        );
      }
    } catch {
      // If backend update fails, refresh to re-sync.
      loadNotifications();
    }
  }, [loadNotifications]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <div className="h-screen w-screen bg-[#03020a] text-white flex overflow-x-hidden">
      <AdminSidebar />

      <main className="flex-1 p-8 flex flex-col gap-6 overflow-hidden">
        <AdminHeader
          notifications={notifications}
          unreadCount={unreadCount}
          onRefreshNotifications={loadNotifications}
          onMarkNotificationRead={markNotificationRead}
        />

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
