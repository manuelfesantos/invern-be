import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  ErrorState,
  LoadingState,
  toast,
} from "../components/ui";
import { formatDate } from "../lib/format";
import { useAuth } from "../lib/auth/use-auth";

async function fetchUser(id: string) {
  const { data, error } = await api.GET("/private/users/{id}", {
    params: { path: { id } },
  });
  if (error) throw error;
  return data.data;
}

// Surface the backend's guard reasons (e.g. last-admin) verbatim.
function errText(error: unknown, fallback: string): string {
  const e = error as { issues?: string[]; message?: string } | undefined;
  return e?.issues?.[0] ?? e?.message ?? fallback;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-1 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right text-slate-800">{value}</span>
    </div>
  );
}

export function UserDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user: me } = useAuth();
  const [confirm, setConfirm] = useState<null | {
    title: string;
    description: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>(null);

  const { data: user, isLoading, isError, refetch } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["user", id] });
    void qc.invalidateQueries({ queryKey: ["users"] });
  };

  const update = useMutation({
    mutationFn: async (patch: {
      role?: "ADMIN" | "USER";
      isValidated?: boolean;
      disabled?: boolean;
    }) => {
      const { error } = await api.PUT("/private/users/{id}", {
        params: { path: { id } },
        body: patch,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User updated");
      invalidate();
      setConfirm(null);
    },
    onError: (e) => toast.error(errText(e, "Update failed.")),
  });

  const del = useMutation({
    mutationFn: async () => {
      const { error } = await api.DELETE("/private/users/{id}", {
        params: { path: { id } },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("User deleted");
      void qc.invalidateQueries({ queryKey: ["users"] });
      navigate("/users", { replace: true });
    },
    onError: (e) => toast.error(errText(e, "Delete failed.")),
  });

  if (isLoading) return <LoadingState />;
  if (isError || !user) return <ErrorState onRetry={() => void refetch()} />;

  const isSelf = me?.id === user.id;
  const isAdmin = user.role === "ADMIN";
  const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "—";

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <Link to="/users" className="text-sm text-slate-500 hover:underline">
          ← Users
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-slate-900">{user.email}</h1>
          <p className="text-sm text-slate-500">{name}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && <Badge>ADMIN</Badge>}
          {user.isValidated ? (
            <Badge variant="success">Validated</Badge>
          ) : (
            <Badge variant="warning">Not validated</Badge>
          )}
          {user.disabled && <Badge variant="danger">Disabled</Badge>}
        </div>
      </div>

      <Card className="p-4">
        <Field label="Email" value={user.email} />
        <Field label="Name" value={name} />
        <Field label="Role" value={user.role} />
        <Field label="Sign-in" value={user.isOauth ? "Google" : "Password"} />
        <Field
          label="Created"
          value={user.createdAt ? formatDate(user.createdAt) : "—"}
        />
      </Card>

      {isSelf && (
        <p className="rounded bg-amber-50 px-3 py-2 text-xs text-amber-700">
          This is your own account — role, disable, and delete actions can lock
          you out.
        </p>
      )}

      <Card className="space-y-3 p-4">
        <h2 className="text-sm font-semibold text-slate-900">Actions</h2>

        {/* Role */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            Role: <span className="font-medium">{user.role}</span>
            <p className="text-xs text-slate-400">
              Changing role revokes the user's session.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setConfirm({
                title: isAdmin ? "Demote to USER?" : "Promote to ADMIN?",
                description: `This changes ${user.email}'s role and revokes their session.${
                  isAdmin && isSelf ? " You may remove your own admin access." : ""
                }`,
                confirmLabel: isAdmin ? "Make USER" : "Make ADMIN",
                onConfirm: () =>
                  update.mutate({ role: isAdmin ? "USER" : "ADMIN" }),
              })
            }
          >
            {isAdmin ? "Make USER" : "Make ADMIN"}
          </Button>
        </div>

        {/* Validation */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            Email validated: {user.isValidated ? "yes" : "no"}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={update.isPending}
            onClick={() => update.mutate({ isValidated: !user.isValidated })}
          >
            {user.isValidated ? "Mark not validated" : "Mark validated"}
          </Button>
        </div>

        {/* Disable / enable */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-600">
            {user.disabled ? "Account is disabled" : "Account is active"}
            <p className="text-xs text-slate-400">
              Disabling revokes the session and blocks login.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              user.disabled
                ? update.mutate({ disabled: false })
                : setConfirm({
                    title: "Disable account?",
                    description: `${user.email} will be signed out and blocked from logging in.${
                      isSelf ? " This is your own account." : ""
                    }`,
                    confirmLabel: "Disable",
                    onConfirm: () => update.mutate({ disabled: true }),
                  })
            }
          >
            {user.disabled ? "Enable" : "Disable"}
          </Button>
        </div>

        {/* Delete */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="text-sm text-slate-600">
            Delete this account
            <p className="text-xs text-slate-400">
              Prefer disabling — deletion is permanent.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-red-200 text-red-700 hover:bg-red-50"
            onClick={() =>
              setConfirm({
                title: `Delete ${user.email}?`,
                description: `This permanently deletes the account.${
                  isSelf ? " This is your own account." : ""
                } Consider disabling instead. This cannot be undone.`,
                confirmLabel: "Delete",
                onConfirm: () => del.mutate(),
              })
            }
          >
            Delete
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={confirm?.title ?? ""}
        description={confirm?.description ?? ""}
        confirmLabel={confirm?.confirmLabel ?? "Confirm"}
        onConfirm={() => confirm?.onConfirm()}
        isPending={update.isPending || del.isPending}
      />
    </div>
  );
}
