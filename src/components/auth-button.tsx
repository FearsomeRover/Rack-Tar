import Link from "next/link";
import { LogIn, LogOut, User } from "lucide-react";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export async function AuthButton() {
  const session = await auth();

  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
          <User className="h-4 w-4" />
          {session.user.name}
          <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            {session.user.role}
          </span>
        </span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button variant="ghost" size="sm" type="submit">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    );
  }

  return (
    <Button asChild variant="ghost" size="sm">
      <Link href="/login">
        <LogIn className="mr-2 h-4 w-4" />
        Sign in
      </Link>
    </Button>
  );
}
