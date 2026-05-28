export type ReqSubTab = "material" | "changeorder";

const TABS: { k: ReqSubTab; l: string }[] = [
	{ k: "material", l: "Material" },
	{ k: "changeorder", l: "Ubah Order" },
];

export function RequestsSubTabs({
	active,
	setActive,
}: {
	active: ReqSubTab;
	setActive: (t: ReqSubTab) => void;
}) {
	return (
		<div
			className="grid"
			style={{
				gridTemplateColumns: "repeat(2, 1fr)",
				borderTop: "1px solid var(--kas-ink)",
				background: "var(--kas-paper)",
			}}
		>
			{TABS.map((t, i) => (
				<button
					key={t.k}
					onClick={() => setActive(t.k)}
					style={{
						border: "none",
						borderRight: i < 1 ? "1px solid var(--kas-line)" : "none",
						borderTop:
							active === t.k
								? "2px solid var(--kas-ink)"
								: "2px solid transparent",
						background: active === t.k ? "var(--kas-ink)" : "transparent",
						color: active === t.k ? "var(--kas-paper)" : "var(--kas-ink-3)",
						padding: "10px 0",
						fontFamily: "var(--font-jetbrains), monospace",
						fontSize: 9,
						letterSpacing: "0.16em",
						textTransform: "uppercase",
						cursor: "pointer",
					}}
				>
					{t.l}
				</button>
			))}
		</div>
	);
}
