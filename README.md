# MAJDOOR — deploy guide

This is a fully static site: no build step, no dependencies. Every page runs
directly in the browser (`support.js` is the page runtime, `_ds/` is the design
system, `assets/` the brand artwork).

## Pages
- `index.html` → redirects to the landing page
- `Majdoor Landing.dc.html` — marketing site
- `Majdoor Login.dc.html` — sign in
- `Majdoor App.dc.html` — platform (7 views, ⌘K palette)
- `Majdoor Mobile.dc.html` — worker app screens
- `Majdoor Brand.dc.html` — brand guidelines
- `* v2.dc.html` — the dark design direction

## Deploy on Vercel (2 minutes)

1. Create a repo and push this folder:
   ```
   git init && git add -A && git commit -m "Majdoor v1"
   git remote add origin git@github.com:YOUR_ORG/majdoor.git
   git push -u origin main
   ```
2. In Vercel: **Add New → Project → Import** the repo.
   - Framework preset: **Other**
   - Build command: *(leave empty)*
   - Output directory: `.` (root)
3. Deploy. Then **Settings → Domains → add `majdoor.ai`** and point the
   domain's DNS (A record → 76.76.21.21, or CNAME → cname.vercel-dns.com).

Alternatively, no git at all: `npx vercel --prod` from this folder, or drag the
folder into vercel.com/new.

## Notes
- URLs contain spaces (`Majdoor%20App.dc.html`). If you want clean routes
  (`/app`, `/login`), add rewrites in `vercel.json` — see below.
