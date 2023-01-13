import { XMLParser } from 'fast-xml-parser';

const getFromMaven = async (url: string): Promise<string> => {
  const parser = new XMLParser();
  const mavenTextResponse = await fetch(url).then((r) => {
    if (!r.ok) throw new Error(`${r.url} ${r.status} ${r.statusText}`);
    return r.text();
  });

  const mavenXML = parser.parse(mavenTextResponse);
  return mavenXML.metadata.versioning.latest;
};

export const getLatestFabric = () =>
  getFromMaven(
    'https://maven.fabricmc.net/net/fabricmc/fabric-loader/maven-metadata.xml'
  );

export const getLatestQuilt = () =>
  getFromMaven(
    'https://maven.quiltmc.org/repository/release/org/quiltmc/quilt-loader/maven-metadata.xml'
  );

export const getLatestForge = () =>
  getFromMaven(
    'https://maven.minecraftforge.net/net/minecraftforge/forge/maven-metadata.xml'
  );
