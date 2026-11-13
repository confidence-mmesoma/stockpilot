import { useState } from "react";
import { createStaff, setUserActive } from "../api/users";
import { useAuth } from "../auth/context";
import { Button } from "../components/Button";
import { ErrorMessage } from "../components/ErrorMessage";
import { Spinner } from "../components/Spinner";
import { StaffForm } from "../components/StaffForm";
import { StaffTable } from "../components/StaffTable";
import { useUsers } from "../hooks/useUsers";
import type { StaffInput, StaffUser } from "../types";

export function StaffPage() {
  const { user } = useAuth();
  const { users, loading, error, reload } = useUsers();
  const [showForm, setShowForm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function handleCreate(input: StaffInput) {
    await createStaff(input);
    setShowForm(false);
    await reload();
  }

  async function handleToggle(target: StaffUser) {
    const next = !target.isActive;
    if (!next) {
      const confirmed = window.confirm(
        `Deactivate ${target.name}? They will be locked out immediately and cannot log in.`,
      );
      if (!confirmed) return;
    }

    setActionError(null);
    setBusyId(target.id);
    try {
      await setUserActive(target.id, next);
      await reload();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not update the account",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Staff</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Add staff</Button>
        )}
      </div>

      {showForm && (
        <StaffForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
        />
      )}

      {actionError && <ErrorMessage message={actionError} />}

      {loading && users.length === 0 ? (
        <Spinner />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : (
        <StaffTable
          users={users}
          currentUserId={user?.id}
          busyId={busyId}
          onToggle={handleToggle}
        />
      )}
    </div>
  );
}
