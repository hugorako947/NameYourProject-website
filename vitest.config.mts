import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Tests automatiques : lance-les avec   npx vitest run
// (ou   npx vitest   pour les relancer à chaque modification)
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { environment: "node", include: ["tests/**/*.test.ts"] },
});
