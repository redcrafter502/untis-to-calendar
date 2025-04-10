import { UserButton } from "@stackframe/stack";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <UserButton />
      </Suspense>
      {children}
    </div>
  );
}
