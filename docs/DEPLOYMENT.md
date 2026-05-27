# Deployment Guide

## Frontend
Deploy via Vercel from the repository root, but run the app inside `frontend/`:
```bash
npx vercel --prod
```

The repo includes a `vercel.json` that forces Vercel to install and build from `frontend/`, which avoids frozen-lockfile errors at the repository root.

## Backend
Deploy via Docker / AWS ECS / Render.
