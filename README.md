# Barrackpore Sangathan (demo)

Mobile-first React app to show and manage the district organisation hierarchy.

**Demo only:** all names are fake, data is stored in the browser (localStorage), emails are shown in a demo mailbox, and chat is not encrypted.

## Run

```bash
npm install
npm run dev
```

## Demo logins

| Account | Email | Password |
|---|---|---|
| Super Admin | admin@barrackpore.app | Admin@123 |
| Any seeded member | see login page | Demo@123 |

## Rules

- Only Admin appoints the 3 leaders (President, General Secretary, IT In-charge) of each committee.
- The 3 leaders add the other members of their own committee by email, set ranking and create events.
- A person can edit their own name and a few details, but not their post or email.
- New people set their password from the email link ("Forgot / set password").

## Code map

| Path | What |
|---|---|
| `src/data/config.ts` | Posts, leader posts, assemblies, morchas |
| `src/data/seed.ts` | Fake demo data |
| `src/data/store.tsx` | Data store, login, permission rules |
| `src/pages/` | Screens |
| `src/components/` | Shared UI parts |

## Deploy

Every push to `main` on GitHub (`DevnetraConsultancy/bkporg`) is built and published by Vercel (project `bjp-bkporg`).

Live: https://bjp-bkporg.vercel.app

## Theme

Light, Dark or follow the phone. Switch with the sun/moon button or on the **Me** page.
