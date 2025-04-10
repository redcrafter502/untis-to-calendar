import { Button } from "@/components/ui/button";
import { stackServerApp } from "@/stack";
import { redirect } from "next/navigation";

export default function Page() {
  return (
    <div className="w-full p-20 text-center">
      <h1>Hello World</h1>
      <form
        action={async () => {
          "use server";
          await stackServerApp.getUser({ or: "redirect" });
          redirect("/dashboard");
        }}
      >
        <Button type="submit">Get Started</Button>
      </form>
    </div>
  );
}
