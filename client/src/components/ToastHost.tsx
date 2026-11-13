import { useEffect } from "react";
import { useNotifications } from "../realtime/notificationsContext";

export function ToastHost() {
  const { toast, dismissToast } = useNotifications();

  // Hide the pop-up by itself after 6 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismissToast, 6000);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  const isOut = toast.type === "OUT_OF_STOCK";

  return (
    <div
      role="status"
      className={`fixed right-4 top-4 z-30 max-w-sm rounded-lg border p-4 shadow-lg ${
        isOut
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-amber-200 bg-amber-50 text-amber-800"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={dismissToast}
          aria-label="Dismiss"
          className="text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
