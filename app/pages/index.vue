<script setup lang="ts">
const requestURL = useRequestURL()
const links = buildSubscribeLinks(requestURL.origin)

useHead({ title: 'FIFA World Cup 2026 Calendar' })

const copied = ref(false)
let resetCopied: ReturnType<typeof setTimeout> | undefined

async function copyFeedUrl() {
  await navigator.clipboard.writeText(links.feedUrl)
  copied.value = true
  clearTimeout(resetCopied)
  resetCopied = setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <UPage>
    <UPageHero
      title="FIFA World Cup 2026 in your calendar"
      description="Subscribe once and get all 104 matches. Knockout fixtures appear as placeholders (e.g. “1A vs 2B”) and update automatically in your calendar as teams qualify."
    >
      <template #headline>
        <img
          src="/icon.png"
          alt=""
          class="mx-auto size-24 rounded-3xl shadow-lg ring ring-default"
        >
      </template>

      <template #links>
        <UButton
          :to="links.google"
          target="_blank"
          icon="i-simple-icons-googlecalendar"
          size="xl"
          label="Add to Google Calendar"
        />
        <UButton
          :to="links.apple"
          icon="i-simple-icons-apple"
          size="xl"
          color="neutral"
          variant="subtle"
          label="Add to Apple Calendar"
        />
      </template>

      <div class="mx-auto w-full max-w-xl space-y-2">
        <p class="text-sm text-muted">
          Using Outlook, Thunderbird or another client? Subscribe to the feed URL directly:
        </p>
        <UFieldGroup class="w-full">
          <UInput
            :model-value="links.feedUrl"
            readonly
            class="flex-1 font-mono"
            aria-label="Calendar Feed URL"
          />
          <UButton
            :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
            color="neutral"
            variant="subtle"
            :label="copied ? 'Copied' : 'Copy'"
            @click="copyFeedUrl"
          />
        </UFieldGroup>
      </div>
    </UPageHero>
  </UPage>
</template>
