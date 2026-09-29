import { paymentsStatus } from "@/lib/stripe";
import { hasPersistentStore } from "@/lib/redis";
import { turnstileEnabled } from "@/lib/turnstile";
import type { ActiveServices } from "@/lib/legal-content";

// Services réellement actifs selon les clés configurées : les pages légales
// s'en servent pour ne décrire comme actifs que les services utilisés.
export function activeServices(): ActiveServices {
  return {
    payments: paymentsStatus().enabled,
    emails: !!process.env.RESEND_API_KEY?.trim(),
    sharedStore: hasPersistentStore,
    antiBot: turnstileEnabled(),
  };
}
