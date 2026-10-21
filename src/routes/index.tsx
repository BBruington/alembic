import { Show } from "@clerk/tanstack-react-start";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { HouseRules } from "../components/HouseRules";
import { buttonVariants } from "../components/ui/button";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
	return (
		<main className="page-wrap max-w-6xl py-12 sm:py-20">
			<section className="grid items-center gap-12 pb-16 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
				<div>
					<h1 className="max-w-2xl font-display text-5xl leading-[1.1] tracking-tight sm:text-7xl">
						A little science.
						<br />
						<span className="text-primary">A little magic.</span>
					</h1>
					<p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
						Brew PF2e potions by measuring ingredients across the four magical
						traditions. Follow your mentor's notes, refine each mixture, and
						discover a codex of your own.
					</p>
					<div className="mt-8">
						<Show when="signed-out">
							<Link to="/sign-in/$" className={buttonVariants({ size: "lg" })}>
								Sign in <ArrowRight aria-hidden="true" />
							</Link>
						</Show>
						<Show when="signed-in">
							<Link to="/workshop" className={buttonVariants({ size: "lg" })}>
								Enter the workshop <ArrowRight aria-hidden="true" />
							</Link>
						</Show>
					</div>
				</div>
				<aside
					className="parchment rounded-xl p-7 shadow-xl sm:p-9"
					aria-label="A note from your mentor"
				>
					<h2 className="text-2xl">Your first experiment</h2>
					<p className="mt-5 font-display text-3xl leading-snug">
						“Heartmoss +<br />
						Marsh Toad Gland”
					</p>
					<p className="mt-5 text-sm leading-relaxed">
						A note from your mentor. A shelf of sixteen ingredients. The rest is
						yours to discover.
					</p>
					<div className="mt-7 grid grid-cols-2 gap-3 border-t border-current/20 pt-5 text-sm font-semibold">
						{[
							["Arcane", "bg-arcane"],
							["Primal", "bg-primal"],
							["Occult", "bg-occult"],
							["Divine", "bg-divine"],
						].map(([name, color]) => (
							<span key={name} className="flex items-center gap-2">
								<span
									className={`size-3 rounded-full border border-current/30 ${color}`}
								/>
								{name}
							</span>
						))}
					</div>
				</aside>
			</section>
			<HouseRules />
		</main>
	);
}
