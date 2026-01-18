
# Usage:
#   PROJECT_NAME=your-pages-project ./deploy-cloudflare.sh
# Requires: npm, npx (wrangler), and Cloudflare login (wrangler login)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="${PROJECT_NAME:-square-news-admin}"

cd "$ROOT_DIR"

if [ ! -f "package.json" ]; then
  echo "Error: package.json not found in $ROOT_DIR"
  exit 1
fi

if [ -f "package-lock.json" ]; then
  # Prefer reproducible installs, but auto-heal when lockfile is out of sync
  # (common after upgrading deps like vue-tsc/typescript).
  if ! npm ci; then
    echo "npm ci failed (lockfile likely out of sync). Falling back to npm install to refresh package-lock.json..."
    npm install
  fi
else
  npm install
fi

npm run build

npx wrangler pages deploy dist --project-name "$PROJECT_NAME"
