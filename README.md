# Alembic

Potion crafting in PF2e tends to be bookkeeping. Alembic makes it an experiment: measure ingredients across Arcane, Primal, Occult and Divine, brew a batch, then use the result to get closer to a hidden target.

This is the Casper Studios take-home sandbox. Ingredients are unlimited, every brew costs one downtime day, and all sample ingredients, potions and characters are fictional. The rules are in [Brewing rules.md](Brewing%20rules.md); the delivery requirements are in [SPEC.md](SPEC.md).

Live: https://alembic-six.vercel.app

## The workshop

The workshop starts with Wren Ashby, a level 5 Alchemist, 16 ingredients and a mentor's note for Healing Potion (Minor). The bench accepts up to four ingredient units, including repeats, and shows the four tradition totals as you mix. You can supply a table d20 or let the server roll it.

Brewing resolves on the server, including ingredient and crafter gates, PF2e degrees of success, perfect batches and downtime. Results guide the next attempt with tradition arrows. The codex saves your best formed combination for each potion, shows its off-by, and can replace the bench mix with it using **Add to bench**. The mentor's starting combination is available before your first brew. GM reveal controls can share only the potion's identity or its perfect formula, which takes precedence for **Add to bench** while revealed. Hiding the formula restores your best formed mix or the mentor's starting combination. The brew log keeps the previous attempts. Player responses never include targets, rooms, secondary budgets or required ingredients. The crafter sheet changes Wren's level, Intelligence, Crafting, feat and tools.

Clerk handles sign-in and Neon stores each account's workshop. This sandbox deliberately uses a Clerk development instance, so its development badge, accounts.dev redirect and OAuth branding are expected. There's no guest sign-in.

## Run locally

You'll need Bun and a Neon database. Create `.env.local` in the project root:

```dotenv
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
DATABASE_URL=postgresql://your_neon_connection_string
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up
```

Use the same Clerk application for both keys. Enable GitHub, Google and Discord in Clerk, keep access open, and require only an email address so OAuth sign-up doesn't stop for extra profile fields. Never put the secret key or database URL in a `VITE_` variable.

```bash
bun install
bun run db:push
bun run dev
```

Open **http://localhost:3000**, not `127.0.0.1`, so Clerk's local development flow works. The first signed-in workshop request creates the account's starting state. Database creation is explicit; the Vite build never provisions or seeds a temporary Neon database.

## Tests

```bash
bun test
bunx tsc --noEmit
bun run check
```

The brewing tests cover the worked examples and outcome rules. The player projection test checks that hidden answer-key data doesn't reach player view.

## The 60-second tour

1. Sign in with GitHub, Google or Discord. The workshop opens with Wren, the ingredient shelf and Healing Potion (Minor) already Known.
2. Follow the mentor's note: add **Heartmoss + Marsh Toad Gland**. Set the table d20 to **6** and brew. The totals are **7/26/1/8**, the DC is **15**, and the result is off by **14**. Arcane and Primal are on; Occult and Divine are low.
3. Add **Glowcap** to that mix and brew again with d20 **6**. The totals are **7/26/10/13**, a perfect success that makes **1 + 1d3** potions. The codex marks Healing Potion (Minor) Perfected.
4. Experiment toward the other ten potions. Try **Silverleaf + Ghost Orchid + Moonwell Water** for a blocked brew: Truth Potion is level 6, but Wren is level 5.
5. Switch **Viewing as** to **GM**. The answer key shows every target and perfect recipe. Choose **Potion** for **Invisibility Potion**, then return to Player view. Its codex entry is Known, with its name, rarity, DC and odds, but no target. Choose **Formula** to also share its combination and **Add to bench**, or **Hidden** to remove the GM reveal without erasing brewed or mentor knowledge.

## Deploy to Vercel

Nitro detects Vercel's `VERCEL=1` environment variable and builds `.vercel/output`, including static assets and the serverless function. Outside Vercel, `bun run build` keeps the Node server output used by `bun run start`. Neither output directory belongs in source control.

With the Vercel CLI installed and authenticated, deploy from the project root:

```bash
bash scripts/vercel-deploy.sh
```

The script links the `alembic` project, pipes all five variables from `.env.local` into Vercel's production environment, then runs `vercel deploy --prod`. It doesn't print their values or put secrets in command arguments. Existing production values are replaced. Vercel makes these variables available at build time and runtime; the `VITE_` values must exist during the build because Vite embeds them in the client assets. Keep `.env.local` out of uploads and source control. Push the Neon schema once with `bun run db:push` using the deployment database URL.

Linking also lets the CLI refresh its `VERCEL_OIDC_TOKEN` entry in `.env.local`; that file stays local.

For a local production check, build without `VERCEL` set and load `.env.local` before starting Node:

```bash
bun run build
PORT=3001 node -e 'require("dotenv").config({path:".env.local",override:true,quiet:true});import("./.output/server/index.mjs")'
```

Open **http://localhost:3001**. With those environment variables already exported, `bun run start` runs the same server.

## Licence and content

This is unofficial PF2e homebrew, not a Paizo product or endorsement. The in-app footer carries the ORC / Community Use notice. All campaign-facing sample content in this repository is fictional.
