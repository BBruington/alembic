import { useEffect, useState } from "react";
import type { BrewLogEntry, Ingredient } from "#/brewing/types";
import { Badge } from "#/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { formatCheck, formatValues } from "#/lib/format";

function relativeTime(date: string, now: number): string {
	const minutes = Math.max(
		0,
		Math.floor((now - new Date(date).getTime()) / 60000),
	);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m ago`;
	if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
	return `${Math.floor(minutes / 1440)}d ago`;
}

export function BrewLog({
	log,
	ingredients,
}: {
	log: BrewLogEntry[];
	ingredients: readonly Ingredient[];
}) {
	const [now, setNow] = useState<number | null>(null);
	useEffect(() => {
		setNow(Date.now());
		const timer = window.setInterval(() => setNow(Date.now()), 60000);
		return () => window.clearInterval(timer);
	}, []);
	const entries = [...log].sort(
		(left, right) =>
			new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
	);
	return (
		<Card className="gap-4">
			<CardHeader>
				<CardTitle>Brew log</CardTitle>
				<CardDescription>
					Your experiments, newest first. Totals are Arcane / Primal / Occult /
					Divine.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{entries.length === 0 ? (
					<p className="py-3 text-sm text-muted-foreground">
						No experiments yet. Your first brew starts the record.
					</p>
				) : (
					<ol className="divide-y">
						{entries.map((entry) => (
							<li
								key={entry.id}
								className="grid gap-2 py-4 first:pt-0 md:grid-cols-[1fr_auto] md:gap-4"
							>
								<div className="min-w-0 space-y-2">
									<p className="text-sm font-medium">
										{Object.entries(entry.mix)
											.map(
												([id, units]) =>
													`${ingredients.find((ingredient) => ingredient.id === id)?.name ?? id} ×${units}`,
											)
											.join(" + ")}
									</p>
									<p className="font-mono text-xs text-muted-foreground">
										A/P/O/D {formatValues(entry.result.totals)}
									</p>
									{entry.result.kind === "formed" && (
										<p className="text-xs text-muted-foreground">
											{formatCheck(entry.result.check)}
										</p>
									)}
									<p className="text-sm">
										{entry.result.kind === "formed"
											? `${entry.result.potionName} · ${entry.result.quantity} ${entry.result.quantity === 1 ? "potion" : "potions"} · ${entry.result.perfect ? "Perfect" : `off by ${entry.result.offBy}`}`
											: entry.result.kind === "beyond"
												? `Beyond · ${entry.result.potionName}`
												: "Inert"}
									</p>
								</div>
								<div className="flex items-center gap-3 md:flex-col md:items-end">
									<Badge variant="outline" className="capitalize">
										{entry.result.kind}
									</Badge>
									<time
										className="text-xs text-muted-foreground"
										dateTime={entry.createdAt}
										title={entry.createdAt}
									>
										{now === null
											? entry.createdAt
											: relativeTime(entry.createdAt, now)}
									</time>
								</div>
							</li>
						))}
					</ol>
				)}
			</CardContent>
		</Card>
	);
}
