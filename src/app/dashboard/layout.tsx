import { Button } from "@/components/ui/button";
import { UserButtonWrapper } from "./client.layout";
import Link from "next/link";

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
        <UserButtonWrapper />
      </div>
      {children}
    </div>
  );
}
