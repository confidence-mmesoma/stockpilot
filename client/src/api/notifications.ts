import { request } from "./http";
import type { AppNotification } from "../types";

export const getNotifications = () =>
  request<{ unreadCount: number; notifications: AppNotification[] }>(
    "/api/notifications",
  );

export const markNotificationRead = (id: number) =>
  request<AppNotification>(`/api/notifications/${id}/read`, {
    method: "PATCH",
  });

export const markAllNotificationsRead = () =>
  request<{ updated: number }>("/api/notifications/read-all", {
    method: "POST",
  });
