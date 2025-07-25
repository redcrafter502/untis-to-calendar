import { Button } from "@/components/ui/button";
import { UserButton } from "@stackframe/stack";
import Link from "next/link";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-background sticky top-0 z-40 flex w-full items-center justify-between border-b p-4">
        <div>
          <Button variant="ghost">
            <Link href="/" className="text-xl">
              Untis to Calendar
            </Link>
          </Button>
          <Button variant="ghost">
            <Link href="/dashboard" className="text-lg">
              Dashboard
            </Link>
          </Button>
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <UserButton />
        </Suspense>
      </div>
      {children}
    </div>
  );
}
