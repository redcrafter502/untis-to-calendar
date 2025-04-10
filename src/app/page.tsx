import { Button } from "@/components/ui/button";
import { stackServerApp } from "@/stack";
import { redirect } from "next/navigation";

export default function Page() {
  return (
    <div className="w-full p-20 text-center">
      <h1>Hello World</h1>
      <Button
        onClick={async () => {
          "use server";
          await stackServerApp.getUser({ or: "redirect" });
          redirect("/dashboard");
        }}
      >
        Get Started
      </Button>
    </div>
  );
}
