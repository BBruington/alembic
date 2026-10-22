import { auth } from "@clerk/tanstack-react-start/server";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import type { BrewView, Mix } from "#/brewing/types";
import { HouseRules } from "#/components/HouseRules";
import { Button } from "#/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
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
	const benchRef = useRef<HTMLDivElement>(null);
	const [benchVisible, setBenchVisible] = useState(true);
	const hasWorkshop = workshop.data !== undefined;
	useEffect(() => {
		if (!hasWorkshop) return;
		const bench = benchRef.current;
		if (!bench) return;
		const observer = new IntersectionObserver(([entry]) => {
			setBenchVisible(entry.isIntersecting);
		});
		observer.observe(bench);
		return () => observer.disconnect();
	}, [hasWorkshop]);
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
	const mentorNote = view.codex.find(
		(entry) => entry.source === "mentor",
	)?.note;

	return (
		<main className="workshop-layout page-wrap">
			<div className="workshop-heading">
				<h1 className="text-2xl font-semibold tracking-tight">The workshop</h1>
				<ViewingToggle viewingAs={view.viewingAs} isGm={view.isGm} />
			</div>
			<CrafterCard crafter={view.crafter} />
			<div className="workshop-workspace">
				<div className="workshop-library" id="ingredients">
					<Shelf
						ingredients={view.ingredients}
						mix={mix}
						units={units}
						onChange={changeIngredient}
					/>
					<Tabs defaultValue="codex" className="mt-5">
						<TabsList variant="line" aria-label="Workshop records">
							<TabsTrigger value="codex">Potion codex</TabsTrigger>
							<TabsTrigger value="log">
								Brew log · {view.log.length}
							</TabsTrigger>
						</TabsList>
						<TabsContent value="codex">
							<Codex workshop={view} />
						</TabsContent>
						<TabsContent value="log">
							<BrewLog log={view.log} ingredients={view.ingredients} />
						</TabsContent>
					</Tabs>
				</div>
				<div ref={benchRef} className="workshop-bench" id="brew-bench">
					{mentorNote && (
						<p className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
							<span className="font-semibold">Mentor's note:</span> {mentorNote}
						</p>
					)}
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
					<a
						href="#ingredients"
						className="bench-mobile-link text-sm text-primary underline underline-offset-4"
					>
						Choose ingredients ↓
					</a>
				</div>
			</div>
			{view.viewingAs === "gm" && <AnswerKey />}
			<HouseRules />
			<a
				href="#brew-bench"
				className="mobile-bench-shortcut"
				hidden={benchVisible}
			>
				<span>Brew bench</span>
				<span>{units} / 4 units · Review mix ↑</span>
			</a>
		</main>
	);
}
