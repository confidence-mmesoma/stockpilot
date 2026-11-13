import { createContext, useContext } from "react";
import type { AppNotification } from "../types";

export type NotificationState = {
  notifications: AppNotification[];
  unreadCount: number;
  toast: AppNotification | null;
  dismissToast: () => void;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
};

export const NotificationContext = createContext<NotificationState | null>(
  null,
);

export function useNotifications() {
  const value = useContext(NotificationContext);
  if (!value)
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  return value;
}
