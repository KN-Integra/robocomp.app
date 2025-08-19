<script setup lang="ts">
import { FwbButton, FwbInput, FwbSelect, FwbCheckbox } from 'flowbite-vue'

import type { IsExistTeamResponse } from '~/server/api/isExistTeam/index.get'
import type { RegistrationRequest, RegistrationResponse } from '~/server/api/registration/index.post'

import { isValidEmail, isValidPhone, isValidPostalCode } from '~/server/utils/formValidator'

interface Participant {
  name: string
  surname: string
  shirtSize: string
}

interface Robot {
  name: string
  category: string
}

const shirtSizes = ['S', 'M', 'L', 'XL', 'XXL'].map((v) => ({ value: v, name: v }))
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

// ERROR
const formOK = ref(false)
const teamNameError = ref<string | undefined>('')
const captainNameError = ref<string | undefined>('')
const captainSurnameError = ref<string | undefined>('')
const captainEmailError = ref<string | undefined>('')
const captainPhoneError = ref<string | undefined>('')
const captainStreetError = ref<string | undefined>('')
const captainPostalCodeError = ref<string | undefined>('')
const captainCityError = ref<string | undefined>('')

interface ParticipantError {
  name: string | undefined
  surname: string | undefined
}

const participantsError = ref<ParticipantError[]>([])

interface RobotsError {
  name: string | undefined
}

const robotsError = ref<RobotsError[]>([])

function checkAllForm() {
  if (
    teamNameError.value !== undefined ||
    captainNameError.value !== undefined ||
    captainSurnameError.value !== undefined ||
    captainEmailError.value !== undefined ||
    captainPhoneError.value !== undefined ||
    captainStreetError.value !== undefined ||
    captainPostalCodeError.value !== undefined ||
    captainCityError.value !== undefined
  ) {
    formOK.value = false
    return
  }

  if (captain.shirtSize === '' || captain.country === '') {
    formOK.value = false
    return
  }

  if (
    participantsError.value.find((value: ParticipantError) => {
      return value.name !== undefined || value.surname !== undefined
    }) !== undefined ||
    participants.value.find((value: Participant) => {
      return value.shirtSize === ''
    }) !== undefined
  ) {
    formOK.value = false
    return
  }

  if (
    robots.value.length === 0 ||
    robotsError.value.find((value: RobotsError) => {
      return value.name !== undefined
    }) !== undefined ||
    robots.value.find((value: Robot) => {
      return value.category === ''
    }) !== undefined
  ) {
    formOK.value = false
    return
  }

  if (!agreePrivacy.value || !agreeTerms.value) {
    formOK.value = false
    return
  }

  formOK.value = true
}

let debounceTimeout: ReturnType<typeof setTimeout> | null = null
watch(teamName, (newVal) => {
  teamNameError.value = ''
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  if (newVal.length === 0) {
    teamNameError.value = 'Podaj nazwę drużyny.'
    checkAllForm()
    return
  }
  if (newVal.length > 50) {
    teamNameError.value = 'Nazwa musi mieć długość mniejszą niż 50 liter.'
    checkAllForm()
    return
  }

  debounceTimeout = setTimeout(async () => {
    try {
      const isTaken = await checkTeamNameExist(newVal)
      if (isTaken) {
        teamNameError.value = 'Ta nazwa jest już zajęta.'
      } else {
        teamNameError.value = undefined
      }
    } catch (error) {
      teamNameError.value = 'Błąd połączenia z serwerem.'
    }
    checkAllForm()
  }, 500)
})

watch(captain, (newVal) => {
  captainNameError.value = undefined
  captainSurnameError.value = undefined
  captainEmailError.value = undefined
  captainPhoneError.value = undefined
  captainStreetError.value = undefined
  captainPostalCodeError.value = undefined
  captainCityError.value = undefined
  let ok = true
  if (newVal.name.length === 0) {
    captainNameError.value = 'Podaj imię kapitana.'
    ok = false
  }
  if (newVal.name.length > 50) {
    captainNameError.value = 'Imię musi mieć długość mniejszą niż 50 liter.'
    ok = false
  }

  if (newVal.surname.length === 0) {
    captainSurnameError.value = 'Podaj nazwisko kapitana.'
    ok = false
  }
  if (newVal.surname.length > 50) {
    captainSurnameError.value = 'Nazwisko musi mieć długość mniejszą niż 50 liter.'
    ok = false
  }

  if (newVal.email.length === 0) {
    captainEmailError.value = 'Podaj email'
    ok = false
  }
  if (!isValidEmail(newVal.email)) {
    captainEmailError.value = 'Nie poprawny format email'
    ok = false
  }

  if (newVal.phone.length === 0) {
    captainPhoneError.value = 'Podaj numer telefonu'
    ok = false
  }
  if (!isValidPhone(newVal.phone)) {
    captainPhoneError.value = 'Nie poprawny format numeru telefonu'
    ok = false
  }

  if (newVal.street.length === 0) {
    captainStreetError.value = 'Podaj ulicę.'
    ok = false
  }
  if (newVal.street.length > 50) {
    captainStreetError.value = 'Ulica musi mieć długość mniejszą niż 50 liter.'
    ok = false
  }

  if (newVal.postalCode.length === 0) {
    captainPostalCodeError.value = 'Podaj kod pocztowy.'
    ok = false
  }
  if (!isValidPostalCode(newVal.postalCode)) {
    captainPostalCodeError.value = 'Nie poprawny format kodu pocztowego'
    ok = false
  }

  if (newVal.city.length === 0) {
    captainCityError.value = 'Podaj miasto.'
    ok = false
  }
  if (newVal.city.length > 50) {
    captainCityError.value = 'Miasto musi mieć długość mniejszą niż 50 liter.'
    ok = false
  }

  if (ok) {
    captainNameError.value = undefined
    captainSurnameError.value = undefined
    captainEmailError.value = undefined
    captainPhoneError.value = undefined
    captainStreetError.value = undefined
    captainPostalCodeError.value = undefined
    captainCityError.value = undefined
  }
  checkAllForm()
})

watch(
  () => JSON.stringify(participants.value),
  (_) => {
    participantsError.value = []
    const tempList: ParticipantError[] = []
    participants.value.forEach((val: Participant) => {
      const error: ParticipantError = { name: undefined, surname: undefined }
      if (val.name.length === 0) {
        error.name = ''
      }
      if (val.name.length > 50) {
        error.name = 'Imię zawodnika musi mieć długość mniejszą niż 50 liter.'
      }
      if (val.surname.length === 0) {
        error.surname = ''
      }
      if (val.surname.length > 50) {
        error.surname = 'Nazwisko zawodnika musi mieć długość mniejszą niż 50 liter.'
      }
      tempList.push(error)
    })
    participantsError.value = tempList
    checkAllForm()
  }
)

watch(
  () => JSON.stringify(robots.value),
  (_) => {
    robotsError.value = []
    const tempList: RobotsError[] = []
    robots.value.forEach((val: Robot) => {
      const error: RobotsError = { name: undefined }
      if (val.name.length === 0) {
        error.name = ''
      }
      if (val.name.length > 100) {
        error.name = 'Nazwa robota musi mieć długość mniejszą niż 100 liter.'
      }
      tempList.push(error)
    })
    robotsError.value = tempList
    checkAllForm()
  }
)

watch(agreePrivacy, () => checkAllForm())
watch(agreeTerms, () => checkAllForm())

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

const validations: Record<
  string,
  { status: Ref<'success' | 'error' | ''>; message: Ref<string | undefined>; errorMessage: string }
> = {
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
  }
}

function resetValidation(e: Event) {
  const target = e.target as HTMLFormElement

  validations[target.name].status.value = ''
  validations[target.name].message.value = ''
}

async function submitForm() {
  if (!$formRef.value) return

  const formData = new FormData($formRef.value)

  console.info($formRef.value.elements)

  for (const k of formData.keys()) {
    console.info(`${k}: ${formData.get(k)}`)
  }

  for (const el of $formRef.value.elements) {
    const element = el as HTMLFormElement

    console.info(element, element.checkValidity())

    if (!element.checkValidity()) {
      element.focus()
      element.setCustomValidity(validations.teamName.errorMessage)
      validations.teamName.status.value = 'error'
      validations.teamName.message.value = validations.teamName.errorMessage
    }
  }

  if (!$formRef.value.checkValidity()) {
    return
  }

  return

  const payload: RegistrationRequest = {
    teamName: teamName.value,
    captain,
    participants: participants.value,
    robots: robots.value,
    agreePrivacy: agreePrivacy.value,
    agreeTerms: agreeTerms.value
  }

  try {
    const res = await fetch('/api/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const data: RegistrationResponse = await res.json()
    await navigateTo({
      path: '/registration/finish',
      state: {
        success: data.statusCode === 0,
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

    categories.value = (data.competitions.map((element) => [element.name, element.name]) || []).map((v) => ({
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

<template>
  <form ref="$formRef" class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-2xl font-bold mb-6">Formularz rejestracyjny</h1>

    <div class="mb-4">
      <label class="block font-semibold mb-1">Nazwa zespołu</label>
      <fwb-input
        v-model="teamName"
        type="text"
        name="teamName"
        placeholder="Nazwa zespołu"
        :validation-status="validations.teamName.status.value"
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
      <h2 class="font-semibold mb-2">Kapitan</h2>
      <fwb-input
        v-model="captain.name"
        type="text"
        name="captainFirstName"
        placeholder="Imię"
        :validation-status="validations.captainFirstName.status.value"
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
        :validation-status="validations.captainLastName.status.value"
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
        class="select select-bordered w-full mb-2"
        :options="shirtSizes"
      />

      <fwb-input
        v-model="captain.email"
        type="email"
        name="captainEmail"
        placeholder="Adres e-mail"
        :validation-status="validations.captainEmail.status.value"
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
        :validation-status="validations.captainPhone.status.value"
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

      <h3 class="font-medium mt-4 mb-2">Adres zamieszkania</h3>

      <fwb-input
        v-model="captain.street"
        type="text"
        name="captainStreet"
        placeholder="Ulica i numer"
        :validation-status="validations.captainStreet.status.value"
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

      <div class="flex gap-2 mb-2">
        <fwb-input
          v-model="captain.postalCode"
          type="text"
          name="captainPostalCode"
          placeholder="Kod pocztowy"
          class="flex-1"
          :validation-status="validations.captainPostalCode.status.value"
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
          class="flex-1"
          :validation-status="validations.captainCity.status.value"
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

      <fwb-select
        v-model="captain.country"
        name="captainCountry"
        class="select select-bordered w-full"
        :required="true"
        :options="countries"
      />
    </div>

    <div class="mb-6">
      <h2 class="font-semibold mb-2">Zawodnicy ({{ participants.length }} z 9 możliwych)</h2>
      <div v-for="(participant, i) in participants" :key="i" class="flex gap-2 mb-2">
        <forms-input-with-error
          v-model="participant.name"
          type="text"
          placeholder="Imię"
          class="input input-bordered flex-1"
          :error-message="participantsError.length > i && participantsError[i].name"
        />

        <forms-input-with-error
          v-model="participant.surname"
          type="text"
          placeholder="Nazwisko"
          class="input input-bordered flex-1"
          :error-message="participantsError.length > i && participantsError[i].surname"
        />

        <fwb-select
          v-model="participant.shirtSize"
          name="participantShirtSize[]"
          :options="shirtSizes"
          :required="true"
        />
        <fwb-button color="red" @click="removeParticipant(i)">Usuń</fwb-button>
      </div>

      <fwb-button color="green" :disabled="participants.length + 1 >= maxParticipants" @click="addParticipant">
        <template #prefix>
          <lazy-client-only>
            <fa-icon icon="fa-solid fa-plus" class="h-4 w-4" />
          </lazy-client-only>
        </template>
        Dodaj zawodnika
      </fwb-button>
    </div>

    <div class="mb-6">
      <h2 class="font-semibold mb-2">Roboty ({{ robots.length }} z 5 możliwych)</h2>
      <div v-for="(robot, i) in robots" :key="i" class="flex gap-2 mb-2">
        <forms-input-with-error
          v-model="robot.name"
          type="text"
          placeholder="Nazwa robota"
          class="input input-bordered flex-1"
          :error-message="robotsError.length > i ? robotsError[i].name : undefined"
        />

        <fwb-select v-model="robot.category" name="robotCategories[]" :options="categories" :required="true" />

        <fwb-button color="red" @click="removeRobot(i)">Usuń</fwb-button>
      </div>

      <fwb-button color="green" :disabled="robots.length >= maxRobots" @click="addRobot">
        <template #prefix>
          <lazy-client-only>
            <fa-icon icon="fa-solid fa-plus" class="h-4 w-4" />
          </lazy-client-only>
        </template>

        Dodaj robota
      </fwb-button>
    </div>

    <div class="mb-4 flex items-center gap-2">
      <fwb-checkbox
        v-model="agreePrivacy"
        name="agreePrivacy"
        label="Wyrażam zgodę na przetwarzanie danych osobowych"
        :required="true"
      />
    </div>

    <div class="mb-6 flex items-center gap-2">
      <fwb-checkbox v-model="agreeTerms" name="agreeTerms" label="Akceptuję regulamin zawodów" :required="true" />
    </div>

    <fwb-button type="button" @click="submitForm">Zarejestruj zespół</fwb-button>
  </form>
</template>
