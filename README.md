# response-pages

Custom Cloudflare Gateway block pages, served as static assets by a Cloudflare Worker.

Pages read the policy context Gateway appends to the redirect URL
(turn on **Send policy context** in the block page / policy redirect settings).

| Page | Path |
|---|---|
| Card (EN) | `/` |
| Terminal (EN) | `/designs/terminal` |
| Split (EN) | `/designs/split` |
| Hazard (EN) | `/designs/hazard` |
| Clean (CS) | `/designs/cs` |

All files under `public/` are deployed; `public/designs/context.js` is shared by the pages in `designs/`.

## Deploy

Connected to Cloudflare Workers Builds; every push to `main` deploys.
Local preview: `npx wrangler dev`.
