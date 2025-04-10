import { stackServerApp } from "@/stack";

export default async function DashboardPage() {
  await stackServerApp.getUser({ or: "redirect" });
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}
