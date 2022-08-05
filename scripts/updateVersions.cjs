const { format } = require('prettier');
const { writeFile } = require('fs/promises');

(async () => {
  const res = await fetch(
    'https://launchermeta.mojang.com/mc/game/version_manifest.json'
  );

  if (!res.ok) {
    console.error('Failed to fetch version manifest!');
    process.exit(1);
  }

  const data = await res.json();

  const versions = data.versions
    .filter((v) => v.type === 'release')
    .map((v) => v.id);

  await writeFile(
    './lib/minecraftVersions.json',
    format(JSON.stringify(versions), { parser: 'json' })
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
