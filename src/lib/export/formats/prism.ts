import { getDownloadURLs } from "../upstream/download";
import {
  getLatestFabric,
  getLatestForge,
  getLatestNeoforge,
  getLatestQuilt,
} from "../upstream/loaderVersions";
import { ExportStatus, exportZip, type PageStateHooks } from "./shared";

import { saveAs } from "file-saver";
import JSZip from "jszip";

import type { RichModList } from "~/types/moddermore";

export const prismAutoUpdateExport = async ({
  data,
  setProgress,
  setStatus,
}: { data: RichModList } & PageStateHooks) => {
  setProgress({ value: 0, max: 2 });
  setStatus(ExportStatus.GeneratingZip);

  const zipfile = new JSZip();

  const packwizURL = new URL(`/list/${data.id}/packwiz/pack.toml`, location.href).toString();

  zipfile.file(
    "instance.cfg",
    `
InstanceType=OneSix
OverrideCommands=true
PreLaunchCommand="$INST_JAVA" -jar packwiz-installer-bootstrap.jar ${packwizURL}
name=${data.title}
`.trim(),
  );

  const meta = await fetch(`https://meta.prismlauncher.org/v1/net.minecraft/${data.gameVersion}.json`);
  if (!meta.ok) {
    throw new Error("failed to fetch meta for minecraft");
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const parsed = await meta.json();

  const mmcPack = {
    components: [
      {
        dependencyOnly: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        uid: parsed.requires[0].uid,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        version: parsed.requires[0].suggests,
      },
      {
        uid: "net.minecraft",
        version: data.gameVersion,
      },
    ],
    formatVersion: 1,
  };

  if (data.modloader == "fabric" || data.modloader == "quilt") {
    mmcPack.components.push({
      dependencyOnly: true,
      uid: "net.fabricmc.intermediary",
      version: data.gameVersion,
    });
  }

  switch (data.modloader) {
    case "fabric": {
      mmcPack.components.push({
        uid: "net.fabricmc.fabric-loader",
        version: await getLatestFabric(),
      });
      break;
    }

    case "forge": {
      mmcPack.components.push({
        uid: "net.minecraftforge",
        version: await getLatestForge(data.gameVersion),
      });
      break;
    }

    case "neoforge": {
      mmcPack.components.push({
        uid: "net.neoforged",
        version: await getLatestNeoforge(data.gameVersion),
      });
      break;
    }

    case "quilt": {
      mmcPack.components.push({
        uid: "org.quiltmc.quilt-loader",
        version: await getLatestQuilt(),
      });
      break;
    }
  }

  zipfile.file("mmc-pack.json", JSON.stringify(mmcPack));
  setProgress({ value: 1, max: 2 });

  const dotMinecraftFolder = zipfile.folder(".minecraft");

  if (!dotMinecraftFolder) {
    throw new Error("failed to create .minecraft folder in zipfile?");
  }

  const packwizInstallerBootstrapJar = await fetch("/packwiz-installer-bootstrap.jar");
  if (!packwizInstallerBootstrapJar.ok) {
    throw new Error("Failed to download packwiz-installer-bootstrap.jar");
  }

  dotMinecraftFolder.file("packwiz-installer-bootstrap.jar", packwizInstallerBootstrapJar.blob());
  setProgress({ value: 2, max: 2 });

  const zipBlob = await zipfile.generateAsync({ type: "blob" });
  saveAs(zipBlob, `${data.title}.zip`);

  setStatus(ExportStatus.Idle);
};

export const prismStaticExport = async ({
  data,
  setProgress,
  setResult,
  setStatus,
}: { data: RichModList } & PageStateHooks) => {
  setProgress({ value: 0, max: data.mods.length });
  setStatus(ExportStatus.Resolving);
  const urls = await getDownloadURLs(data, setProgress);

  setProgress({ value: 0, max: data.mods.length });
  setResult({ success: [], failed: [] });
  setStatus(ExportStatus.Downloading);

  const zipfile = new JSZip();
  const dotMinecraftFolder = zipfile.folder(".minecraft");

  if (!dotMinecraftFolder) {
    throw new Error("failed to create .minecraft folder in zipfile?");
  }

  zipfile.file("instance.cfg", `name=${data.title}`);

  await Promise.all([
    exportZip({
      zipfile: dotMinecraftFolder,
      urls,
      setProgress,
      setResult,
      setStatus,
    }),

    (async () => {
      const meta = await fetch(`https://meta.prismlauncher.org/v1/net.minecraft/${data.gameVersion}.json`);
      if (!meta.ok) {
        throw new Error("failed to fetch meta for minecraft");
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const parsed = await meta.json();
      const mmcPack = {
        components: [
          {
            dependencyOnly: true,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            uid: parsed.requires[0].uid,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            version: parsed.requires[0].suggests,
          },
          {
            uid: "net.minecraft",
            version: data.gameVersion,
          },
        ],
        formatVersion: 1,
      };
      if (data.modloader == "fabric" || data.modloader == "quilt") {
        mmcPack.components.push({
          dependencyOnly: true,
          uid: "net.fabricmc.intermediary",
          version: data.gameVersion,
        });
      }
      switch (data.modloader) {
        case "fabric": {
          mmcPack.components.push({
            uid: "net.fabricmc.fabric-loader",
            version: await getLatestFabric(),
          });
          break;
        }
        case "forge": {
          mmcPack.components.push({
            uid: "net.minecraftforge",
            version: await getLatestForge(data.gameVersion),
          });
          break;
        }
        case "quilt": {
          mmcPack.components.push({
            uid: "org.quiltmc.quilt-loader",
            version: await getLatestQuilt(),
          });
          break;
        }
      }
      zipfile.file("mmc-pack.json", JSON.stringify(mmcPack));
    })(),
  ]);

  const zipBlob = await zipfile.generateAsync({ type: "blob" });
  saveAs(zipBlob, `${data.title}.zip`);

  setStatus(ExportStatus.Result);
};
