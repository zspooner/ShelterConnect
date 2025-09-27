# ShelterConnect Production Guide

## Prereqs
- Node 20+
- Set environment variables (copy `.env.example` to `.env`):
  - `SESSION_SECRET` (required in production)
  - `OPENAI_API_KEY` (optional; enables AI captions)

## Build
- Install deps: `npm ci`
- Generate client build and bundle server: `npm run build`

## Database
- Local SQLite automatically used via `shelterconnect.db`.
- To reinitialize tables: `npm run migrate` (destroys existing tables).

## Run
- Start production server: `npm start`
- Server listens on `PORT` env (defaults to 5000).

## Security Hardening in this repo
- Helmet with stricter CSP in production (no eval/inline).
- Session cookie: secure, httpOnly, sameSite=strict.
- Requires `SESSION_SECRET` in production.
- Rate limiting on auth, uploads, and public endpoints.
- Input validation and sanitization for forms.
- File upload type/size validation (JPEG/PNG/WebP only).
- `x-powered-by` header disabled.

## Notes
- This repo defaults to in-memory session storage. For multi-instance deployments, use a shared session store.
- Public uploads are served from `/uploads`. In production, CORS is restricted to same-origin.
