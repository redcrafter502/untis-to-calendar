import { MUTATIONS } from "@/db/queries";
import { stackServerApp } from "@/stack";
import { ok, err, type Result } from "neverthrow";

export async function removeAccess(id: string) {
  const userResult = await removeIdFromUser(id);
  if (userResult.isErr())
    return console.error("Error removing user", userResult.error);

  const dbResult = await removeIdFromUser(id);
  if (dbResult.isErr()) console.error("Error deleting access", dbResult.error);
}

async function removeIdFromUser(uuid: string): Promise<Result<void, string>> {
  const user = await stackServerApp.getUser({ or: "redirect" });
  if (!((user.serverMetadata.accesses ?? []) as string[]).includes(uuid))
    return err("Permission denied");
  await user.update({
    serverMetadata: {
      accesses: ((user.serverMetadata?.accesses ?? []) as string[]).filter(
        (id) => id !== uuid,
      ),
    },
  });
  return ok();
}
