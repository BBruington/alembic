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
		<Card className="min-w-0 gap-4">
			<CardHeader>
				<CardTitle>Ingredient shelf</CardTitle>
				<CardDescription>
					{ingredients.length} ingredients. Unlimited supply. Choose up to four
					units.
				</CardDescription>
			</CardHeader>
			<CardContent className="max-h-[44rem] space-y-4 overflow-y-auto">
				{ingredients.map((ingredient) => (
					<div
						key={ingredient.id}
						className={`border-b pb-4 last:border-0 last:pb-0 ${mix[ingredient.id] ? "border-primary/50" : ""}`}
					>
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="text-sm font-semibold">{ingredient.name}</h3>
							<Badge variant="outline" className="text-xs capitalize">
								{ingredient.rarity}
							</Badge>
						</div>
						<p className="mt-1 text-xs capitalize text-muted-foreground">
							{ingredient.type} · {ingredient.form} · {ingredient.biome}
						</p>
						<div className="mt-3 flex flex-wrap items-center justify-between gap-2">
							<div className="flex gap-1">
								{TRADITIONS.map((tradition, index) => (
									<span
										key={tradition}
										title={TRADITION_LABEL[tradition]}
										className={`rounded px-1.5 py-1 font-mono text-xs tabular-nums ${TRADITION_STYLE[tradition].chip}`}
									>
										{TRADITION_LABEL[tradition][0]} {ingredient.values[index]}
									</span>
								))}
							</div>
							<div className="flex items-center gap-1">
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
					</div>
				))}
			</CardContent>
		</Card>
	);
}
