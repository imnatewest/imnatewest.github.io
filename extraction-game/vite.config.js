import { defineConfig } from "vite";

// Use relative asset URLs so the game works from the /extraction-game subpath on the portfolio site
export default defineConfig({
  base: "./",
});
