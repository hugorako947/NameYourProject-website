"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Spinner } from "./Spinner";

// =============================================================================
// Bouton d'envoi d'un formulaire HTML classique (method="post") : le cercle de
// chargement tourne de l'envoi jusqu'à l'arrivée de la page suivante.
// =============================================================================

export function SubmitButton({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const form = ref.current?.form;
    if (!form) return;
    // L'événement « submit » n'arrive que si le formulaire est valide (champs requis remplis)
    const onSubmit = () => setPending(true);
    // Retour arrière du navigateur : la page revient de son cache, bouton réactivé
    const onPageShow = () => setPending(false);
    form.addEventListener("submit", onSubmit);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      form.removeEventListener("submit", onSubmit);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return (
    <button ref={ref} type="submit" aria-busy={pending} className={className}>
      <span className="inline-flex items-center justify-center gap-2">
        {pending && <Spinner />}
        {children}
      </span>
    </button>
  );
}
