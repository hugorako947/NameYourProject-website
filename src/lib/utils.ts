import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// =============================================================================
// NameYourProject — Utilitaire de fusion de classes Tailwind
//
// Permet d'écrire des classes conditionnelles (clsx) sans conflits entre
// classes Tailwind qui se contredisent (tailwind-merge), ex:
// cn("px-4", condition && "px-6") → ne garde que "px-6", pas les deux.
// =============================================================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
