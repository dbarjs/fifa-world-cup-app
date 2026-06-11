// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    // Match Source fetched at request time; override with NUXT_MATCH_SOURCE_URL.
    matchSourceUrl: 'https://raw.githubusercontent.com/dbarjs/fifa-world-cup-app/main/data/matches.json'
  }
})
