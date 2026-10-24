import { Spinner } from "@/components/ui/Spinner";

// =============================================================================
// Affiché instantanément pendant le chargement d'une page (en-tête et pied de
// page restent en place) : le visiteur voit tout de suite que son clic a été
// pris en compte, même si le serveur met un instant à répondre.
// =============================================================================

export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center py-24">
      <Spinner className="h-10 w-10 text-accent" />
    </main>
  );
}
