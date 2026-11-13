import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../api/notifications";
import { useAuth } from "../auth/context";
import { socket } from "../lib/socket";
import type { AppNotification } from "../types";
import { NotificationContext } from "./notificationsContext";

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState<AppNotification | null>(null);

  // Only admins get alerts: load the saved list, then listen for new ones
  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;

    const load = () => {
      getNotifications()
        .then((data) => {
          if (cancelled) return;
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        })
        .catch(() => undefined);
    };

    const onNew = (notification: AppNotification) => {
      setNotifications((current) => [notification, ...current].slice(0, 50));
      setUnreadCount((count) => count + 1);
      setToast(notification);
    };

    load();
    socket.on("notification:new", onNew);
    // After a dropped connection comes back, reload so no alert is missed
    socket.io.on("reconnect", load);

    return () => {
      cancelled = true;
      socket.off("notification:new", onNew);
      socket.io.off("reconnect", load);
    };
  }, [isAdmin]);

  const dismissToast = useCallback(() => setToast(null), []);

  const markRead = useCallback(async (id: number) => {
    await markNotificationRead(id);
    setNotifications((current) =>
      current.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((current) => current.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      toast,
      dismissToast,
      markRead,
      markAllRead,
    }),
    [notifications, unreadCount, toast, dismissToast, markRead, markAllRead],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
