import { BookOpen, Check, LockKeyhole } from "lucide-react";
import type { WorkshopView } from "#/brewing/types";
import { Badge } from "#/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { formatGate, formatOdds } from "#/lib/format";

export function Codex({ workshop }: { workshop: WorkshopView }) {
	return (
		<Card className="h-fit">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<BookOpen
						className="size-5 shrink-0 text-primary"
						aria-hidden="true"
					/>
					Potion codex
				</CardTitle>
				<CardDescription>
					{workshop.codex.length} known · {workshop.undiscoveredCount}{" "}
					undiscovered
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-5">
				{workshop.codex.map((entry) => {
					const segments = [
						{
							label: "Critical success",
							value: entry.odds.criticalSuccess,
							color: "bg-primal",
						},
						{ label: "Success", value: entry.odds.success, color: "bg-arcane" },
						{ label: "Failure", value: entry.odds.failure, color: "bg-occult" },
						{
							label: "Critical failure",
							value: entry.odds.criticalFailure,
							color: "bg-destructive",
						},
					];
					return (
						<article
							key={entry.potionId}
							className="space-y-3 border-b pb-5 last:border-0 last:pb-0"
						>
							<div className="flex flex-wrap items-start justify-between gap-2">
								<h3 className="font-medium">{entry.name}</h3>
								<Badge
									variant="outline"
									className={
										entry.rarity === "rare"
											? "text-occult"
											: entry.rarity === "uncommon"
												? "text-arcane"
												: "text-muted-foreground"
									}
								>
									{entry.rarity}
								</Badge>
							</div>
							<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
								<span>Level {entry.level}</span>
								<span>DC {entry.dc}</span>
								{entry.perfected && (
									<Badge variant="secondary" className="gap-1 text-primal">
										<Check className="size-3" />
										Perfected
									</Badge>
								)}
							</div>
							<div className="space-y-1.5">
								<p className="text-sm tabular-nums">
									≥ success{" "}
									{Math.round(
										(entry.odds.criticalSuccess + entry.odds.success) * 100,
									)}
									%
								</p>
								<div
									className="flex h-1.5 w-full overflow-hidden rounded-full bg-muted"
									role="img"
									aria-label={formatOdds(entry.odds)}
								>
									{segments.map((segment) => (
										<span
											key={segment.label}
											className={segment.color}
											style={{ width: `${segment.value * 100}%` }}
											title={`${segment.label}: ${Math.round(segment.value * 100)}%`}
										/>
									))}
								</div>
								<p className="text-xs text-muted-foreground">
									Crit / success / fail / crit-fail
								</p>
							</div>
							<p className="text-sm text-muted-foreground">
								Best off-by:{" "}
								<span className="font-medium text-foreground tabular-nums">
									{entry.bestOffBy ?? "Not brewed yet"}
								</span>
							</p>
							{entry.source === "mentor" && entry.note && (
								<p className="text-sm italic text-muted-foreground">
									Mentor's note: {entry.note}
								</p>
							)}
							{entry.source === "revealed" && (
								<Badge variant="outline">Revealed by GM</Badge>
							)}
							{entry.source === "brewed" && (
								<p className="text-xs text-muted-foreground">
									Discovered at the bench
								</p>
							)}
							{entry.crafterGates.length > 0 && (
								<div className="space-y-1 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
									<p className="font-medium">
										Beyond {workshop.crafter.name.split(" ")[0]}
									</p>
									{entry.crafterGates.map((gate) => (
										<p key={gate.kind}>
											{formatGate(gate, workshop.crafter.name, entry.name)}
										</p>
									))}
								</div>
							)}
						</article>
					);
				})}
				{workshop.undiscoveredCount > 0 && (
					<div className="space-y-3">
						<p className="text-sm text-muted-foreground">
							{workshop.undiscoveredCount} undiscovered
						</p>
						<ul
							className="grid grid-cols-5 gap-2"
							aria-label={`${workshop.undiscoveredCount} undiscovered potion slots`}
						>
							{Array.from(
								{ length: workshop.undiscoveredCount },
								(_, index) => `Undiscovered potion ${index + 1}`,
							).map((slot) => (
								<li
									key={slot}
									className="flex aspect-square items-center justify-center rounded-md border border-dashed bg-muted/20 text-muted-foreground/60"
								>
									<LockKeyhole className="size-4" aria-hidden="true" />
									<span className="sr-only">{slot}</span>
								</li>
							))}
						</ul>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
