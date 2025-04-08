import { QUERIES } from "@/db/queries";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const data = await QUERIES.getAccessById(id);
  console.log(data);
  return new Response(`Hello ${id}!`);
}
