const HOUSE_RULES = [
	"Potions are found by measuring traditions, not by learning formulas.",
	"Ingredients are never consumed in the sandbox.",
	"Every brew costs one downtime day.",
	"A perfect mix yields 1d3 extra potions on a success.",
	"A failed check with a perfect mix still salvages one potion.",
	"Rare potions need master Crafting.",
	"The GM can reveal a potion by name; its target stays hidden.",
];

export function HouseRules() {
	return (
		<section
			aria-labelledby="house-rules-heading"
			className="parchment rounded-xl p-6 sm:p-8"
		>
			<h2 id="house-rules-heading" className="text-2xl">
				The house rules
			</h2>
			<ol className="mt-5 grid list-decimal gap-x-10 gap-y-3 pl-5 text-sm leading-relaxed marker:font-semibold sm:grid-cols-2">
				{HOUSE_RULES.map((rule) => (
					<li key={rule} className="pl-1">
						{rule}
					</li>
				))}
			</ol>
		</section>
	);
}
