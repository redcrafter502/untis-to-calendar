"use client";

import { UserButton } from "@stackframe/stack";
import { TrashIcon } from "lucide-react";
import { deleteAccountAction } from "./server";
import { useRouter } from "next/navigation";

export function UserButtonWrapper() {
  const router = useRouter();

  function deleteAccount() {
    const confirmDelete = confirm(
      "Are you sure you want to permanently delete your account and all associated data? This action cannot be undone.",
    );
    if (!confirmDelete) return;
    deleteAccountAction();
    router.push("/");
  }

  return (
    <UserButton
      extraItems={[
        {
          text: "Delete Account",
          icon: <TrashIcon size={16} />,
          onClick: deleteAccount,
        },
      ]}
    />
  );
}
