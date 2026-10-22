import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { TRADITIONS } from "#/brewing/types";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { formatValues, TRADITION_LABEL } from "#/lib/format";
import { orpc } from "#/orpc/client";

const TRADITION_COLOR = {
	arcane: "text-arcane",
	primal: "text-primal",
	occult: "text-occult",
	divine: "text-divine",
};

export function AnswerKey() {
	const queryClient = useQueryClient();
	const answerKey = useQuery(orpc.gm.answerKey.queryOptions());
	const workshop = useQuery(orpc.workshop.get.queryOptions());
	const reveal = useMutation(
		orpc.gm.reveal.mutationOptions({
			onSuccess: async () => {
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: orpc.workshop.key() }),
					queryClient.invalidateQueries({ queryKey: orpc.gm.key() }),
				]);
			},
			onError: (error) => toast.error(error.message),
		}),
	);
	const ingredientNames = Object.fromEntries(
		(workshop.data?.ingredients ?? []).map((ingredient) => [
			ingredient.id,
			ingredient.name,
		]),
	);
	return (
		<Card className="border-occult/40 bg-occult/5">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-occult">
					<Shield className="size-5 shrink-0" aria-hidden="true" />
					Answer key — GM eyes only
				</CardTitle>
				<CardDescription>
					Hidden targets and perfect recipes. Reveal a potion's name to the
					player without revealing its formula.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{answerKey.isPending ? (
					<output className="text-sm text-muted-foreground">
						Opening the answer key…
					</output>
				) : answerKey.isError ? (
					<div className="flex flex-wrap items-center gap-3">
						<p role="alert" className="text-sm text-destructive">
							{answerKey.error.message}
						</p>
						<Button
							variant="outline"
							size="sm"
							onClick={() => answerKey.refetch()}
						>
							Try again
						</Button>
					</div>
				) : (
					<div className="overflow-x-auto rounded-md border border-occult/20">
						<table className="w-full min-w-[1100px] text-left text-sm">
							<caption className="sr-only">
								All {answerKey.data.length} potions, their hidden targets and
								perfect recipes
							</caption>
							<thead className="border-b bg-occult/10 text-xs text-muted-foreground">
								<tr>
									{[
										"Potion",
										"Level",
										"Rarity",
										"DC",
										"Target A / P / O / D",
										"Primary",
										"Primary room",
										"Secondary budget",
										"Required ingredient",
										"Perfect recipe",
										"Status",
										"Player reveal",
									].map((label) => (
										<th
											key={label}
											scope="col"
											className="px-3 py-3 font-medium"
										>
											{label}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{answerKey.data.map((entry) => (
									<tr
										key={entry.potion.id}
										className="border-b last:border-0 hover:bg-muted/20"
									>
										<th scope="row" className="min-w-40 px-3 py-3 font-medium">
											{entry.potion.name}
										</th>
										<td className="px-3 py-3 tabular-nums">
											{entry.potion.level}
										</td>
										<td className="px-3 py-3">
											<Badge variant="outline" className="capitalize">
												{entry.potion.rarity}
											</Badge>
										</td>
										<td className="px-3 py-3 tabular-nums">{entry.dc}</td>
										<td
											className="whitespace-nowrap px-3 py-3 font-mono tabular-nums"
											aria-label={formatValues(entry.potion.target)}
										>
											{TRADITIONS.map((tradition, index) => (
												<span key={tradition}>
													<span
														className={TRADITION_COLOR[tradition]}
														title={TRADITION_LABEL[tradition]}
													>
														{entry.potion.target[index]}
													</span>
													{index < 3 && (
														<span className="text-muted-foreground"> / </span>
													)}
												</span>
											))}
										</td>
										<td
											className={`px-3 py-3 ${TRADITION_COLOR[entry.primary]}`}
										>
											{TRADITION_LABEL[entry.primary]}
										</td>
										<td className="px-3 py-3 tabular-nums">
											±{entry.potion.primaryRoom}
										</td>
										<td className="px-3 py-3 tabular-nums">
											{entry.potion.secondaryBudget}
										</td>
										<td className="px-3 py-3">
											{entry.potion.requiredIngredient
												? (ingredientNames[entry.potion.requiredIngredient] ??
													entry.potion.requiredIngredient)
												: "None"}
										</td>
										<td className="min-w-64 px-3 py-3">
											{Object.entries(entry.potion.perfectRecipe)
												.map(
													([id, count]) =>
														`${ingredientNames[id] ?? id}${count > 1 ? ` ×${count}` : ""}`,
												)
												.join(" + ")}
										</td>
										<td className="px-3 py-3">
											<div className="flex flex-wrap gap-1">
												{entry.known ? (
													<Badge variant="secondary">Known</Badge>
												) : (
													<span className="text-xs text-muted-foreground">
														Undiscovered
													</span>
												)}
												{entry.perfected && (
													<Badge variant="outline" className="text-primal">
														Perfected
													</Badge>
												)}
											</div>
										</td>
										<td className="px-3 py-3">
											<Button
												size="sm"
												variant={entry.revealed ? "secondary" : "outline"}
												disabled={reveal.isPending}
												aria-label={`${entry.revealed ? "Unreveal" : "Reveal"} ${entry.potion.name}`}
												onClick={() =>
													reveal.mutate({
														potionId: entry.potion.id,
														revealed: !entry.revealed,
													})
												}
											>
												{reveal.isPending &&
												reveal.variables?.potionId === entry.potion.id
													? "Saving…"
													: entry.revealed
														? "Unreveal"
														: "Reveal"}
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
