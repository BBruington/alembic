import { ArrowDown, ArrowUp, Check, FlaskConical } from "lucide-react";
import { type BrewView, TRADITIONS } from "#/brewing/types";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { TRADITION_STYLE } from "#/components/workshop/TraditionBars";
import { formatCheck, formatGate, TRADITION_LABEL } from "#/lib/format";

export function ResultCard({
	result,
	crafterName,
}: {
	result: BrewView | null;
	crafterName: string;
}) {
	if (!result) return null;
	const potionName = result.potionName ?? "Potion";
	return (
		<Card className="gap-4">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 font-serif text-xl">
					<FlaskConical className="size-5" />
					{result.kind === "inert" ? "The mix stays inert" : potionName}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{result.kind === "formed" && (
					<>
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant={result.perfect ? "default" : "secondary"}>
								{result.perfect ? "Perfect" : `Off by ${result.offBy}`}
							</Badge>
							<span className="text-sm font-medium">
								{result.bonusRoll !== null
									? `${result.quantity - result.bonusRoll} + 1d3 (${result.bonusRoll}) = ${result.quantity} potions`
									: `${result.quantity} ${result.quantity === 1 ? "potion" : "potions"}`}
							</span>
						</div>
						<p className="text-sm leading-relaxed">
							{formatCheck(result.check)}
						</p>
						{result.quantity === 0 && (
							<p className="text-sm text-muted-foreground">
								The potion is discovered, but this batch yields no usable
								potions.
							</p>
						)}
						{result.perfect && result.check.degree === "failure" && (
							<p className="text-sm text-muted-foreground">
								Your perfect mixture salvaged one potion.
							</p>
						)}
						<div className="grid grid-cols-2 gap-2">
							{TRADITIONS.map((tradition) => {
								const arrow = result.arrows[tradition];
								const Icon =
									arrow === "on"
										? Check
										: arrow === "low"
											? ArrowUp
											: ArrowDown;
								return (
									<div
										key={tradition}
										className={`flex items-center gap-1.5 rounded-md px-2 py-2 text-xs ${TRADITION_STYLE[tradition].chip}`}
									>
										<Icon className="size-3.5" />
										{TRADITION_LABEL[tradition]}{" "}
										<span className="ml-auto">{arrow}</span>
									</div>
								);
							})}
						</div>
						{result.worstAxis && (
							<p className="rounded-md bg-muted p-3 text-sm">
								{TRADITION_LABEL[result.worstAxis.tradition]} target:{" "}
								<strong>{result.worstAxis.target}</strong>
							</p>
						)}
					</>
				)}
				{result.kind === "inert" && (
					<p className="text-sm text-muted-foreground">
						{result.hint
							? `The mix wants ${result.hint.direction} ${TRADITION_LABEL[result.hint.tradition]}.`
							: "The traditions have not settled into a potion. Try a different balance."}
					</p>
				)}
				{result.kind === "beyond" && (
					<>
						<Badge variant="outline">Beyond your reach</Badge>
						<ul className="list-disc space-y-2 pl-5 text-sm">
							{result.gates.map((gate) => (
								<li key={gate.kind}>
									{formatGate(gate, crafterName, potionName)}
								</li>
							))}
						</ul>
					</>
				)}
			</CardContent>
		</Card>
	);
}
