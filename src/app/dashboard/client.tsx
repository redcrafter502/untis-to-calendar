"use client";

import { Clipboard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function UrlCopyButton({ path }: { path: string }) {
  const url = new URL(path, window.location.origin);
  async function copyUrlToClipboard() {
    await navigator.clipboard.writeText(url.href).catch((error) => {
      toast.error("Failed to copy URL to clipboard: " + error);
    });
    toast.success("URL copied to clipboard");
  }

  return (
    <Button variant="ghost" onClick={copyUrlToClipboard}>
      <Clipboard />
    </Button>
  );
}

export function UrlDisplayInput({ path }: { path: string }) {
  const url = new URL(path, window.location.origin);
  return <Input disabled value={url.href} />;
}
