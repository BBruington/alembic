import { describe, expect, test } from "bun:test";
import { POTIONS, WREN } from "#/brewing/catalog";
import { toWorkshopView } from "./projection";

describe("player workshop projection", () => {
	test("all known potions expose metadata without answer-key fields or values", () => {
		const view = toWorkshopView({
			viewingAs: "player",
			isGm: true,
			crafter: { ...WREN, downtimeDays: 0 },
			entries: POTIONS.map((potion) => ({
				potionId: potion.id,
				mentor: false,
				formed: false,
				revealed: true,
				perfected: false,
				bestOffBy: null,
				note: null,
			})),
			log: [],
		});
		expect(view.codex).toHaveLength(11);
		expect(view.undiscoveredCount).toBe(0);
		const serialized = JSON.stringify(view);
		for (const key of [
			"target",
			"primaryRoom",
			"secondaryBudget",
			"requiredIngredient",
			"perfectRecipe",
		]) {
			expect(serialized).not.toContain(`"${key}"`);
		}
		for (const potion of POTIONS) {
			expect(serialized).not.toContain(potion.target.join("/"));
			expect(serialized).not.toContain(JSON.stringify(potion.target));
		}
	});

	test("only mentor, formed, or revealed entries are known", () => {
		const entries = POTIONS.map((potion, index) => ({
			potionId: potion.id,
			mentor: index === 0,
			formed: index === 1,
			revealed: index === 2,
			perfected: index === 1,
			bestOffBy: index === 1 ? 0 : null,
			note: index === 0 ? "Mentor note" : null,
		}));
		const view = toWorkshopView({
			viewingAs: "gm",
			isGm: true,
			crafter: { ...WREN, downtimeDays: 3 },
			entries,
			log: [],
		});
		expect(view.codex.map((entry) => entry.source)).toEqual([
			"mentor",
			"brewed",
			"revealed",
		]);
		expect(view.undiscoveredCount).toBe(8);
		expect(view.crafter.downtimeDays).toBe(3);
		expect(view.crafter.modifier).toBe(14);
	});
});
