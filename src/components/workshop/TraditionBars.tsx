import { TRADITIONS, type Tradition, type Values } from "#/brewing/types";
import { TRADITION_LABEL } from "#/lib/format";

export const TRADITION_STYLE: Record<
	Tradition,
	{ chip: string; bar: string; text: string }
> = {
	arcane: {
		chip: "bg-arcane text-arcane-foreground",
		bar: "bg-arcane",
		text: "text-arcane",
	},
	primal: {
		chip: "bg-primal text-primal-foreground",
		bar: "bg-primal",
		text: "text-primal",
	},
	occult: {
		chip: "bg-occult text-occult-foreground",
		bar: "bg-occult",
		text: "text-occult",
	},
	divine: {
		chip: "bg-divine text-divine-foreground",
		bar: "bg-divine",
		text: "text-divine",
	},
};

export function TraditionBars({ values }: { values: Values }) {
	return (
		<section className="space-y-3" aria-label="Live tradition totals">
			{TRADITIONS.map((tradition, index) => (
				<div key={tradition}>
					<div className="mb-1 flex justify-between text-xs">
						<span>{TRADITION_LABEL[tradition]}</span>
						<span className="font-mono tabular-nums">{values[index]}</span>
					</div>
					<div className="h-2 overflow-hidden rounded-full bg-muted">
						<div
							className={`h-full rounded-full transition-all ${TRADITION_STYLE[tradition].bar}`}
							style={{ width: `${Math.min((values[index] / 45) * 100, 100)}%` }}
						/>
					</div>
				</div>
			))}
		</section>
	);
}
