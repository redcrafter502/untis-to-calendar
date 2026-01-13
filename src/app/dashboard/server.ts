"use server";

import { MUTATIONS } from "@/db/queries";
import { stackServerApp } from "@/stack";

export async function deleteAccountAction() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const accesses = (user.serverMetadata?.accesses ?? []) as string[];
  console.log(accesses);
  accesses.map((access) => {
    MUTATIONS.deleteAccess(access);
  });
  user.delete();
}
