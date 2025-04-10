import { Loader2 } from "lucide-react";

export default function Loading() {
  // Stack uses React Suspense, which will render this page while user data is being fetched.
  // See: https://nextjs.org/docs/app/api-reference/file-conventions/loading
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="size-12 animate-spin" />
    </div>
  );
}
