import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Sign in to Racktar</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server";
              await signIn("authsch", { redirectTo: "/" });
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              Sign in with AuthSCH
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Sign in to add or edit items. You can browse without signing in.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
