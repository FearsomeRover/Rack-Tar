import Link from "next/link";
import { Package, Settings } from "lucide-react";
import { HeaderNav } from "./header-nav";
import { AuthButton } from "./auth-button";
import { isAdmin } from "@/lib/permissions";
import { Button } from "./ui/button";

export async function Header() {
  const userIsAdmin = await isAdmin();

  return (
    <header className="sticky top-0 z-50 border-b bg-white dark:bg-zinc-900">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span>Racktar</span>
        </Link>
        <div className="flex items-center gap-4">
          <HeaderNav />
          {userIsAdmin && (
            <Button asChild variant="ghost" size="sm" className="hidden sm:flex">
              <Link href="/admin/users">
                <Settings className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </Button>
          )}
          <div className="hidden border-l pl-4 md:block">
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  );
}
