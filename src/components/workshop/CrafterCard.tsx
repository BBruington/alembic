import { FlaskConical } from "lucide-react";
import type { CrafterView } from "#/brewing/types";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent } from "#/components/ui/card";
import { CrafterSheet, TOOL_LABELS } from "#/components/workshop/CrafterSheet";

export function CrafterCard({ crafter }: { crafter: CrafterView }) {
	return (
		<Card className="gap-0 py-4">
			<CardContent className="flex flex-wrap items-center justify-between gap-4 px-4 sm:px-4">
				<div className="flex items-center gap-3">
					<div className="flex size-11 items-center justify-center rounded-full bg-primal/15 text-primal">
						<FlaskConical className="size-5" />
					</div>
					<div>
						<h2 className="font-serif text-xl">{crafter.name}</h2>
						<p className="text-sm text-muted-foreground">
							Level {crafter.level} {crafter.className} · Int{" "}
							{crafter.intMod >= 0 ? "+" : ""}
							{crafter.intMod} ·{" "}
							<span className="capitalize">{crafter.craftingRank}</span>{" "}
							Crafting
						</p>
					</div>
				</div>
				<div className="flex flex-wrap items-center gap-3 text-sm">
					<div className="space-y-1">
						<p>
							{crafter.alchemicalCrafting
								? "Alchemical Crafting"
								: "No Alchemical Crafting"}
						</p>
						<p className="text-muted-foreground">
							{TOOL_LABELS[crafter.tools]}
						</p>
					</div>
					<Badge variant="secondary" className="tabular-nums">
						Crafting {crafter.modifier >= 0 ? "+" : ""}
						{crafter.modifier}
					</Badge>
					<span className="text-muted-foreground tabular-nums">
						{crafter.downtimeDays} downtime{" "}
						{crafter.downtimeDays === 1 ? "day" : "days"}
					</span>
					<CrafterSheet crafter={crafter} />
				</div>
			</CardContent>
		</Card>
	);
}
