# [Moddermore](https://moddermore.net/)

[![Powered by Vercel](/.github/vercel.svg)](https://vercel.com/?utm_source=moddermore&utm_campaign=oss)

Share the mods you use with anyone.

## Features

- Sleek user interface
- Unique link for each list
- Search for public lists
- Visibility controls
- Import from
  - Folder of mods
  - [Ferium](https://github.com/gorilla-devs/ferium)
  - MultiMC and [Prism Launcher](https://prismlauncher.org) instances
  - [Modrinth](https://modrinth.com/) pack `.mrpack`
  - Manual (built-in!) search
- Export to
  - Folder of mods
  - Modrinth pack `.mrpack`
  - MultiMC/Prism instance
  - [Packwiz](https://packwiz.infra.link/)

## Stack

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [MongoDB](https://www.mongodb.com/)
- [Modrinth](https://docs.modrinth.com/) & [CurseForge](https://docs.curseforge.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [dprint](https://dprint.dev/) & [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/) & [TypeScript ESLint](https://typescript-eslint.io/)
- [pnpm](https://pnpm.dev/)
- [Plausible](https://plausible.io/)
- and a ton of other open source libraries and services!

Big thanks to all of the contributors to those projects who have made this project possible.

## Development / Contributing

We welcome all contributors to the project! Feel free to open PRs if you see something you can improve.

Run `pnpm install` to install dependencies, and run `pnpm dev` to start the development server.

You will need to register for a few services and set a few environment variables (e.g. via `.env.local`) to start contributing.

We use [MongoDB](https://www.mongodb.com/) as our primary database. We also access the [CurseForge](https://curseforge.com/) and [Modrinth](https://modrinth.com/) APIs, and the CurseForge Core API requires an API key which you can apply for [in this form](https://forms.monday.com/forms/dce5ccb7afda9a1c21dab1a1aa1d84eb). Don't worry - this key is meant to be public!

There are also a few maintenance scripts available:

- `pnpm run utils:minecraftVersions`: updates available Minecraft versions from Mojang

## Stats

![Stats from Repobeats](https://repobeats.axiom.co/api/embed/d9c74f31b0719023c5dd8ab5180e3afd342d6fb5.svg)
