#!/bin/bash
set -e
cd "$(dirname "$0")/.."

echo "=== Building ==="
npm run build

echo ""
echo "=== Checking dist ==="
ls -la dist/
ls -la dist/assets/

echo ""
echo "=== Deploying to Vercel ==="
# Remove old .vercel link if broken
if [ -f .vercel/project.json ]; then
  echo "Existing project link found: $(cat .vercel/project.json)"
fi

# Deploy pre-built dist folder directly (bypasses Vercel build)
npx vercel deploy dist --prod --yes

echo ""
echo "=== Done ==="
echo "If you see a 404 error from the CLI, run: vercel login"
echo "If the deployed URL shows 404, the deployment output above will have the correct URL."
