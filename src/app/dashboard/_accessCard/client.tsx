"use client";

import { Clipboard } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

function useUrl(path: string) {
  const [url, setUrl] = useState<URL | null>(null);
  useEffect(() => {
    setUrl(new URL(path, window.location.origin));
  }, [path]);
  return url?.href ?? "";
}

export function UrlCopyButton({ path }: { path: string }) {
  const url = useUrl(path);
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

export function UrlDisplayInput({ path }: { path: string }) {
  const url = useUrl(path);
  return <Input disabled value={url} />;
}

export function DeleteButton() {
  const [inDeleting, setInDeleting] = useState(false);

  if (!inDeleting)
    return (
      <Button onClick={() => setInDeleting(true)} variant="destructive">
        Delete
      </Button>
    );
  return (
    <div className="flex gap-2">
      <Button onClick={() => setInDeleting(false)} variant="ghost">
        Cancel
      </Button>
      <Button type="submit" variant="destructive">
        Confirm
      </Button>
    </div>
  );
}
