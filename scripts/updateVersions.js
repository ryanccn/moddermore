import { writeFile } from "node:fs/promises";
import { format } from "prettier";

const res = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest.json");

if (!res.ok) {
  throw new Error("Failed to fetch version manifest!");
}

const data = await res.json();

const releases = data.versions
  .filter((v) => v.type === "release")
  .toSorted((a, b) => new Date(b.releaseTime) - new Date(a.releaseTime))
  .map((v) => v.id);

const snapshots = data.versions
  .filter((v) => v.type === "snapshot")
  .toSorted((a, b) => new Date(b.releaseTime) - new Date(a.releaseTime))
  .map((v) => v.id);

const serialized = await format(JSON.stringify({ releases, snapshots }), { parser: "json" });

await writeFile("./src/lib/minecraftVersions.json", serialized);
