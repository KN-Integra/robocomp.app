<script setup lang="ts">
const $props = defineProps<{
  logoSize?: 'small' | 'medium' | 'large'
  linkType?: 'internal' | 'external'
}>()

interface IPartner {
  name: string
  logo: string
  url: string
  internalName: string
  type: 'gold' | 'silver' | 'bronze' | 'media' | 'support' | 'honorary' | 'medical' | 'cultural'
}

const $route = useRoute()
const imgPathPrefix = computed(() =>
  $route.path.startsWith('/archive') ? `/archive/${$route.path.split('/')[2]}` : ''
)

enum TypeToDisplay {
  gold = 'Złoci Partnerzy',
  silver = 'Srebrni Partnerzy',
  bronze = 'Brązowi Partnerzy',
  medical = 'Opieka Medyczna',
  media = 'Patroni Medialni',
  honorary = 'Patronat Honorowy',
  cultural = 'Patronat Kulturalny',
  support = 'Wsparcie Wydarzenia'
}

const { status, data: partners } = useAsyncData<Record<string, IPartner[]>>('partners', async () => {
  const data = await $fetch(imgPathPrefix.value + '/partners/partners.txt')

  if (!data) {
    return {
      gold: [],
      silver: [],
      bronze: [],
      medical: [],
      media: [],
      honorary: [],
      cultural: [],
      support: []
    }
  }

  const partnerData = JSON.parse(data as string) as IPartner[]

  const mappedPartnerData = {
    gold: partnerData.filter((partner) => partner.type === 'gold'),
    silver: partnerData.filter((partner) => partner.type === 'silver'),
    bronze: partnerData.filter((partner) => partner.type === 'bronze'),
    medical: partnerData.filter((partner) => partner.type === 'medical'),
    media: partnerData.filter((partner) => partner.type === 'media'),
    honorary: partnerData.filter((partner) => partner.type === 'honorary'),
    cultural: partnerData.filter((partner) => partner.type === 'cultural'),
    support: partnerData.filter((partner) => partner.type === 'support')
  }

  for (const type in mappedPartnerData) {
    if (mappedPartnerData[type as keyof typeof mappedPartnerData].length === 0) {
      delete mappedPartnerData[type as keyof typeof mappedPartnerData]
    }
  }

  return mappedPartnerData
})

onMounted(() => {
  const interval = setInterval(async () => {
    await refreshNuxtData('partners')

    if (status.value === 'success') {
      clearInterval(interval)
    }
  }, 500)

  onBeforeUnmount(() => {
    clearInterval(interval)
  })
})
</script>

<template>
  <div
    v-if="partners"
    class="z-0 flex flex-col items-center gap-8 py-8 big-footer"
    :class="{
      'small-logo': $props.logoSize === 'small',
      'large-logo': $props.logoSize === 'large'
    }"
  >
    <div class="flex flex-col items-center gap-8">
      <div class="mt-6 primary-header">Organizatorzy</div>

      <span class="inline-flex flex-wrap justify-center gap-8">
        <span class="flex flex-col items-center">
          <NuxtLink
            to="https://www.agh.edu.pl/"
            target="_blank"
            rel="noopener noreferrer"
            class="partner-logo"
            :style="`background-image: url('${imgPathPrefix}/logo/agh${$props.logoSize === 'small' ? '' : '-text'}.jpg')`"
          >
            <span class="sr-only">Akademia Górniczo-Hutnicza</span>
          </NuxtLink>

          <span v-if="$props.logoSize !== 'small'" class="text-lg font-bold">Akademia</span>
          <span v-if="$props.logoSize !== 'small'" class="text-lg font-bold">Górniczo-Hutnicza</span>
        </span>

        <span class="flex flex-col items-center">
          <NuxtLink
            to="https://www.eaiib.agh.edu.pl/"
            target="_blank"
            rel="noopener noreferrer"
            class="partner-logo"
            :style="`background-image: url('${imgPathPrefix}/logo/weaiib.jpg')`"
          >
            <span class="sr-only">Wydział Elektrotechniki, Automatyki, Informatyki i Inżynierii Biomedycznej</span>
          </NuxtLink>

          <span v-if="$props.logoSize !== 'small'" class="text-lg">Wydział</span>
          <span v-if="$props.logoSize !== 'small'" class="text-sm font-bold"> Elektrotechniki, </span>
          <span v-if="$props.logoSize !== 'small'" class="text-sm font-bold"> Automatyki, Informatyki </span>
          <span v-if="$props.logoSize !== 'small'" class="text-sm font-bold"> i Inżynierii Biomedycznej </span>
        </span>

        <span class="flex flex-col items-center">
          <NuxtLink
            to="https://kair.agh.edu.pl/"
            target="_blank"
            rel="noopener noreferrer"
            class="partner-logo"
            :style="`background-image: url('${imgPathPrefix}/logo/kair.jpg')`"
          >
            <span class="sr-only">Katedra Automatyki i Robotyki</span>
          </NuxtLink>

          <span v-if="$props.logoSize !== 'small'" class="text-lg">Katedra</span>
          <span v-if="$props.logoSize !== 'small'" class="text-xl font-bold">Automatyki i Robotyki</span>
        </span>

        <span class="flex flex-col items-center">
          <NuxtLink
            :to="$props.linkType === 'internal' ? '/blog/about' : 'http://www.integra.agh.edu.pl/'"
            :target="$props.linkType === 'internal' ? '_self' : '_blank'"
            rel="noopener noreferrer"
            class="partner-logo"
            :style="`background-image: url('${imgPathPrefix}/logo/integra.png')`"
          >
            <span class="sr-only">Koło Naukowe INTEGRA</span>
          </NuxtLink>

          <span v-if="$props.logoSize !== 'small'" class="text-lg">Koło Naukowe</span>
          <span v-if="$props.logoSize !== 'small'" class="text-xl font-bold">INTEGRA</span>
        </span>

        <span class="flex flex-col items-center">
          <NuxtLink
            to="https://inuni.org.pl"
            target="_blank"
            rel="noopener noreferrer"
            class="partner-logo"
            :style="`background-image: url('${imgPathPrefix}/logo/inuni.png')`"
          >
            <span class="sr-only">Fundacja InUnI</span>
          </NuxtLink>

          <span v-if="$props.logoSize !== 'small'" class="text-xl font-bold">Fundacja InUnI</span>
        </span>

        <span class="flex flex-col items-center">
          <NuxtLink
            to="https://drone.agh.edu.pl/"
            target="_blank"
            rel="noopener noreferrer"
            class="partner-logo"
            :style="`background-image: url('${imgPathPrefix}/logo/agh-drone-engineering.png')`"
          >
            <span class="sr-only">AGH Drone Engineering</span>
          </NuxtLink>

          <span v-if="$props.logoSize !== 'small'" class="text-xl font-bold">AGH Drone Engineering</span>
        </span>

        <span class="flex flex-col items-center">
          <NuxtLink
            to="https://www.facebook.com/polishroboticsgroup/"
            target="_blank"
            rel="noopener noreferrer"
            class="partner-logo"
            :style="`background-image: url('${imgPathPrefix}/logo/prg.svg')`"
          >
            <span class="sr-only">Polish Robotics Group</span>
          </NuxtLink>

          <span v-if="$props.logoSize !== 'small'" class="text-xl font-bold">Polish Robotics Group</span>
        </span>
      </span>
    </div>

    <div v-for="(partnerList, type) in partners" :key="type">
      <div v-if="partnerList.length" class="flex flex-col items-center gap-8">
        <div class="mt-6 primary-header">{{ TypeToDisplay[type as keyof typeof TypeToDisplay] }}</div>

        <span class="inline-flex flex-wrap justify-center gap-8">
          <span v-for="partner in partnerList" :key="partner.internalName" class="flex flex-col items-center">
            <NuxtLink
              :to="$props.linkType === 'internal' ? `/partners/${partner.internalName}` : partner.url"
              :target="$props.linkType === 'internal' ? '_self' : '_blank'"
              rel="noopener noreferrer"
              class="partner-logo"
              :style="`background-image: url('${imgPathPrefix}${partner.logo}')`"
            >
              <span class="sr-only">{{ partner.name }}</span>
            </NuxtLink>

            <span
              v-if="$props.logoSize !== 'small' || type === 'honorary'"
              class="w-48 text-xl font-bold text-center text-wrap"
              v-html="partner.name"
            ></span>
          </span>
        </span>
      </div>

      <div v-else class="-mt-8">Ładowanie...</div>
    </div>
  </div>
</template>
