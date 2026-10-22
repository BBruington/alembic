# Alembic

Live: https://alembic-six.vercel.app

I'm moving my PF2e colony campaign over from 5e, and crafting potions in PF2e is mostly bookkeeping: pick a formula, roll a check, done. I wanted it to feel like actually brewing. In Alembic every ingredient carries four values, one per magical tradition (Arcane, Primal, Occult, Divine), and every potion has a hidden target mix. You measure ingredients into the bench, brew, and the result tells you which traditions were low or high so you can get closer next time. PF2e's rarity, level, feat and Crafting check rules still apply on top of that.

This is a public sandbox version for the Casper Studios take-home. Ingredients are unlimited, and all the ingredients, potions and characters in it are fictional. The full rules are in [Brewing rules.md](Brewing%20rules.md) and what I set out to build is in [SPEC.md](SPEC.md).

I built it in roughly two hours of active time. Railway had a platform-wide outage partway through, so I stopped, waited, then picked it back up and deployed to Vercel instead.

## What works

- Sign in with GitHub or Google (Clerk). Your first request creates your workshop: Wren Ashby, a level 5 Alchemist, 16 ingredients and a mentor's note for Healing Potion (Minor).
- The brew bench: up to four units, live tradition totals, and an optional table d20 so you can force any degree of success. Brewing resolves on the server, including every gate and every cell of the outcome table.
- Result cards for a formed potion (off-by plus an arrow per tradition), an inert mix (one hint at most) and a blocked brew (names every gate it failed).
- The codex: known potions, odds, best off-by, Perfected, and your best combination for each one with **Add to bench**. Hovering that button previews the mix on the bench.
- Ingredient search and favourites, the brew log and the crafter edit sheet.
- GM view: the answer key with every target and perfect recipe, plus a Hidden / Potion / Formula reveal per potion. Player responses never include targets, rooms or required ingredients, and there's a leak test for that.
- A landing page that explains the mechanics for anyone who hasn't played Pathfinder.

## What's incomplete

Discord sign-in isn't switched on in the Clerk dashboard yet. The finite ingredient economy, exact-primary matching and my real campaign content are deliberately left out of this sandbox, they come later when it moves into my own app.

## Run it locally

You'll need Bun and a Neon database. Create `.env.local`:

```dotenv
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
DATABASE_URL=postgresql://your_neon_connection_string
VITE_CLERK_SIGN_IN_URL=/sign-in
VITE_CLERK_SIGN_UP_URL=/sign-up
```

In the Clerk dashboard, turn on the social providers you want and keep email address as the only required identifier, otherwise OAuth sign-up stalls on an extra profile step.

```bash
bun install
bun run db:push
bun run dev
```

Open http://localhost:3000 (not `127.0.0.1`, Clerk's dev flow expects `localhost`).

Tests, typecheck and lint:

```bash
bun test
bunx tsc --noEmit
bun run check
```

The brewing tests pin the worked examples in `Brewing rules.md` §12 and every outcome cell. The projection test checks that answer-key data never reaches the player view.

## The 60-second tour

1. Sign in. The workshop opens with Wren and Healing Potion (Minor) already Known.
2. Follow the mentor's note: add **Heartmoss + Marsh Toad Gland**, set the table d20 to **6** and brew. Totals are **7/26/1/8** against DC **15**, off by **14**. Arcane and Primal are on, Occult and Divine are low.
3. Add **Glowcap** and brew again with **6**. Totals are **7/26/10/13**, a perfect mix that makes **1 + 1d3** potions, and the codex marks it Perfected.
4. Try **Silverleaf + Ghost Orchid + Moonwell Water**. Truth Potion is level 6 and Wren is level 5, so the brew is blocked and says so.
5. Switch **Viewing as** to **GM**. Set **Invisibility Potion** to **Potion**, switch back to Player, and it shows up in the codex with its name, rarity, DC and odds but no target. **Formula** also shares its recipe.

## Deploying

It runs on Vercel. Nitro picks up `VERCEL=1` and builds `.vercel/output`; outside Vercel `bun run build` produces the Node server that `bun run start` runs. `bash scripts/vercel-deploy.sh` links the project, copies the five variables from `.env.local` into Vercel's production environment without printing them, and deploys.

## Licence

This is unofficial PF2e homebrew, not a Paizo product. The app's footer carries the ORC / Community Use notice.
