import { defineConfig } from "vite";

// Use relative asset URLs so the game loads correctly from the /extraction-game subpath
export default defineConfig({
  base: "./",
});
