"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function NewAccessPage() {
  const searchParams = useSearchParams();

  const [pageState, setPageState] = useState(searchParams.get("state"));

  return (
    <main>
      New {pageState} <button onClick={() => setPageState("page")}>hi</button>
    </main>
  );
}
