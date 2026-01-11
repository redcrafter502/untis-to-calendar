"use client";

import { UserButton } from "@stackframe/stack";
import { TrashIcon } from "lucide-react";

export function UserButtonWrapper() {
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

function deleteAccount() {
  const confirmDelete = confirm(
    "Are you sure you want to permanently delete your account and all associated data? This action cannot be undone.",
  );
  if (!confirmDelete) return;
  console.log("Delete Account");
}
