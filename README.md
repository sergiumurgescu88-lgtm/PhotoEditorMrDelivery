# MrDelivery AI Photo Editor

Professional AI food photography studio using Flux-2.

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Hono, PM2, Node.js |
| AI | Kie.ai (Flux-2) |

## Architecture
Frontend -> Local Proxy -> Kie.ai API -> Flux-2 Models

## Quick Start
git clone https://github.com/sergiumurgescu88-lgtm/PhotoEditorMrDelivery.git
cd PhotoEditorMrDelivery
bun install
bun run build
pm2 start ecosystem.config.js

## License
Proprietary - MrDelivery AI Agency
