import { useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/context";
import { socket } from "../lib/socket";
import { NotificationProvider } from "../realtime/NotificationProvider";
import { Button } from "./Button";
import { NotificationBell } from "./NotificationBell";
import { ToastHost } from "./ToastHost";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive
      ? "bg-emerald-50 text-emerald-700"
      : "text-slate-600 hover:bg-slate-100"
  }`;

export function Layout() {
  const { user, signOut } = useAuth();

  // Open the live connection while logged in, and close it on logout
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-slate-50">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-emerald-700">StockPilot</h1>
              <nav className="flex gap-1">
                <NavLink to="/" end className={linkClass}>
                  Products
                </NavLink>
                <NavLink to="/sales" className={linkClass}>
                  Sales
                </NavLink>
                {user?.role === "ADMIN" && (
                  <NavLink to="/staff" className={linkClass}>
                    Staff
                  </NavLink>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === "ADMIN" && <NotificationBell />}
              <span className="text-sm text-slate-600">
                {user?.name}{" "}
                <span className="text-slate-400">
                  ({user?.role === "ADMIN" ? "Admin" : "Staff"})
                </span>
              </span>
              <Button variant="secondary" onClick={signOut}>
                Log out
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">
          <Outlet />
        </main>

        <ToastHost />
      </div>
    </NotificationProvider>
  );
}
