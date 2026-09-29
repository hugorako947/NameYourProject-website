import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/i18n";
import { SharedFavorites } from "@/components/SharedFavorites";

// NameYourProject — /favoris#… : sélection de noms reçue par lien de partage.
// Le contenu est dans le lien (après « # ») : rien n'est stocké sur le serveur.

export const metadata: Metadata = { title: SITE_NAME, robots: { index: false, follow: false } };

export default function SharedFavoritesPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-12 sm:px-10">
      <SharedFavorites />
    </main>
  );
}
