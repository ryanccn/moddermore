import { type JsonMap, stringify } from "@iarna/toml";
import { getSpecificList } from "~/lib/db";
import { getCurseForgeTOML, getIndexTOML, getModrinthTOML, getPackTOML } from "~/lib/export/formats/packwiz";

const tomlResponse = (body: string) =>
  new Response(body, {
    headers: {
      "content-type": "application/toml; charset=utf-8",
      "cache-control": "s-maxage=3600",
    },
  });

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; path: string[] }> },
) {
  const { id, path } = await params;

  const list = await getSpecificList(id);

  if (!list || list.visibility === "private" || list.ownerProfile.banned) {
    return new Response(null, { status: 404 });
  }

  // /api/packwiz/list/:id/pack.toml
  if (path.length === 1 && path[0] === "pack.toml") {
    const toml = await getPackTOML(id);
    if (!toml) return new Response(null, { status: 404 });
    return tomlResponse(toml);
  }

  // /api/packwiz/list/:id/index.toml
  if (path.length === 1 && path[0] === "index.toml") {
    const toml = await getIndexTOML(id);
    if (!toml) return new Response(null, { status: 404 });
    return tomlResponse(toml);
  }

  // /api/packwiz/list/:id/mods/:modId.pw.toml
  if (
    path.length === 2 &&
    path[0] === "mods" &&
    (path[1].startsWith("modrinth-") || path[1].startsWith("curseforge-")) &&
    path[1].endsWith(".pw.toml")
  ) {
    const modId = path[1].replace(".pw.toml", "");
    const [provider, rawId] = modId.split("-");

    let data = null;

    if (provider === "modrinth") {
      data = await getModrinthTOML({
        id: rawId,
        gameVersions: [list.gameVersion],
        loader: list.modloader,
        name: "",
        version: list.mods.find((m) => m.id === rawId)?.version ?? undefined,
      });
    } else if (provider === "curseforge") {
      data = await getCurseForgeTOML({
        id: rawId,
        gameVersions: [list.gameVersion],
        loader: list.modloader,
        name: "",
        version: list.mods.find((m) => m.id === rawId)?.version ?? undefined,
      });
    }

    if (!data) {
      return new Response(null, { status: 404 });
    }

    return tomlResponse(stringify(data as unknown as JsonMap));
  }

  return new Response(null, { status: 400 });
}
