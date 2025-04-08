import { AccessById, QUERIES } from "@/db/queries";
import { getUntis } from "@/lib/untis";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await QUERIES.getAccessById(id);
  if (data.isErr()) return new Response("Access not found", { status: 404 });
  const untis = getUntis({
    url: data.value.domain,
    school: data.value.school,
    timezone: "Europe/Berlin",
    auth: getAuth(data.value),
  });
  const session = await untis.login();
  if (session.isErr())
    return new Response("Login to Untis failed", { status: 401 });

  console.log(data.value);
  return new Response(`Hello ${id}!`);
}

function getAuth(access: AccessById):
  | {
      type: "public";
      classId: number;
    }
  | {
      type: "password";
      username: string;
      password: string;
    }
  | {
      type: "secret";
      username: string;
      secret: string;
    } {
  switch (access.authType) {
    case "public":
      return { type: "public", classId: access.classId };
    case "password":
      return {
        type: "password",
        username: access.username,
        password: access.password,
      };
    case "secret":
      return {
        type: "secret",
        username: access.username,
        secret: access.secret,
      };
  }
}
