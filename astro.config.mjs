// @ts-check
import { defineConfig, envField} from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import node from "@astrojs/node";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 4321 },
  vite: {
    plugins: [tailwindcss()],
  },
  // adapter: node({
  //   mode: "standalone",
  // }),
  adapter: cloudflare(),
  env: {
    schema: {
      SUPABASE_URL: envField.string({ context: "server", access: "secret" }),
      SUPABASE_KEY: envField.string({ context: "server", access: "secret" }),
      OPENROUTER_API_KEY: envField.string({ context: "server", access: "secret" }),
      AI_MODELNAME: envField.string({ context: "server", access: "public", default: "openai/gpt-4o-mini" }),
    }
  },
});