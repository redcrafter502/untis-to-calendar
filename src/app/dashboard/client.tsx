"use client";

import { Clipboard } from "lucide-react";
import { toast } from "sonner"
import { Button } from "@/components/ui/button";

export function UrlCopyButton({ url }: { url: string }) {
  async function copyUrlToClipboard() {
    await navigator.clipboard.writeText(url).catch((error) => {
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
