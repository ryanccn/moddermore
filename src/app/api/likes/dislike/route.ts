import { getServerSession } from "next-auth";
import { authOptions } from "~/lib/authOptions";
import { dislike } from "~/lib/db/users";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(null, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return new Response(null, { status: 400 });
  }

  const ok = await dislike(session.user.id, id);
  return new Response(null, { status: ok ? 201 : 500 });
}
