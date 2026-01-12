"use server";

import { stackServerApp } from "@/stack";

export async function deleteAccountServerFunction() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const accesses = (user.serverMetadata?.accesses ?? []) as string[];
  console.log(accesses);
}
