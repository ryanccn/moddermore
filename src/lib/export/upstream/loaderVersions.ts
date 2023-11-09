import { XMLParser } from "fast-xml-parser";

type MavenMetadata = {
  metadata: {
    groupId: string;
    artifactId: string;
    versioning: {
      release: string;
      latest: string;
      lastUpdated: string;
      versions: { version: string[] };
    };
  };
};

const getFromMaven = async ({ url, gameVersion }: { url: string; gameVersion?: string }): Promise<string> => {
  const parser = new XMLParser();
  const mavenTextResponse = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`${r.url} ${r.status} ${r.statusText}`);
    return r.text();
  });

  const mavenXML = parser.parse(mavenTextResponse) as MavenMetadata;

  if (gameVersion) {
    const matchingVersion = mavenXML.metadata.versioning.versions.version.find((v) =>
      v.startsWith(gameVersion),
    );

    if (matchingVersion) return matchingVersion;
  }

  return mavenXML.metadata.versioning.latest;
};

export const getLatestFabric = () =>
  getFromMaven({
    url: "https://maven.fabricmc.net/net/fabricmc/fabric-loader/maven-metadata.xml",
  });

export const getLatestQuilt = () =>
  getFromMaven({
    url: "https://maven.quiltmc.org/repository/release/org/quiltmc/quilt-loader/maven-metadata.xml",
  });

export const getLatestNeoforge = (gameVersion: string) =>
  getFromMaven({
    url: "https://maven.neoforged.net/net/neoforged/forge/maven-metadata.xml",
    gameVersion,
  });

export const getLatestForge = (gameVersion: string) =>
  getFromMaven({
    url: "https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml",
    gameVersion,
  });
