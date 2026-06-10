<script setup lang="ts">
import calculateCountdown from '~/helpers/calculateCountdown'

const runtimeConfig = useRuntimeConfig()
const EVENT_DATE = computed(() => new Date(runtimeConfig.public.EVENT_DATE))

const countdown = ref<string>(calculateCountdown(EVENT_DATE.value))

onBeforeMount(() => {
  const currCountdown = calculateCountdown(EVENT_DATE.value)

  const interval = setInterval(
    () => {
      countdown.value = calculateCountdown(EVENT_DATE.value)
    },
    currCountdown.includes('.') ? 1 : 1000
  )

  onBeforeUnmount(() => {
    clearInterval(interval)
  })
})
</script>

<template>
  <h2 class="!my-0">
    Czas do wydarzenia: <span>{{ countdown }}</span>
  </h2>
</template>
