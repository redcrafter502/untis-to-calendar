import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <main className="flex h-screen items-center justify-center">
      <Loader2 className="size-12 animate-spin" />
    </main>
  );
}
