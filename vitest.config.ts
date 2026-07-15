import path from "node:path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@\/components\/ui\/(.*)$/,
        replacement: path.resolve(__dirname, "registry/new-york/ui/$1"),
      },
      {
        find: "@/lib/utils",
        replacement: path.resolve(__dirname, "registry/test-support/utils.ts"),
      },
    ],
  },
  test: {
    environment: "jsdom",
    include: ["tests/components/**/*.test.tsx"],
    setupFiles: ["tests/components/setup.ts"],
  },
})
