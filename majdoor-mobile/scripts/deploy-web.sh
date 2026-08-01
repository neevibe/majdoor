#!/bin/sh
# Deploys the Expo web build of MAJDOOR Mobile to Vercel (majdoor-app.vercel.app).
# Usage: ./scripts/deploy-web.sh
set -e
cd "$(dirname "$0")/.."

rm -rf dist
npx expo export --platform web

# SPA fallback for expo-router client-side routes
cat > dist/vercel.json <<'EOF'
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
EOF

# CRITICAL: Vercel excludes any node_modules path by default, but Expo emits the
# Google Fonts under dist/assets/node_modules/... — without this re-include the
# fonts 404 into index.html and the app never finishes booting.
cat > dist/.vercelignore <<'EOF'
!assets/node_modules
!assets/node_modules/**
EOF

cd dist
npx vercel link --yes --project majdoor-app
npx vercel deploy --prod --yes
