#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

names=(VITE_CLERK_PUBLISHABLE_KEY CLERK_SECRET_KEY DATABASE_URL VITE_CLERK_SIGN_IN_URL VITE_CLERK_SIGN_UP_URL)
node --input-type=module - "${names[@]}" <<'NODE'
import dotenv from "dotenv";

const { parsed, error } = dotenv.config({ path: ".env.local", quiet: true });
const missing = process.argv.slice(2).filter((name) => !parsed?.[name]);
if (error || missing.length) {
	console.error(`Check .env.local; missing required values: ${missing.join(", ")}`);
	process.exit(1);
}
NODE

vercel link --yes --project alembic

for name in "${names[@]}"; do
	node --input-type=module - "$name" <<'NODE' | vercel env add "$name" --environment production --force --yes
import dotenv from "dotenv";

const { parsed, error } = dotenv.config({ path: ".env.local", quiet: true });
const name = process.argv[2];
if (error || !parsed?.[name]) {
	console.error(`Missing ${name} in .env.local`);
	process.exit(1);
}
process.stdout.write(parsed[name]);
NODE
done

vercel deploy --prod
