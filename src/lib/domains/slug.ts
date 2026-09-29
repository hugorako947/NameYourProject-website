// =============================================================================
// Nom généré → partie gauche d'un nom de domaine. Ex: "Écholab" → "echolab"
// Partagé par le serveur (tri des noms) et le navigateur (vérification .fr).
// =============================================================================

export function toDomainSlug(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}
