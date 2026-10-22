export function BrewingLoader() {
	return (
		<output className="brewing-loader" aria-live="polite">
			<svg viewBox="0 0 64 80" aria-hidden="true">
				<path
					className="brewing-loader-liquid"
					d="M8 50h48a24 24 0 0 1-48 0z"
				/>
				<circle className="brewing-loader-bubble" cx="24" cy="62" r="3.5" />
				<circle className="brewing-loader-bubble" cx="34" cy="66" r="2.5" />
				<circle className="brewing-loader-bubble" cx="41" cy="58" r="3" />
				<path
					className="brewing-loader-glass"
					d="M26 8h12M28 8v18a24 24 0 1 0 8 0V8"
				/>
			</svg>
			<span>Opening your workshop…</span>
		</output>
	);
}
