# CLAUDE.md – LiveKit Egress Layout

## Tech stack

- Framework: React + Vite.
- Target: Headless Chrome inside LiveKit Egress.
- Build output: `dist/` directory, mounted at `/home/egress/layout` on the egress host.

## How to run locally

cd livekit-egress-layout
npm install
npm run dev # local dev server

text

- Local preview is for visual layout and overlay logic only; LiveKit/Egress integration happens on the server side.

## How to build and deploy

cd livekit-egress-layout
npm run build # outputs to dist/

text

- Deployment (current workflow):
  - Build locally.
  - Copy `dist/` contents to the egress host:

scp -r dist/* ubuntu@<egress-ec2-ip>:/home/egress/layout/

text

  - Restart egress container if necessary (`docker compose restart egress` in `livekit/`).

## Role in the system

- Defines how the recording looks:
  - Layout of camera feed(s), overlays, branding, status indicators.
- Loaded by LiveKit Egress via `file:///home/egress/layout/index.html`.

## Conventions and gotchas

- Vite config uses `base: './'` to support file:// URLs.
- Do not assume network access from layout unless explicitly configured.
- Be cautious with dimensions and responsiveness; layout must still work headless at recording resolution.

## How Claude should work in this repo

When assisting in this repo, Claude should:

1. Read `CLAUDE.md`, `vite.config.*`, and key layout components.
2. Propose visual or structural changes as diffs to React components and CSS only.
3. Avoid introducing dependencies that break headless Chrome or file:// assumptions.
4. After changes, provide:
   - Commands to rebuild.
   - Commands to deploy to the egress host.
   - Manual validation steps (“start a test room, trigger egress, verify layout in resulting MP4”).

All changes should be implemented on a feature branch and merged via PR.
