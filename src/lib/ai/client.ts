import { google } from "./provider";
import { APICallError, LoadAPIKeyError, NoObjectGeneratedError, RetryError, generateObject } from "ai";
import { generationResponseSchema } from "./schema";
import { NAMING_INSTRUCTIONS, buildNamingPrompt, type NamingInput } from "./prompts";
import type { GeneratedName } from "@/types";

// =============================================================================
// NameYourProject — Client IA (Vercel AI SDK + Gemini)
//
// Point d'entrée UNIQUE vers l'IA : les routes API passent toujours par
// generateNames(). Changer de modèle ou de fournisseur ne touche que ce fichier.
// =============================================================================

/**
 * Modèles utilisés, essayés DANS L'ORDRE jusqu'à ce que l'un réponde :
 *   1. GEMINI_MODEL (facultatif, dans .env.local) — ex: un modèle Pro payant
 *   2. DEFAULT_MODEL_ID
 *   3. Les modèles de secours (GEMINI_FALLBACK_MODELS dans .env.local, séparés
 *      par des virgules, sinon DEFAULT_FALLBACK_MODEL_IDS ci-dessous)
 *
 * Chez Google, chaque modèle a sa propre capacité ET son propre quota gratuit :
 * quand l'un est surchargé (erreur 503) ou épuisé (erreur 429), le suivant
 * répond généralement. Un modèle en échec est mis de côté quelques instants
 * pour ne pas faire attendre les visiteurs suivants.
 *
 * Liste des modèles de ta version du SDK : cherche "GoogleModelId" dans
 * node_modules/@ai-sdk/google/dist/index.d.ts (puis redémarre le serveur).
 */
const DEFAULT_MODEL_ID = "gemini-3.8-flash";
const DEFAULT_FALLBACK_MODEL_IDS = ["gemini-3.7-flash", "gemini-flash-lite-latest"];

function readModelList(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
}

const configured = readModelList(process.env.GEMINI_MODEL);
const fallbacks = readModelList(process.env.GEMINI_FALLBACK_MODELS);

/** Chaîne complète, sans doublons. */
const MODEL_CHAIN = [
  ...new Set([...configured, DEFAULT_MODEL_ID, ...(fallbacks.length ? fallbacks : DEFAULT_FALLBACK_MODEL_IDS)]),
];

/** Modèle → moment à partir duquel on peut le réessayer. */
const pausedUntil = new Map<string, number>();

const MAX_EXPLANATION_LENGTH = 300;

export class NameGenerationError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "NameGenerationError";
  }
}

/** Traduit une erreur technique en explication claire (affichée dans le terminal). */
function describeAiError(error: unknown, modelId: string): string {
  if (RetryError.isInstance(error)) return describeAiError(error.lastError, modelId);

  if (LoadAPIKeyError.isInstance(error)) {
    return "Clé API Gemini introuvable : vérifie GOOGLE_GENERATIVE_AI_API_KEY dans .env.local, puis redémarre le serveur (Ctrl+C puis npm run dev).";
  }

  if (APICallError.isInstance(error)) {
    const detail = `${error.message}${error.responseBody ? ` — ${error.responseBody.slice(0, 300)}` : ""}`;
    const body = (error.responseBody ?? "").toLowerCase();
    if (error.statusCode === 429 && /limit:\s*0\b/.test(body)) {
      return `Le modèle "${modelId}" n'est pas inclus dans l'offre gratuite de Gemini (quota à 0 : attendre ne changera rien). Supprime la ligne GEMINI_MODEL de .env.local pour revenir à ${DEFAULT_MODEL_ID}, ou active la facturation sur Google AI Studio. [${detail}]`;
    }
    if (error.statusCode === 429) {
      return `Quota Gemini dépassé (trop de requêtes ou limite du jour atteinte). Patiente quelques minutes, ou consulte ton quota sur Google AI Studio. [${detail}]`;
    }
    if (error.statusCode === 401 || error.statusCode === 403 || body.includes("api key")) {
      return `Clé API Gemini refusée : elle est invalide, désactivée ou sans accès à ce modèle. [${detail}]`;
    }
    if (error.statusCode === 404) {
      return `Modèle "${modelId}" introuvable ou non disponible pour ta clé. Essaie un autre modèle via GEMINI_MODEL dans .env.local. [${detail}]`;
    }
    if (error.statusCode && error.statusCode >= 500) {
      return `Service Gemini momentanément surchargé ou indisponible (erreur ${error.statusCode}). Réessaie dans un instant. [${detail}]`;
    }
    return `Appel à Gemini refusé (erreur ${error.statusCode ?? "?"}). [${detail}]`;
  }

  if (NoObjectGeneratedError.isInstance(error)) {
    return `L'IA a répondu dans un format inattendu. Début de sa réponse : ${(error.text ?? "(vide)").slice(0, 300)}`;
  }

  if (error instanceof Error) return `Erreur inattendue : ${error.name} — ${error.message}`;
  return "Erreur inattendue (détail inconnu).";
}

/**
 * Clichés interdits par le cahier des charges : -ify, -ly, Smart…, Pro….
 * L'IA en reçoit la consigne, mais le serveur les écarte aussi, au cas où.
 */
export function isClicheName(nom: string): boolean {
  return /(ify|ly)$/i.test(nom) || /^(smart|pro)/i.test(nom);
}

/** Nettoie la réponse : noms sans espaces, sans doublons ni clichés, explications bornées, `max` au plus. */
export function cleanNames(names: GeneratedName[], max: number): GeneratedName[] {
  const seen = new Set<string>();
  const result: GeneratedName[] = [];
  for (const { nom, explication } of names) {
    const cleanNom = nom.replace(/[\s\-_.]+/g, "").trim();
    const key = cleanNom.toLowerCase();
    if (cleanNom.length < 2 || seen.has(key) || isClicheName(cleanNom)) continue;
    seen.add(key);
    const text = explication.trim();
    result.push({
      nom: cleanNom,
      explication: text.length > MAX_EXPLANATION_LENGTH ? `${text.slice(0, MAX_EXPLANATION_LENGTH - 1)}…` : text,
    });
    if (result.length === max) break;
  }
  return result;
}

/**
 * L'erreur justifie-t-elle d'essayer le modèle suivant ? Si oui, pendant
 * combien de temps mettre ce modèle de côté.
 */
function pauseFor(error: unknown, modelId: string): number | null {
  const e = RetryError.isInstance(error) ? error.lastError : error;
  if (NoObjectGeneratedError.isInstance(e)) return 0; // format raté : un autre modèle peut réussir
  if (!APICallError.isInstance(e)) return null;
  const code = e.statusCode ?? 0;
  const body = (e.responseBody ?? "").toLowerCase();
  if (code === 403 || code === 404) return 10 * 60_000; // modèle inaccessible pour cette clé
  if (code === 429) return /limit:\s*0\b/.test(body) ? 10 * 60_000 : 60_000; // hors offre gratuite / quota
  if (code >= 500) return 30_000; // surcharge passagère chez Google
  void modelId;
  return null;
}

async function callModel(modelId: string, input: NamingInput, maxRetries: number): Promise<GeneratedName[]> {
  const { object } = await generateObject({
    model: google(modelId),
    schema: generationResponseSchema,
    instructions: NAMING_INSTRUCTIONS,
    prompt: buildNamingPrompt(input),
    temperature: 0.9,
    maxRetries,
  });
  return cleanNames(object.names, input.count);
}

function fail(modelId: string, reason: string, cause?: unknown, label = "la génération"): never {
  console.error(`[IA] Échec de ${label} (modèle ${modelId}) → ${reason}`);
  throw new NameGenerationError(reason, cause);
}

/**
 * Exécute une tâche IA en essayant les modèles de MODEL_CHAIN dans l'ordre
 * (surcharge, quota épuisé, modèle inaccessible → modèle suivant).
 * La tâche renvoie null si la réponse est inexploitable (on essaie alors le
 * modèle suivant). Partagé par la génération de noms et l'analyse d'un nom.
 *
 * @throws {NameGenerationError} si aucun modèle n'a pu répondre
 */
export async function runWithModelChain<T>(
  task: (modelId: string, maxRetries: number) => Promise<T | null>,
  label: string
): Promise<T> {
  const now = Date.now();
  const available = MODEL_CHAIN.filter((m) => (pausedUntil.get(m) ?? 0) <= now);
  // Si tous sont en pause, on retente quand même toute la chaîne
  const chain = available.length > 0 ? available : MODEL_CHAIN;

  let lastModel = chain[0];
  let lastReason = "Aucun modèle n'a pu répondre.";
  let lastError: unknown;

  for (let i = 0; i < chain.length; i++) {
    const modelId = chain[i];
    const isLast = i === chain.length - 1;
    try {
      // Un seul appel par modèle (passer au suivant est plus rapide que
      // réessayer le même) ; une nouvelle tentative pour le dernier recours.
      const result = await task(modelId, isLast ? 1 : 0);
      if (result !== null) {
        if (i > 0) console.info(`[IA] ${label} réussie avec le modèle de secours ${modelId}.`);
        return result;
      }
      lastModel = modelId;
      lastReason = "L'IA a renvoyé une réponse inexploitable.";
    } catch (error) {
      const reason = describeAiError(error, modelId);
      const pause = pauseFor(error, modelId);
      if (pause === null) fail(modelId, reason, error, label); // erreur non liée au modèle : inutile d'insister
      if (pause > 0) pausedUntil.set(modelId, Date.now() + pause);
      lastModel = modelId;
      lastReason = reason;
      lastError = error;
      if (!isLast) console.warn(`[IA] Modèle ${modelId} indisponible → essai avec ${chain[i + 1]}. Cause : ${reason}`);
    }
  }

  fail(lastModel, `Tous les modèles ont échoué. Dernière cause : ${lastReason}`, lastError, label);
}

/**
 * Appelle l'IA pour générer `input.count` noms. Aucune vérification de quota
 * ici : c'est la route API qui s'en charge, toujours AVANT cet appel.
 *
 * @throws {NameGenerationError} si aucun modèle n'a pu répondre
 */
export async function generateNames(input: NamingInput): Promise<GeneratedName[]> {
  return runWithModelChain(async (modelId, maxRetries) => {
    const names = await callModel(modelId, input, maxRetries);
    return names.length > 0 ? names : null;
  }, "la génération");
}
