import { Minus, Plus } from "lucide-react";
import { type Ingredient, type Mix, TRADITIONS } from "#/brewing/types";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { TRADITION_STYLE } from "#/components/workshop/TraditionBars";
import { TRADITION_LABEL } from "#/lib/format";

interface ShelfProps {
	ingredients: readonly Ingredient[];
	mix: Mix;
	units: number;
	onChange: (ingredientId: string, delta: number) => void;
}

export function Shelf({ ingredients, mix, units, onChange }: ShelfProps) {
	return (
		<Card className="ingredient-shelf gap-3 shadow-none">
			<CardHeader>
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<CardTitle className="text-lg">Ingredients</CardTitle>
					<span className="text-xs text-muted-foreground">
						{ingredients.length} available · Unlimited supply
					</span>
				</div>
				<CardDescription>
					Choose up to four units. Repeats welcome.
				</CardDescription>
			</CardHeader>
			<CardContent className="ingredient-grid">
				{ingredients.map((ingredient) => (
					<div
						key={ingredient.id}
						className={`ingredient-item ${mix[ingredient.id] ? "ingredient-selected" : ""}`}
					>
						<div className="flex items-start justify-between gap-1">
							<h3 className="text-sm font-semibold">{ingredient.name}</h3>
							<Badge
								variant="outline"
								className="ingredient-rarity text-xs capitalize"
							>
								{ingredient.rarity}
							</Badge>
						</div>
						<div className="mt-2 flex items-center justify-between gap-2">
							<p className="text-[0.6875rem] capitalize text-muted-foreground">
								{ingredient.type} · {ingredient.form} · {ingredient.biome}
							</p>
							<div className="ingredient-controls flex shrink-0 items-center gap-1">
								<Button
									size="icon-sm"
									variant="outline"
									aria-label={`Remove ${ingredient.name}`}
									disabled={!mix[ingredient.id]}
									onClick={() => onChange(ingredient.id, -1)}
								>
									<Minus className="size-3" />
								</Button>
								<span className="w-4 text-center font-mono text-xs tabular-nums">
									{mix[ingredient.id] ?? 0}
								</span>
								<Button
									size="icon-sm"
									variant="outline"
									aria-label={`Add ${ingredient.name}`}
									disabled={units >= 4}
									onClick={() => onChange(ingredient.id, 1)}
								>
									<Plus className="size-3" />
								</Button>
							</div>
						</div>
						<div className="mt-2 grid grid-cols-4 gap-1">
							{TRADITIONS.map((tradition, index) => (
								<span
									key={tradition}
									title={TRADITION_LABEL[tradition]}
									className={`whitespace-nowrap font-mono text-xs tabular-nums ${TRADITION_STYLE[tradition].text}`}
								>
									{TRADITION_LABEL[tradition][0]} {ingredient.values[index]}
								</span>
							))}
						</div>
					</div>
				))}
			</CardContent>
		</Card>
	);
}
