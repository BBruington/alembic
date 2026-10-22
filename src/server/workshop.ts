import { ORPCError } from "@orpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import {
	INGREDIENTS,
	MENTOR_NOTE,
	POTIONS,
	STARTER_POTION_ID,
	WREN,
} from "#/brewing/catalog";
import { potionDc, primaryOf, resolveBrew } from "#/brewing/engine";
import type { AnswerKeyEntry, BrewView, ViewingAs } from "#/brewing/types";
import { db } from "#/db/index";
import { brews, campaigns, codexEntries, crafters } from "#/db/schema";
import type { BrewAttempt, CrafterEdit } from "#/orpc/schema";
import { toCrafterView, toWorkshopView } from "./projection";

export async function bootstrap(userId: string) {
	return db.transaction(async (tx) => {
		await tx
			.insert(campaigns)
			.values({ gmUserId: userId })
			.onConflictDoNothing({ target: campaigns.gmUserId });
		const campaign = await tx.query.campaigns.findFirst({
			where: eq(campaigns.gmUserId, userId),
		});
		if (!campaign) throw new ORPCError("INTERNAL_SERVER_ERROR");
		await tx
			.insert(crafters)
			.values({ campaignId: campaign.id, ...WREN })
			.onConflictDoNothing();
		await tx
			.insert(codexEntries)
			.values({
				campaignId: campaign.id,
				potionId: STARTER_POTION_ID,
				mentor: true,
				note: MENTOR_NOTE,
			})
			.onConflictDoNothing();
		return campaign;
	});
}

export async function getWorkshop(userId: string) {
	const campaign = await bootstrap(userId);
	const [crafter, entries, log] = await Promise.all([
		db.query.crafters.findFirst({
			where: eq(crafters.campaignId, campaign.id),
		}),
		db
			.select()
			.from(codexEntries)
			.where(eq(codexEntries.campaignId, campaign.id)),
		db
			.select()
			.from(brews)
			.where(eq(brews.campaignId, campaign.id))
			.orderBy(desc(brews.createdAt), desc(brews.id))
			.limit(50),
	]);
	if (!crafter) throw new ORPCError("INTERNAL_SERVER_ERROR");
	const recovered = await Promise.all(
		entries.map(async (entry) => {
			if (!entry.formed || entry.bestMix || entry.bestOffBy === null)
				return entry;
			const [best] = await db
				.select({ mix: brews.mix })
				.from(brews)
				.where(
					and(
						eq(brews.campaignId, campaign.id),
						sql`${brews.result}->>'kind' = 'formed'`,
						sql`${brews.result}->>'potionId' = ${entry.potionId}`,
						sql`(${brews.result}->>'offBy')::int = ${entry.bestOffBy}`,
					),
				)
				.orderBy(desc(brews.createdAt))
				.limit(1);
			return { ...entry, bestMix: best?.mix ?? null };
		}),
	);
	return toWorkshopView({
		viewingAs: campaign.viewingAs,
		isGm: campaign.gmUserId === userId,
		crafter,
		entries: recovered,
		log: log.map((row) => ({
			id: row.id,
			createdAt: row.createdAt.toISOString(),
			mix: row.mix,
			result: row.result,
		})),
	});
}

function rollDie(sides: number): number {
	const range = 0x100000000;
	const limit = range - (range % sides);
	const buffer = new Uint32Array(1);
	do {
		crypto.getRandomValues(buffer);
	} while (buffer[0] >= limit);
	return (buffer[0] % sides) + 1;
}

export async function attemptBrew(
	userId: string,
	input: BrewAttempt,
): Promise<BrewView> {
	if (
		Object.keys(input.mix).some(
			(id) => !INGREDIENTS.some((ingredient) => ingredient.id === id),
		)
	) {
		throw new ORPCError("BAD_REQUEST", { message: "Unknown ingredient" });
	}
	const campaign = await bootstrap(userId);
	return db.transaction(async (tx) => {
		const [crafter] = await tx
			.select()
			.from(crafters)
			.where(eq(crafters.campaignId, campaign.id))
			.for("update");
		if (!crafter) throw new ORPCError("INTERNAL_SERVER_ERROR");
		const result = resolveBrew({
			mix: input.mix,
			crafter,
			d20: input.d20 ?? rollDie(20),
			tableRoll: input.d20 !== undefined,
			rollD3: () => rollDie(3),
		});
		const view: BrewView = {
			...result,
			potionName:
				result.kind === "inert"
					? null
					: (POTIONS.find((potion) => potion.id === result.potionId)?.name ??
						null),
		};
		await tx
			.insert(brews)
			.values({ campaignId: campaign.id, mix: input.mix, result: view });
		await tx
			.update(crafters)
			.set({ downtimeDays: sql`${crafters.downtimeDays} + 1` })
			.where(eq(crafters.campaignId, campaign.id));
		if (result.kind === "formed") {
			await tx
				.insert(codexEntries)
				.values({
					campaignId: campaign.id,
					potionId: result.potionId,
					formed: true,
					perfected: result.perfect,
					bestOffBy: result.offBy,
					bestMix: input.mix,
				})
				.onConflictDoUpdate({
					target: [codexEntries.campaignId, codexEntries.potionId],
					set: {
						formed: true,
						perfected: sql`${codexEntries.perfected} OR ${result.perfect}`,
						bestOffBy: sql`LEAST(${codexEntries.bestOffBy}, ${result.offBy})`,
						bestMix: sql`CASE WHEN ${codexEntries.bestOffBy} IS NULL OR ${result.offBy} < ${codexEntries.bestOffBy} OR (${codexEntries.bestMix} IS NULL AND ${result.offBy} = ${codexEntries.bestOffBy}) THEN excluded.best_mix ELSE ${codexEntries.bestMix} END`,
					},
				});
		}
		return view;
	});
}

export async function updateCrafter(userId: string, input: CrafterEdit) {
	const campaign = await bootstrap(userId);
	const [crafter] = await db
		.update(crafters)
		.set(input)
		.where(eq(crafters.campaignId, campaign.id))
		.returning();
	if (!crafter) throw new ORPCError("INTERNAL_SERVER_ERROR");
	return toCrafterView(crafter);
}

export async function setViewing(userId: string, viewingAs: ViewingAs) {
	const campaign = await bootstrap(userId);
	if (viewingAs === "gm" && campaign.gmUserId !== userId)
		throw new ORPCError("FORBIDDEN");
	await db
		.update(campaigns)
		.set({ viewingAs })
		.where(eq(campaigns.id, campaign.id));
	return { viewingAs };
}

async function requireGm(userId: string) {
	const campaign = await bootstrap(userId);
	if (campaign.gmUserId !== userId || campaign.viewingAs !== "gm")
		throw new ORPCError("FORBIDDEN");
	return campaign;
}

export async function getAnswerKey(userId: string): Promise<AnswerKeyEntry[]> {
	const campaign = await requireGm(userId);
	const entries = await db
		.select()
		.from(codexEntries)
		.where(eq(codexEntries.campaignId, campaign.id));
	return POTIONS.map((potion) => {
		const entry = entries.find((row) => row.potionId === potion.id);
		return {
			potion,
			primary: primaryOf(potion),
			dc: potionDc(potion),
			known: Boolean(entry && (entry.mentor || entry.formed || entry.revealed)),
			revealed: entry?.revealed ?? false,
			perfected: entry?.perfected ?? false,
		};
	});
}

export async function revealPotion(
	userId: string,
	potionId: string,
	revealed: boolean,
): Promise<{ ok: true }> {
	if (!POTIONS.some((potion) => potion.id === potionId))
		throw new ORPCError("BAD_REQUEST", { message: "Unknown potion" });
	const campaign = await requireGm(userId);
	await db
		.insert(codexEntries)
		.values({ campaignId: campaign.id, potionId, revealed })
		.onConflictDoUpdate({
			target: [codexEntries.campaignId, codexEntries.potionId],
			set: { revealed },
			setWhere: and(
				eq(codexEntries.campaignId, campaign.id),
				eq(codexEntries.potionId, potionId),
			),
		});
	return { ok: true };
}
