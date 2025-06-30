<script setup lang="ts">
const router = useRouter()
if (history.state.success === undefined) {
  router.push('/registration')
}
const isSuccess = history.state.success === true
const teamName = history.state.teamName as string | undefined
</script>

<template>
  <div class="text-center p-4">
    <div v-if="isSuccess && teamName" class="text-green-700">
      <h1 class="text-2xl font-bold">Wszystko się udało</h1>
      <p class="mt-2">
        Otrzymaliśmy Twoje zgłoszenie drużyny <strong>{{ teamName }}</strong
        >.
      </p>
      <p class="mt-1">Zaraz zostanie wysłany e-mail potwierdzający.</p>
    </div>

    <div v-else class="text-red-600">
      <h1 class="text-2xl font-bold">Wystąpił niespotykany problem</h1>
      <p class="mt-2">Proszę spróbować jeszcze raz lub skontaktować się z nami mailowo.</p>
    </div>
  </div>
</template>
