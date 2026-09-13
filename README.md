# FiveGuysRMWC — After Hours: Know Your Rights

A cinematic, bilingual choice-based game about migrant workers in south-west Sydney, built with React, TypeScript, Vite and Tailwind. Vietnamese is the default; language can change during play. The presentation uses original generated photographic stills, rain and gentle camera movement. These are illustrative fictional scenes, not filmed full-motion video.

## Run locally

Use Node.js 24 LTS, then:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173). Create a production bundle with `npm run build`; use `npm run preview` to inspect it. The built files in `dist/` can be hosted as a static site.

This workspace also contains a portable Node installation, ignored by Git. In PowerShell:

```powershell
$env:PATH = (Join-Path (Get-Location) '.tools\node-v24.21.0-win-x64') + ';' + $env:PATH
npm.cmd run dev
```

## What is included

- Cinematic scenes and branching conversations for seven residents, with consequences for how you respond, content-warning skips and a quiet transition into your own story.
- A distinct image for every dialogue beat and both endings across all seven residents: 85 story images, with smooth transitions and preloading of the next choices. See the [scene artwork and prompts](docs/conversation-artwork.md).
- Vietnamese/English copy, keyboard controls, optional ambient rain and browser speech playback where a suitable device voice exists.
- A minimal cinematic title menu with original cast artwork, working Continue and settings, seven distinct local character portraits, and complete bilingual character descriptions.
- A live AEST clock (UTC+10 year-round), updated every second. English uses a 12-hour clock and Vietnamese uses 24-hour time; the fictional scenes keep their night-time setting.
- A shared in-memory `CaseFile`, optional guided intake, editable summary, evidence and safe-contact details.
- Persistent quick exit and essential contact links. Quick exit replaces the current page; a website cannot erase earlier browser history, network records or downloaded files.
- Supabase schema and a consent-validating submission function, supplied as a backend scaffold. No live database, real staff accounts or caseworker notifications are connected.

The guided intake follows local, deterministic questions and matching rules. It is not a connected generative AI service and does not assess eligibility or provide legal advice. Before submission, draft content stays in browser memory. Downloading or sharing a summary is an explicit user action that can create a separate copy.

The default handoff uses [RMWC's existing legal-help page](https://migrants.org.au/legal-help). Opening that page does not send the draft or prefill their form. RMWC can decide whether to use its existing enquiry process or adopt the optional backend.

## Validation

```sh
npm run build
npm test
```

If the Windows sandbox blocks test child processes, use:

```powershell
node --test --test-isolation=none tests/*.test.mjs
```

Backend tests exercise consent rejection, skipped personal fields, forged metadata, contact-safety preservation, request size, CORS rejection and the private RPC boundary using a mocked database transport. The SQL migration and function still require testing against an approved Supabase project before use with real information.

The browser suite (`npx playwright test`) uses installed Microsoft Edge on Windows and checks desktop/mobile layout, language state, story completion, return visits, content skips, quick exit, safe contact, local downloads and crisis interruption. Adjust the executable path in `playwright.config.mjs` on another system. Run the Vite server before browser tests.

For the Docker preview or a local Vite server running on port 3000, set `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000` before running Playwright. The conversation-image tests also check all seven stories, slow image responses and offline fallbacks.

See [production integration notes](docs/production.md) for deployment boundaries, [source references](docs/legal-sources.md) for the official resources used, [current artwork and prompts](docs/artwork-refresh.md), and [original artwork notes](docs/artwork.md). Inter is bundled locally; no external font requests are made. [Git in VS Code](docs/vscode-git.md) explains how to open and sync this repository.
