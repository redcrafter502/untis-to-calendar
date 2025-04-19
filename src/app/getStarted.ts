"use server";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack";

export async function getStarted() {
  await stackServerApp.getUser({ or: "redirect" });
  redirect("/dashboard");
}
