import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// The source icon has transparent rounded corners; maskable and apple
// variants need those filled, so use the icon's own blue as backdrop.
const background = '#143362'

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: {
      sizes: [512],
      resizeOptions: { background },
    },
    apple: {
      sizes: [180],
      resizeOptions: { background },
    },
  },
  images: ['public/icon.png'],
})
