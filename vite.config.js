import path from "path"
import { fileURLToPath } from "url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import packageJson from "./package.json" with { type: "json" }

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Single source for the version shown in the sidebar.
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  // Listens on localhost only. Use `npm run dev -- --host` to expose it on the network.
  server: {
    port: 8080,
  },
  test: {
    include: ["src/**/*.test.js", "tests/**/*.test.js"],
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
