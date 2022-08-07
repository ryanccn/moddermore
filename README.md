# Moddermore

[![Powered by Vercel](/.github/vercel.svg)](https://vercel.com/?utm_source=moddermore&utm_campaign=oss)

Share the mods you use with anyone.

## Features

- Sleek user interface
- Unique link for each list
- Import from
  - Folder of mods
  - [Ferium](https://github.com/gorilla-devs/ferium)
  - MultiMC and [PolyMC](https://polymc.org) instances
  - Manual (built-in!) search
- Export to
  - Folder of mods
  - Modrinth modpack `.mrpack`

## Stack

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Heroicons](https://github.com/tailwindlabs/heroicons)
- [Supabase](https://supabase.com/)
- [CurseForge Core](https://docs.curseforge.com/)
- [Modrinth API](https://docs.modrinth.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)
- [Yarn](https://classic.yarnpkg.com/lang/en/)
- [Plausible](https://plausible.io/)
- and a ton of other open source libraries and services!

Big thanks to all of the contributors to those projects who have made this project possible 🤓

## Development / Contributing

We welcome all contributors to the project! Feel free to open PRs if you see something you can improve 😁

Run `yarn install` to install dependencies, and run `yarn dev` to start the development server.

You will need to register for a few services and set a few environment variables (e.g. via `.env.local`) to start contributing.

We use [Supabase](https://supabase.com/) as our primary database. We also access the [CurseForge](https://curseforge.com/) and [Modrinth](https://modrinth.com/) APIs, and the CurseForge Core API requires an API key which you can apply for [in this form](https://forms.monday.com/forms/dce5ccb7afda9a1c21dab1a1aa1d84eb). Don't worry - this key is meant to be public!

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVER_KEY=""

# CurseForge
NEXT_PUBLIC_CURSEFORGE_API_KEY=""
```

There are also a few maintenance scripts available:

- `yarn utils:supabase`: updates the TypeScript database schema from Supabase (change this command if you want your own database's schema)
- `yarn utils:minecraftVersions`: updates available Minecraft versions from Mojang

## Stats

![Stats from Repobeats](https://repobeats.axiom.co/api/embed/d9c74f31b0719023c5dd8ab5180e3afd342d6fb5.svg)
