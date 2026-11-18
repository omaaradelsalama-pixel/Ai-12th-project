# Go Fish — Deep Sea Edition

React + Vite frontend with a Vercel serverless API and Supabase PostgreSQL.

## Stack
- React + Vite + TypeScript
- Vercel Functions (Node.js)
- Supabase PostgreSQL
- bcryptjs password hashing
- jose JWT signing and verification
- Zod input validation

## Setup
1. Install Node.js (LTS).
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the values.
4. Run `npm run dev` for the Vite frontend.
5. Run `npx vercel dev` to test the Vercel API routes locally.

Never commit real credentials. The Supabase service-role key and JWT secret must remain server-side.

## Authentication API
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me

Registration creates a `users` row with the default `player` role. Password hashes are never returned. Game and multiplayer API routes are not implemented yet.
