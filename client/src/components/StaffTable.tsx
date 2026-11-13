import type { StaffUser } from "../types";
import { Button } from "./Button";

type Props = {
  users: StaffUser[];
  currentUserId: number | undefined;
  busyId: number | null;
  onToggle: (user: StaffUser) => void;
};

export function StaffTable({ users, currentUserId, busyId, onToggle }: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 font-medium text-slate-800">
                {user.name}
              </td>
              <td className="px-4 py-3 text-slate-600">{user.email}</td>
              <td className="px-4 py-3 text-slate-600">
                {user.role === "ADMIN" ? "Admin" : "Staff"}
              </td>
              <td className="px-4 py-3">
                {user.isActive ? (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    Active
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                {user.id !== currentUserId && (
                  <Button
                    variant={user.isActive ? "danger" : "secondary"}
                    className="px-3 py-1.5"
                    disabled={busyId === user.id}
                    onClick={() => onToggle(user)}
                  >
                    {user.isActive ? "Deactivate" : "Activate"}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
