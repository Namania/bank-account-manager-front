import path from "path"
import { fileURLToPath } from "url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import packageJson from "./package.json" with { type: "json" }

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The version shown in the sidebar.
  define: {
    // A release build passes its own number in APP_VERSION.
    __APP_VERSION__: JSON.stringify(process.env.APP_VERSION || packageJson.version),
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
