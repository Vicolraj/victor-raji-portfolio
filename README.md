# Victor Raji Portfolio

Vite + React + TypeScript portfolio app with a public site and a private admin panel.

## Routes

- `/` with anchor sections `/#work`, `/#tech`, `/#contact`
- `/admin/login`
- `/admin`

## Local development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run lint
```

## Content model

Source content is stored in JSON files:

- `src/content/profile.json`
- `src/content/projects.json`
- `src/content/stack.json`

Types and validation schemas live in `src/types/content.ts`.

## Admin authentication and save flow

The admin area uses serverless handlers in `api/admin`:

- `login.ts` checks password, applies basic rate limiting, and sets an httpOnly signed session cookie.
- `save.ts` verifies session cookie and validates submitted content with zod.
- `logout.ts` clears the session cookie.

Content saves are committed to GitHub with Octokit by updating the JSON files on the `main` branch.

## Required environment variables

Set these in local `.env` and in Vercel project settings:

- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`

### Password hash setup

`ADMIN_PASSWORD_HASH` expects `salt:hash` where hash is scrypt output in base64.

Example with Node:

```bash
node -e "const crypto=require('crypto');const salt=crypto.randomBytes(16).toString('hex');const hash=crypto.scryptSync('your-password', salt, 64).toString('base64');console.log(`${salt}:${hash}`)"
```

### Session secret setup

Use a long random string for `SESSION_SECRET`.

## Vercel deployment notes

- Keep `api/admin/*` deployed as serverless endpoints.
- Store all environment variables in Vercel Project Settings.
- Never expose GitHub token or session secret in client code.

## Git-backed content workflow

1. Log in to `/admin/login`.
2. Edit projects, stack, or profile in `/admin`.
3. Confirm **Commit updates**.
4. The API validates payload and writes updates to `src/content/*.json` on `main`.
