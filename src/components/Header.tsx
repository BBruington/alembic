import { Link } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import HeaderUser from "../integrations/clerk/header-user";
import { DevBadge } from "./DevBadge";

export default function Header() {
	return (
		<header className="border-b border-primary/25 bg-background">
			<nav
				aria-label="Main navigation"
				className="page-wrap flex min-h-20 items-center justify-between gap-4"
			>
				<Link
					to="/workshop"
					className="inline-flex items-center gap-3 text-primary transition-colors hover:text-foreground"
				>
					<FlaskConical
						className="size-7"
						strokeWidth={1.5}
						aria-hidden="true"
					/>
					<span className="font-display text-3xl tracking-tight">Alembic</span>
				</Link>
				<div className="flex items-center gap-4">
					<DevBadge />
					<HeaderUser />
				</div>
			</nav>
		</header>
	);
}
