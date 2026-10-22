import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, Shield } from "lucide-react";
import { toast } from "sonner";
import type { ViewingAs } from "#/brewing/types";
import { Button } from "#/components/ui/button";
import { orpc } from "#/orpc/client";

export function ViewingToggle({
	viewingAs,
	isGm,
}: {
	viewingAs: ViewingAs;
	isGm: boolean;
}) {
	const queryClient = useQueryClient();
	const mutation = useMutation(
		orpc.viewing.set.mutationOptions({
			onSuccess: async (_, input) => {
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: orpc.workshop.key() }),
					queryClient.invalidateQueries({
						queryKey: orpc.gm.key(),
						refetchType: input.as === "gm" ? "active" : "none",
					}),
				]);
			},
			onError: (error) => toast.error(error.message),
		}),
	);
	return (
		<div className="flex flex-wrap items-center gap-2 text-sm">
			<span
				aria-hidden="true"
				className="hidden text-muted-foreground sm:inline"
			>
				Viewing as:
			</span>
			<fieldset className="flex gap-1 rounded-lg border bg-muted/40 p-1">
				<legend className="sr-only">Viewing as</legend>
				{isGm && (
					<Button
						type="button"
						size="sm"
						variant={viewingAs === "gm" ? "default" : "ghost"}
						aria-pressed={viewingAs === "gm"}
						disabled={mutation.isPending}
						onClick={() => mutation.mutate({ as: "gm" })}
					>
						<Shield className="hidden size-3.5 sm:block" />
						GM
					</Button>
				)}
				<Button
					type="button"
					size="sm"
					variant={viewingAs === "player" ? "default" : "ghost"}
					aria-pressed={viewingAs === "player"}
					disabled={mutation.isPending}
					onClick={() => mutation.mutate({ as: "player" })}
				>
					<Eye className="hidden size-3.5 sm:block" />
					Player
				</Button>
			</fieldset>
		</div>
	);
}
