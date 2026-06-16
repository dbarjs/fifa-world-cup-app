import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  // Resolve Nuxt's #shared alias for unit tests, which import server/app code
  // directly without booting Nuxt. The e2e suite builds the real app, which
  // resolves #shared itself.
  resolve: {
    alias: { '#shared': fileURLToPath(new URL('./shared', import.meta.url)) },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    // The e2e suite builds and boots the Nuxt app.
    testTimeout: 60_000,
    hookTimeout: 180_000,
  },
})
