// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],

  pwa: {
    registerType: 'autoUpdate',
    // Icons are generated from public/icon.png at build time;
    // see pwa-assets.config.ts.
    pwaAssets: { config: true },
    manifest: {
      name: 'FIFA World Cup 2026 Calendar',
      short_name: 'WC 2026',
      description: 'Subscribe to all 104 FIFA World Cup 2026 matches in your calendar.',
      theme_color: '#143362',
      background_color: '#143362',
    },
  },

  runtimeConfig: {
    // Match Source fetched at request time; override with NUXT_MATCH_SOURCE_URL.
    matchSourceUrl: 'https://raw.githubusercontent.com/dbarjs/fifa-world-cup-app/main/data/matches.json',
    // Server-side cache TTL for the Match Source fetch, also published as
    // s-maxage; override with NUXT_MATCH_SOURCE_TTL_SECONDS.
    matchSourceTtlSeconds: 300
  },
})
