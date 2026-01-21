import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ScrollText, Package, Box, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isAdmin } from "@/lib/permissions";
import { getAuditLogs } from "@/lib/actions/audit-actions";

const actionLabels: Record<string, { label: string; color: string }> = {
  CREATE_RACK: { label: "Created rack", color: "text-green-600" },
  UPDATE_RACK: { label: "Updated rack", color: "text-blue-600" },
  DELETE_RACK: { label: "Deleted rack", color: "text-red-600" },
  CREATE_ITEM: { label: "Created item", color: "text-green-600" },
  UPDATE_ITEM: { label: "Updated item", color: "text-blue-600" },
  DELETE_ITEM: { label: "Deleted item", color: "text-red-600" },
};

export default async function AuditLogsPage() {
  const userIsAdmin = await isAdmin();

  if (!userIsAdmin) {
    redirect("/");
  }

  const logs = await getAuditLogs();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ScrollText className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No audit logs yet</p>
            <p className="text-sm text-muted-foreground">
              Actions will be logged here as users make changes
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity ({logs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => {
                  const actionInfo = actionLabels[log.action] || {
                    label: log.action,
                    color: "text-zinc-600",
                  };
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {log.user ? (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {log.user.name || log.user.email || "Unknown"}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={actionInfo.color}>
                          {actionInfo.label}
                        </span>
                      </TableCell>
                      <TableCell>
                        {log.rack && (
                          <Link
                            href={`/rack/${log.rack.id}`}
                            className="flex items-center gap-1 hover:underline"
                          >
                            <Package className="h-3 w-3" />
                            {log.rack.name}
                          </Link>
                        )}
                        {log.item && (
                          <span className="flex items-center gap-1">
                            <Box className="h-3 w-3" />
                            {log.item.name}
                          </span>
                        )}
                        {!log.rack && !log.item && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                        {log.details ? JSON.stringify(log.details) : "-"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
