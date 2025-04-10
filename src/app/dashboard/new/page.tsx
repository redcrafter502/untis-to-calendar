"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function NewAccessPage() {
  const searchParams = useSearchParams();

  const [pageState, setPageState] = useState(searchParams.get("state"));

  if (pageState === "qrcode") {
    return <main>QR Code</main>;
  }
  if (pageState && ["public", "password", "secret"].includes(pageState)) {
    return <main>hi</main>;
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center gap-4">
      Unknown state: {pageState}
      <Button asChild>
        <Link href="/dashboard">Go to Dashboard</Link>
      </Button>
    </main>
  );
}
