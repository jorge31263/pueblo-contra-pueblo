import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  test: {
    // El juego se prueba en un navegador simulado; el pipeline es un script de
    // Node y en jsdom pierde el acceso a los ficheros de prueba.
    environment: "jsdom",
    environmentMatchGlobs: [["pipeline/**", "node"]],
    globals: false,
    setupFiles: ["./src/pruebas/preparar.ts"],
    include: ["pipeline/**/*.test.ts", "src/**/*.test.{ts,tsx}"],
  },
});
