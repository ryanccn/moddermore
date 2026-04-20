import { getServerSession } from "next-auth";
import { safeParse } from "valibot";
import { authOptions } from "~/lib/authOptions";
import { updateUserProfile } from "~/lib/db/users";
import { UserEditableProfileData } from "~/types/moddermore";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new Response(null, { status: 401 });
  }

  const body = (await request.json()) as unknown;
  const parsedBody = safeParse(UserEditableProfileData, body);

  if (!parsedBody.success) {
    return new Response(null, { status: 400 });
  }

  await updateUserProfile(session.user.id, parsedBody.output);
  return new Response(null, { status: 200 });
}
