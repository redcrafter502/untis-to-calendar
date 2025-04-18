import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { QUERIES } from "@/db/queries";
import { UrlDisplayInput, UrlCopyButton, DeleteButton } from "./client";
import { revalidatePath } from "next/cache";
import { removeAccess } from "./server";

export async function AccessCard({ accessId }: { accessId: string }) {
  const access = await QUERIES.getAccessById(accessId);
  if (access.isErr())
    return <div className="text-red-500">Error: {access.error}</div>;

  const path = `/api/ics/${accessId}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{access.value.name}</CardTitle>
        <CardDescription>
          {access.value.school} ({access.value.domain} - {access.value.timezone}
          )
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p>Auth Type: {access.value.authType}</p>
        <div className="flex w-full gap-4">
          <UrlDisplayInput path={path} />
          <UrlCopyButton path={path} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <form
          action={async () => {
            "use server";
            await removeAccess(accessId);
            revalidatePath("/dashboard");
          }}
        >
          <DeleteButton />
        </form>
      </CardFooter>
    </Card>
  );
}
