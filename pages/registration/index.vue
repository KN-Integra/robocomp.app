<script setup lang="ts">
import { FwbButton, FwbInput, FwbSelect, FwbCheckbox } from 'flowbite-vue'

import type { IsExistTeamResponse } from '~/server/api/isExistTeam/index.get'
import type { RegistrationRequest, RegistrationResponse } from '~/server/api/registration/index.post'

import { REGISTRATION_END_DATE, TSHIRT_END_DATE } from '~/settings/constants'

interface Participant {
  name: string
  surname: string
  shirtSize: string
}

interface Robot {
  name: string
  category: string
}

const shirtSizes = computed(
  () => (
    new Date(TSHIRT_END_DATE) < new Date()
      ? ['N/A']
      : ['S', 'M', 'L', 'XL', 'XXL']
  ).map((v) => ({ value: v, name: v }))
)

const maxParticipants = 10
const maxRobots = 5

const teamName = ref('')

const captain = reactive({
  name: '',
  surname: '',
  shirtSize: '',
  email: '',
  phone: '',
  street: '',
  postalCode: '',
  city: '',
  country: ''
})

const participants = ref<Participant[]>([])
const robots = ref<Robot[]>([])

const categories = ref<{ name: string; value: string }[]>([])
const countries = ref<{ name: string; value: string }[]>([])

const agreePrivacy = ref(false)
const agreeTerms = ref(false)

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

watch(teamName, (newVal) => {
  validations.teamName.message.value = ''
  validations.teamName.status.value = ''

  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  if (newVal.length === 0) {
    validations.teamName.message.value = 'Podaj nazwę drużyny.'
    validations.teamName.status.value = 'error'
    return
  }
  if (newVal.length > 50) {
    validations.teamName.message.value = 'Nazwa musi mieć długość mniejszą niż 50 liter.'
    validations.teamName.status.value = 'error'
    return
  }

  debounceTimeout = setTimeout(async () => {
    try {
      const isTaken = await checkTeamNameExist(newVal)
      if (isTaken) {
        validations.teamName.message.value = 'Ta nazwa jest już zajęta.'
        validations.teamName.status.value = 'error'
      } else {
        validations.teamName.message.value = undefined
        validations.teamName.status.value = ''
      }
    } catch (error) {
      validations.teamName.message.value = 'Błąd połączenia z serwerem.'
      validations.teamName.status.value = 'error'
    }
  }, 500)
})

async function checkTeamNameExist(name: string) {
  try {
    const res = await fetch(`/api/isExistTeam?name=${encodeURIComponent(name)}`, {
      method: 'GET'
    })

    const data: IsExistTeamResponse = await res.json()
    return data.data.isExist
  } catch (error) {
    console.error('Błąd przy rejestracji:', error)
    return false
  }
}

function addParticipant() {
  if (participants.value.length + 1 < maxParticipants) {
    participants.value.push({ name: '', surname: '', shirtSize: '' })
  }
}

function removeParticipant(index: number) {
  participants.value.splice(index, 1)
}

function addRobot() {
  if (robots.value.length < maxRobots) {
    robots.value.push({ name: '', category: '' })
  }
}

function removeRobot(index: number) {
  robots.value.splice(index, 1)
}

const $formRef = ref<HTMLFormElement>()

const validations = {
  teamName: {
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj nazwę drużyny'
  },
  captainFirstName: {
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj imię kapitana'
  },
  captainLastName: {
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj nazwisko kapitana'
  },
  captainEmail: {
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj adres e-mail kapitana'
  },
  captainPhone: {
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj numer telefonu kapitana'
  },
  captainStreet: {
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj ulicę kapitana'
  },
  captainPostalCode: {
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj kod pocztowy kapitana'
  },
  captainCity: {
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj miasto kapitana'
  },
  captainCountry: {
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj kraj pochodzenia kapitana'
  },
  captainShirt: {
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj rozmiar koszulki kapitana'
  },
  participantFirstName: Array.from({ length: maxParticipants }, () => ({
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj imię zawodnika'
  })),
  participantLastName: Array.from({ length: maxParticipants }, () => ({
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj nazwisko zawodnika'
  })),
  participantShirt: Array.from({ length: maxParticipants }, () => ({
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj rozmiar koszulki zawodnika'
  })),
  robotName: Array.from({ length: maxRobots }, () => ({
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Podaj nazwę robota'
  })),
  robotCategory: Array.from({ length: maxRobots }, () => ({
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Wybierz kategorię robota'
  })),
  agreePrivacy: {
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Musisz wyrazić zgodę na przetwarzanie danych osobowych'
  },
  agreeTerms: {
    status: ref<'success' | 'error' | ''>(''),
    message: ref(),
    errorMessage: 'Musisz zaakceptować regulamin zawodów'
  }
}

function resetValidation(e: Event) {
  const element = e.target as HTMLFormElement

  const splitName = element.name.split('-')
    const key = splitName[0] as keyof typeof validations
    const idx = Number(splitName[1])

  if (!(key in validations)) {
    console.warn(`No validation found for key: ${key}`)
    return
  }

  if (Array.isArray(validations[key])) {
    validations[key][idx].status.value = ''
    validations[key][idx].message.value = ''
  } else {
    validations[key].status.value = ''
    validations[key].message.value = ''
  }
}

async function submitForm() {
  if (!$formRef.value) return

  const formData = new FormData($formRef.value)

  for (const k of formData.keys()) {
    console.debug(`${k}: ${formData.get(k)}`)
  }

  for (const el of $formRef.value.elements) {
    const element = el as HTMLFormElement

    const splitName = element.name.split('-')
    const key = splitName[0] as keyof typeof validations
    const idx = Number(splitName[1])

    if (![...formData.keys()].includes(element.name)) {
      continue
    }

    console.debug(`Validating ${element.name} with value: ${element.value}`, validations[key], key)

    if (!element.value && validations[key]) {
      element.focus()

      if (Array.isArray(validations[key])) {
        element.setCustomValidity(validations[key][idx].errorMessage)
        validations[key][idx].status.value = 'error'
        validations[key][idx].message.value = validations[key][idx].errorMessage
      } else {
        element.setCustomValidity(validations[key].errorMessage)
        validations[key].status.value = 'error'
        validations[key].message.value = validations[key].errorMessage
      }

      return
    }
  }

  if (!captain.shirtSize) {
    const element = document.querySelector('div[name="captainShirtSize"] select') as HTMLSelectElement
    element.focus()
    element.setCustomValidity(validations.captainShirt.errorMessage)
    validations.captainShirt.status.value = 'error'
    validations.captainShirt.message.value = validations.captainShirt.errorMessage

    return
  }

  if (!captain.country) {
    const element = document.querySelector('div[name="captainCountry"] select') as HTMLSelectElement
    element.focus()
    element.setCustomValidity(validations.captainCountry.errorMessage)
    validations.captainCountry.status.value = 'error'
    validations.captainCountry.message.value = validations.captainCountry.errorMessage

    return
  }

  for (const el of document.querySelectorAll('div[name^="participant"] select')) {
    const element = el as HTMLSelectElement

    if (!element.value) {
      element.focus()
      element.setCustomValidity(validations.participantShirt[Number(element.name.split('-')[1])].errorMessage)
      validations.participantShirt[Number(element.name.split('-')[1])].status.value = 'error'
      validations.participantShirt[Number(element.name.split('-')[1])].message.value = validations.participantShirt[Number(element.name.split('-')[1])].errorMessage

      return
    }
  }

  if (!$formRef.value.querySelectorAll('input[name^="robot"]').length) {
    addRobot()
    alert('Proszę dodać co najmniej jednego robota')

    const element: HTMLInputElement | null = $formRef.value.querySelector('input[name^="robot"]')
    if (element) element.focus()

    return
  }

  for (const el of document.querySelectorAll('div[name^="robot"] select')) {
    const element = el as HTMLSelectElement

    if (!element.value) {
      element.focus()
      element.setCustomValidity(validations.robotCategory[Number(element.name.split('-')[1])].errorMessage)
      validations.robotCategory[Number(element.name.split('-')[1])].status.value = 'error'
      validations.robotCategory[Number(element.name.split('-')[1])].message.value = validations.robotCategory[Number(element.name.split('-')[1])].errorMessage

      return
    }
  }

  if (!agreePrivacy.value) {
    const element = document.querySelector('input[name="agreePrivacy"]') as HTMLInputElement
    element.focus()
    element.setCustomValidity(validations.agreePrivacy.errorMessage)

    return
  }

  if (!agreeTerms.value) {
    const element = document.querySelector('input[name="agreeTerms"]') as HTMLInputElement
    element.focus()
    element.setCustomValidity(validations.agreeTerms.errorMessage)

    return
  }

  const payload: RegistrationRequest = {
    teamName: teamName.value,
    captain,
    participants: participants.value,
    robots: robots.value,
    agreePrivacy: agreePrivacy.value,
    agreeTerms: agreeTerms.value
  }

  try {
    const response = await $fetch<RegistrationResponse>('/api/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: payload
    })

    await navigateTo({
      path: '/registration/finish',
      state: {
        success: response.statusCode === 200,
        teamName: teamName.value,
        email: captain.email
      }
    })
  } catch (error) {
    console.error('Błąd przy rejestracji:', error)
    alert('Wystąpił błąd przy wysyłaniu formularza.')
  }
}

onMounted(async () => {
  try {
    const { data } = await $fetch('/api/competition')

    if (!(data && 'competitions' in data)) {
      throw new Error('No competition data found')
    }

    categories.value = (
      data.competitions.filter((c) => c.scoring_method).map((element) => [element.display_name, element.name]) || []
    )
      .sort(([_dnA, nameA]: string[], [_dbB, nameB]: string[]) => nameA > nameB ? 1 : -1)
      .map((v) => ({
        value: v[1],
        name: v[0]
      }))
  } catch (error) {
    console.error('Error in loading robots categories:', error)
  }

  try {
    const { data } = await $fetch('/api/countries')

    if (!(data && 'countries' in data)) {
      throw new Error('No country data found')
    }

    countries.value = (data.countries.map((element) => [element.name, element.code]) || []).map((v) => ({
      value: v[1],
      name: v[0]
    }))
  } catch (error) {
    console.error('Error in loading countries:', error)
  }
})
</script>

<style lang="css">
.form-container .form-input > div {
  @apply !bg-transparent border-none rounded-none;
}

.form-container .form-input input,
.form-container .form-input select {
  @apply bg-neutral-100 border border-neutral-300 focus:ring-0 rounded-md text-black placeholder:text-neutral-400;
}

.form-container .form-input span:not(.text-red-500) {
  @apply text-black;
}

.form-container .form-input p {
  @apply mb-2 !mt-0;
}
</style>

<template>
  <div class="container max-w-4xl px-4 py-8 mx-auto">
    <h1 class="mb-2 text-2xl font-bold">Formularz rejestracyjny</h1>
    <div v-if="new Date() > new Date(REGISTRATION_END_DATE)" class="p-4 mb-6 text-red-800 bg-red-200 border border-red-300 rounded">
      <h2 class="mb-2 text-xl font-bold">Rejestracja została zakończona</h2>
      <p>Rejestracja na Festiwal Robotyki ROBOCOMP 2025 została zakończona. Dziękujemy za zainteresowanie i zapraszamy do udziału w przyszłych edycjach!</p>
    </div>

    <form v-else ref="$formRef" class="form-container" @submit.prevent="submitForm">
      <h2 class="mb-6 text-xl italic">Rejestracja jest otwarta do <span class="underline">{{ new Date(REGISTRATION_END_DATE).toLocaleString() }}</span></h2>
      <span v-if="new Date(TSHIRT_END_DATE) < new Date()" class="-mt-4 mb-4 underline text-red-500">Osoby zarejestrowane po {{ new Date(TSHIRT_END_DATE).toLocaleString() }} z przyczyn technicznych nie dostaną koszulek</span>

      <div class="mb-4">
        <label class="block mb-1 font-semibold">Nazwa zespołu</label>
        <fwb-input
          v-model="teamName"
          type="text"
          name="teamName"
          placeholder="Nazwa zespołu"
          wrapper-class="form-input"
          :validation-status="validations.teamName.status.value as any"
          :required="true"
          @change="resetValidation"
        >
          <template #validationMessage>
            <span
              class="text-xs font-bold"
              :class="validations.teamName.status.value === 'success' ? 'text-green-500' : 'text-red-500'"
            >
              {{ validations.teamName.message.value }}
            </span>
          </template>
        </fwb-input>
      </div>

      <div class="mb-6">
        <h2 class="mb-2 font-semibold">Kapitan</h2>
        <fwb-input
          v-model="captain.name"
          type="text"
          name="captainFirstName"
          placeholder="Imię"
          wrapper-class="form-input"
          :validation-status="validations.captainFirstName.status.value as any"
          :required="true"
          @change="resetValidation"
        >
          <template #validationMessage>
            <span
              class="text-xs font-bold"
              :class="validations.captainFirstName.status.value === 'success' ? 'text-green-500' : 'text-red-500'"
            >
              {{ validations.captainFirstName.message.value }}
            </span>
          </template>
        </fwb-input>

        <fwb-input
          v-model="captain.surname"
          type="text"
          name="captainLastName"
          placeholder="Nazwisko"
          wrapper-class="form-input"
          :validation-status="validations.captainLastName.status.value as any"
          :required="true"
          @change="resetValidation"
        >
          <template #validationMessage>
            <span
              class="text-xs font-bold"
              :class="validations.captainLastName.status.value === 'success' ? 'text-green-500' : 'text-red-500'"
            >
              {{ validations.captainLastName.message.value }}
            </span>
          </template>
        </fwb-input>

        <fwb-select
          v-model="captain.shirtSize"
          name="captainShirtSize"
          class="w-full mb-2 form-input"
          :options="shirtSizes"
          placeholder="Wybierz rozmiar"
          :validation-status="validations.captainShirt.status.value as any"
        >
          <template #validationMessage>
            <span
              class="text-xs font-bold"
              :class="validations.captainShirt.status.value === 'success' ? 'text-green-500' : 'text-red-500'"
            >
              {{ validations.captainShirt.message.value }}
            </span>
          </template>
        </fwb-select>

        <fwb-input
          v-model="captain.email"
          type="email"
          name="captainEmail"
          placeholder="Adres e-mail"
          wrapper-class="form-input"
          :validation-status="validations.captainEmail.status.value as any"
          :required="true"
          @change="resetValidation"
        >
          <template #validationMessage>
            <span
              class="text-xs font-bold"
              :class="validations.captainEmail.status.value === 'success' ? 'text-green-500' : 'text-red-500'"
            >
              {{ validations.captainEmail.message.value }}</span
            >
          </template>
        </fwb-input>

        <fwb-input
          v-model="captain.phone"
          type="tel"
          name="captainPhone"
          placeholder="Telefon"
          wrapper-class="form-input"
          :validation-status="validations.captainPhone.status.value as any"
          :required="true"
          @change="resetValidation"
        >
          <template #validationMessage>
            <span
              class="text-xs font-bold"
              :class="validations.captainPhone.status.value === 'success' ? 'text-green-500' : 'text-red-500'"
            >
              {{ validations.captainPhone.message.value }}
            </span>
          </template>
        </fwb-input>

        <h3 class="mt-4 mb-2 font-medium">Adres zamieszkania</h3>

        <fwb-input
          v-model="captain.street"
          type="text"
          name="captainStreet"
          placeholder="Ulica i numer"
          wrapper-class="form-input"
          :validation-status="validations.captainStreet.status.value as any"
          :required="true"
          @change="resetValidation"
        >
          <template #validationMessage>
            <span
              class="text-xs font-bold"
              :class="validations.captainStreet.status.value === 'success' ? 'text-green-500' : 'text-red-500'"
            >
              {{ validations.captainStreet.message.value }}
            </span>
          </template>
        </fwb-input>

        <div class="flex gap-2 mb-2 *:w-full">
          <fwb-input
            v-model="captain.postalCode"
            type="text"
            name="captainPostalCode"
            placeholder="Kod pocztowy"
            wrapper-class="form-input"
            :validation-status="validations.captainPostalCode.status.value as any"
            :required="true"
            @change="resetValidation"
          >
            <template #validationMessage>
              <span
                class="text-xs font-bold"
                :class="validations.captainPostalCode.status.value === 'success' ? 'text-green-500' : 'text-red-500'"
              >
                {{ validations.captainPostalCode.message.value }}
              </span>
            </template>
          </fwb-input>

          <fwb-input
            v-model="captain.city"
            type="text"
            name="captainCity"
            placeholder="Miejscowość"
            wrapper-class="form-input"
            :validation-status="validations.captainCity.status.value as any"
            :required="true"
            @change="resetValidation"
          >
            <template #validationMessage>
              <span
                class="text-xs font-bold"
                :class="validations.captainCity.status.value === 'success' ? 'text-green-500' : 'text-red-500'"
              >
                {{ validations.captainCity.message.value }}
              </span>
            </template>
          </fwb-input>
        </div>

        <div></div>
        <fwb-select
          v-model="captain.country"
          name="captainCountry"
          class="w-full form-input"
          :required="true"
          :options="countries"
          placeholder="Wybierz kraj"
          :validation-status="validations.captainCountry.status.value as any"
        >
          <template #validationMessage>
            <span
              class="text-xs font-bold"
              :class="validations.captainCountry.status.value === 'success' ? 'text-green-500' : 'text-red-500'"
            >
              {{ validations.captainCountry.message.value }}
            </span>
          </template>
        </fwb-select>
      </div>

      <div class="mb-6">
        <h2 class="inline-flex items-center justify-between w-full mb-2 font-semibold">
          <span>Zawodnicy ({{ participants.length }} z 9 możliwych)</span>

          <fwb-button color="green" :disabled="participants.length + 1 >= maxParticipants" @click="addParticipant">
            <template #prefix>
              <lazy-client-only>
                <fa-icon icon="fa-solid fa-plus" class="w-4 h-4" />
              </lazy-client-only>
            </template>
            Dodaj zawodnika
          </fwb-button>
        </h2>

        <div v-for="(participant, i) in participants" :key="i" class="flex gap-2 mb-2">
          <fwb-input
            v-model="participant.name"
            type="text"
            :name="'participantFirstName-' + i"
            placeholder="Imię"
            wrapper-class="form-input"
            :validation-status="validations.participantFirstName[i].status.value as any"
            :required="true"
            @change="resetValidation"
          >
            <template #validationMessage>
              <span
                class="text-xs font-bold"
                :class="
                  validations.participantFirstName[i].status.value === 'success' ? 'text-green-500' : 'text-red-500'
                "
              >
                {{ validations.participantFirstName[i].message.value }}
              </span>
            </template>
          </fwb-input>

          <fwb-input
            v-model="participant.surname"
            type="text"
            :name="'participantLastName-' + i"
            placeholder="Nazwisko"
            wrapper-class="form-input"
            :validation-status="validations.participantLastName[i].status.value as any"
            :required="true"
            @change="resetValidation"
          >
            <template #validationMessage>
              <span
                class="text-xs font-bold"
                :class="validations.participantLastName[i].status.value === 'success' ? 'text-green-500' : 'text-red-500'"
              >
                {{ validations.participantLastName[i].message.value }}
              </span>
            </template>
          </fwb-input>

          <fwb-select
            v-model="participant.shirtSize"
            :name="'participantShirtSize-' + i"
            :options="shirtSizes"
            :required="true"
            placeholder="Wybierz rozmiar koszulki"
            class="form-input"
            :validation-status="validations.participantShirt[i].status.value as any"
          >
            <template #validationMessage>
              <span
                class="text-xs font-bold"
                :class="validations.participantShirt[i].status.value === 'success' ? 'text-green-500' : 'text-red-500'"
              >
                {{ validations.participantShirt[i].message.value }}
              </span>
            </template>
          </fwb-select>

          <fwb-button color="red" @click="removeParticipant(i)" class="h-10">Usuń</fwb-button>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="inline-flex items-center justify-between w-full mb-2 font-semibold">
          <span>Roboty ({{ robots.length }} z 5 możliwych)</span>

          <fwb-button color="green" :disabled="robots.length >= maxRobots" @click="addRobot">
            <template #prefix>
              <lazy-client-only>
                <fa-icon icon="fa-solid fa-plus" class="w-4 h-4" />
              </lazy-client-only>
            </template>

            Dodaj robota
          </fwb-button>
        </h2>

        <div v-for="(robot, i) in robots" :key="i" class="flex gap-2 mb-2">
          <fwb-input
            v-model="robot.name"
            type="text"
            :name="'robotName-' + i"
            placeholder="Nazwa robota"
            wrapper-class="form-input"
            :validation-status="validations.robotName[i].status.value as any"
            :required="true"
            @change="resetValidation"
          >
            <template #validationMessage>
              <span
                class="text-xs font-bold"
                :class="validations.robotName[i].status.value === 'success' ? 'text-green-500' : 'text-red-500'"
              >
                {{ validations.robotName[i].message.value }}
              </span>
            </template>
          </fwb-input>

          <fwb-select
            v-model="robot.category"
            :name="'robotCategory-' + i"
            :options="categories"
            :required="true"
            placeholder="Wybierz kategorię"
            :validation-status="validations.robotCategory[i].status.value as any"
            class="form-input"
          >
            <template #validationMessage>
              <span
                class="text-xs font-bold"
                :class="validations.robotCategory[i].status.value === 'success' ? 'text-green-500' : 'text-red-500'"
              >
                {{ validations.robotCategory[i].message.value }}
              </span>
            </template>
          </fwb-select>

          <fwb-button color="red" @click="removeRobot(i)" class="h-10">Usuń</fwb-button>
        </div>
      </div>

      <div class="flex items-center gap-2 mb-4">
        <fwb-checkbox
          v-model="agreePrivacy"
          name="agreePrivacy"
          label="Wyrażam zgodę na przetwarzanie danych osobowych"
          wrapper-class="form-input"
          :required="true"
        />
      </div>

      <div class="flex items-center gap-2 mb-6">
        <fwb-checkbox
          v-model="agreeTerms"
          name="agreeTerms"
          label="Akceptuję regulamin zawodów"
          wrapper-class="form-input"
          :required="true"
        />
      </div>

      <fwb-button type="submit">Zarejestruj zespół</fwb-button>
    </form>
  </div>
</template>
