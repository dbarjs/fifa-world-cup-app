import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    // The e2e suite builds and boots the Nuxt app.
    testTimeout: 60_000,
    hookTimeout: 180_000,
  },
})
