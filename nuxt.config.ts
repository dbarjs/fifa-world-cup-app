// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Match Source fetched at request time; override with NUXT_MATCH_SOURCE_URL.
    matchSourceUrl: 'https://raw.githubusercontent.com/dbarjs/fifa-world-cup-app/main/data/matches.json',
    // Server-side cache TTL for the Match Source fetch, also published as
    // s-maxage; override with NUXT_MATCH_SOURCE_TTL_SECONDS.
    matchSourceTtlSeconds: 300
  }
})
