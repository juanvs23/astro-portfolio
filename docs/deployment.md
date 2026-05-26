# Deployment Guide

## Prerequisites
- Node.js >= 22.12.0
- npm

## Build
```bash
npm install
npm run build
```

## Environment Variables
Copy `.env.example` to `.env` and configure:
- `RESEND_API_KEY`: API key from Resend (https://resend.com/api-keys)
- `FROM_EMAIL`: Verified domain email (e.g., contact@coltmandev.dev)
- `TO_EMAIL`: Destination email for contact form submissions

## Deployment Options

### Vercel (Recommended)
1. Push repository to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Set environment variables:
   - `RESEND_API_KEY` — Resend API key
   - `FROM_EMAIL` — contact@coltmandev.dev
   - `TO_EMAIL` — destination email
4. Deploy — Vercel detects Astro automatically

The project uses `@astrojs/vercel/serverless` adapter — API routes are deployed as serverless functions.

### VPS / Dedicated Server
1. Clone repository
2. Install dependencies: `npm install --production`
3. Build: `npm run build`
4. Set environment variables
5. Serve the `dist/` directory with any static server

### Docker
Create a `Dockerfile`:
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
EXPOSE 4321
CMD ["node", "dist/server/entry.mjs"]
```

### Other Platforms
- **Railway**: Connect GitHub repo, set env vars, deploy
- **Render**: Use Node.js template, set build command `npm run build`
- **Fly.io**: Use `flyctl launch` with Node.js builder

## Health Check
The server responds to:
- `GET /` — Homepage (redirects to `/es/` or `/en/`)
- `GET /es/` — Spanish homepage
- `GET /en/` — English homepage
- `POST /api/contact` — Contact form endpoint
