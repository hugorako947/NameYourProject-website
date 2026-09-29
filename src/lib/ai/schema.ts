import { z } from "zod";

// =============================================================================
// NameYourProject — Format de réponse imposé à l'IA (via generateObject)
//
// Volontairement TOLÉRANT : si l'IA renvoie 9 ou 11 noms, ou une explication
// un peu longue, on corrige ensuite (voir client.ts → cleanNames) au lieu de
// faire échouer toute la génération. La consigne sur le nombre de noms reste
// dans le prompt ; ce schéma sert de garde-fou, pas de piège.
// =============================================================================

export const generatedNameSchema = z.object({
  nom: z.string().min(1).describe("Le nom proposé, en PascalCase, sans espaces ni tirets"),
  explication: z
    .string()
    .min(1)
    .describe("Une courte phrase expliquant l'origine du nom et sa pertinence pour le projet"),
});

// generateObject attend un objet à la racine, d'où l'enveloppe { names: [...] }
export const generationResponseSchema = z.object({
  names: z.array(generatedNameSchema).min(1).max(40).describe("Exactement le nombre de noms demandé."),
});

export type GeneratedNameSchema = z.infer<typeof generatedNameSchema>;
export type GenerationResponseSchema = z.infer<typeof generationResponseSchema>;
