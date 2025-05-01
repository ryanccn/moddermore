import { writeFile } from "node:fs/promises";
import { format } from "prettier";

const res = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest.json");

if (!res.ok) {
  throw new Error("Failed to fetch version manifest!");
}

const data = await res.json();

const collator = Intl.Collator("en", { numeric: true });
const versions = data.versions
  .filter((v) => v.type === "release")
  .map((v) => v.id)
  .sort((a, b) => collator.compare(b, a));

const serialized = await format(JSON.stringify(versions), { parser: "json" });

await writeFile("./src/lib/minecraftVersions.json", serialized);
