import { auth } from "@clerk/tanstack-react-start/server";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type { BrewView, Mix } from "#/brewing/types";
import { HouseRules } from "#/components/HouseRules";
import { Button } from "#/components/ui/button";
import { AnswerKey } from "#/components/workshop/AnswerKey";
import { BrewBench } from "#/components/workshop/BrewBench";
import { BrewLog } from "#/components/workshop/BrewLog";
import { Codex } from "#/components/workshop/Codex";
import { CrafterCard } from "#/components/workshop/CrafterCard";
import { ResultCard } from "#/components/workshop/ResultCard";
import { Shelf } from "#/components/workshop/Shelf";
import { ViewingToggle } from "#/components/workshop/ViewingToggle";
import { orpc } from "#/orpc/client";

const requireSession = createServerFn({ method: "GET" }).handler(async () => {
	const session = await auth();
	if (!session.userId) throw redirect({ to: "/sign-in/$" });
});

export const Route = createFileRoute("/workshop")({
	beforeLoad: () => requireSession(),
	component: Workshop,
});

function Workshop() {
	const queryClient = useQueryClient();
	const workshop = useQuery(orpc.workshop.get.queryOptions());
	const [mix, setMix] = useState<Mix>({});
	const [result, setResult] = useState<BrewView | null>(null);
	const brew = useMutation(
		orpc.brew.attempt.mutationOptions({
			onMutate: () => setResult(null),
			onSuccess: (nextResult) => {
				setResult(nextResult);
				return queryClient.invalidateQueries({ queryKey: orpc.workshop.key() });
			},
		}),
	);
	const units = Object.values(mix).reduce((sum, quantity) => sum + quantity, 0);

	function changeIngredient(id: string, delta: number) {
		setMix((current) => {
			const count = Object.values(current).reduce(
				(sum, quantity) => sum + quantity,
				0,
			);
			if (delta > 0 && count >= 4) return current;
			const next = { ...current };
			const quantity = Math.max(0, (next[id] ?? 0) + delta);
			if (quantity === 0) delete next[id];
			else next[id] = quantity;
			return next;
		});
	}

	if (workshop.isPending)
		return (
			<main className="page-wrap px-4 py-12">
				<output className="text-muted-foreground">
					Opening your workshop…
				</output>
			</main>
		);
	if (!workshop.data)
		return (
			<main className="page-wrap space-y-4 px-4 py-12">
				<h1 className="font-serif text-3xl">The workshop could not open</h1>
				<p role="alert" className="text-sm text-destructive">
					{workshop.error?.message ?? "Please try again."}
				</p>
				<Button onClick={() => workshop.refetch()}>Try again</Button>
			</main>
		);
	const view = workshop.data;

	return (
		<main className="mx-auto w-full max-w-[1600px] space-y-6 px-4 py-8 sm:px-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
						The workshop
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						A little measurement. A little mystery. A discovery worth bottling.
					</p>
				</div>
				<ViewingToggle viewingAs={view.viewingAs} isGm={view.isGm} />
			</div>
			<CrafterCard crafter={view.crafter} />
			<div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)]">
				<Shelf
					ingredients={view.ingredients}
					mix={mix}
					units={units}
					onChange={changeIngredient}
				/>
				<div className="space-y-5">
					<BrewBench
						ingredients={view.ingredients}
						mix={mix}
						units={units}
						pending={brew.isPending}
						error={brew.error?.message ?? null}
						onChange={changeIngredient}
						onClear={() => setMix({})}
						onBrew={(d20) =>
							brew.mutate({ mix, ...(d20 === undefined ? {} : { d20 }) })
						}
					/>
					<div aria-live="polite">
						<ResultCard result={result} crafterName={view.crafter.name} />
					</div>
				</div>
				<div className="lg:col-span-2 xl:col-span-1">
					<Codex workshop={view} />
				</div>
			</div>
			{view.viewingAs === "gm" && <AnswerKey />}
			<BrewLog log={view.log} ingredients={view.ingredients} />
			<HouseRules />
		</main>
	);
}
