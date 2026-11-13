import { useState } from "react";
import { formatDateTime } from "../lib/format";
import { useNotifications } from "../realtime/notificationsContext";

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(action: () => Promise<void>) {
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Notifications"
        className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-medium text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">Alerts</p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => run(markAllRead)}
                className="text-sm text-emerald-700 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          {error && <p className="px-4 py-2 text-sm text-red-600">{error}</p>}

          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">
              No alerts yet.
            </p>
          ) : (
            <ul className="max-h-96 divide-y divide-slate-100 overflow-y-auto">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <button
                    type="button"
                    disabled={notification.isRead}
                    onClick={() => run(() => markRead(notification.id))}
                    className={`block w-full px-4 py-3 text-left text-sm ${
                      notification.isRead
                        ? "text-slate-500"
                        : "bg-amber-50 font-medium text-slate-800 hover:bg-amber-100"
                    }`}
                  >
                    <span
                      className={`mr-2 inline-block rounded-full px-2 py-0.5 text-xs ${
                        notification.type === "OUT_OF_STOCK"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {notification.type === "OUT_OF_STOCK"
                        ? "Out of stock"
                        : "Low stock"}
                    </span>
                    {notification.message}
                    <span className="mt-1 block text-xs font-normal text-slate-400">
                      {formatDateTime(notification.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
