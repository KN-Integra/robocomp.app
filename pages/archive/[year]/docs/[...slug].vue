<script setup lang="ts">
import EmptyDoc from '~/components/slots/empty-doc.vue'
import NotFound from '~/components/slots/not-found.vue'
</script>

<template>
  <div class="docs-page content-page markdown-content flex flex-col flex-1">
    <main class="container flex-1 mx-auto my-8 px-4 lg:px-0">
      <content-doc>
        <template #not-found>
          <not-found />
        </template>

        <template #empty>
          <empty-doc />
        </template>
      </content-doc>
    </main>

    <AppFooter class="mt-auto" />
  </div>
</template>
