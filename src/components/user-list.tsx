"use client";

import { useState } from "react";
import { Trash2, Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole, deleteUser } from "@/lib/actions/user-actions";
import { toast } from "sonner";
import type { UserRole } from "@/generated/prisma/client";

interface User {
  id: string;
  authschId: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: Date;
  _count: { auditLogs: number };
}

interface UserListProps {
  users: User[];
}

const roleIcons: Record<UserRole, typeof Shield> = {
  VIEWER: Shield,
  EDITOR: ShieldCheck,
  ADMIN: ShieldAlert,
};

const roleColors: Record<UserRole, string> = {
  VIEWER: "text-zinc-500",
  EDITOR: "text-blue-500",
  ADMIN: "text-amber-500",
};

export function UserList({ users }: UserListProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleRoleChange(userId: string, role: UserRole) {
    setLoading(userId);
    try {
      await updateUserRole(userId, role);
      toast.success("User role updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`Delete user "${user.name || user.email || user.authschId}"? This cannot be undone.`)) {
      return;
    }

    setLoading(user.id);
    try {
      await deleteUser(user.id);
      toast.success("User deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
          <TableHead className="w-20 text-right">Logs</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const RoleIcon = roleIcons[user.role];
          return (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{user.name || "No name"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {user.email || "-"}
              </TableCell>
              <TableCell>
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                  disabled={loading === user.id}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue>
                      <span className="flex items-center gap-2">
                        <RoleIcon className={`h-4 w-4 ${roleColors[user.role]}`} />
                        {user.role}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIEWER">
                      <span className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-zinc-500" />
                        VIEWER
                      </span>
                    </SelectItem>
                    <SelectItem value="EDITOR">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                        EDITOR
                      </span>
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      <span className="flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4 text-amber-500" />
                        ADMIN
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(user)}
                  disabled={loading === user.id}
                  title="Delete user"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {user._count.auditLogs}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
