<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

import InputWithError from '~/components/forms/input-with-error.vue'
import { isValidEmail, isValidPhone, isValidPostalCode } from '~/server/utils/formValidator'

import type { CompetitionResponse } from '~/server/api/competition/index.get'
import type { CountriesResponse } from '~/server/api/countries/index.get'
import type { IsExistTeamResponse } from '~/server/api/isExistTeam/index.get'
import type { RegistrationRequest, RegistrationResponse } from '~/server/api/registration/index.post'

const route = useRouter()

interface Participant {
  name: string
  surname: string
  shirtSize: string
}

interface Robot {
  name: string
  category: string
}

const shirtSizes = ['S', 'M', 'L', 'XL', 'XXL']
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

const categories = ref<string[]>([])
const countries = ref<[string, string][]>([])

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
    captainNameError.value = 'Imie musi mieć długość mniejszą niż 50 liter.'
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

async function submitForm() {
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
    await route.push({
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
    const response = await fetch('api/competition')
    const data = (await response.json()) as CompetitionResponse
    categories.value = data.data.competitions.map((element) => element.name) || []
  } catch (error) {
    console.error('Error in loading robots categories:', error)
  }

  try {
    const response = await fetch('api/countries')
    const data = (await response.json()) as CountriesResponse
    countries.value = data.data.countries.map((element) => [element.name, element.code]) || []
  } catch (error) {
    console.error('Error in loading robots categories:', error)
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <h1 class="text-2xl font-bold mb-6">Formularz rejestracyjny</h1>

    <div class="mb-4">
      <label class="block font-semibold mb-1">Nazwa zespołu</label>
      <input-with-error
        v-model="teamName"
        type="text"
        class="input input-bordered w-full"
        :error-message="teamNameError"
      />
    </div>

    <div class="mb-6">
      <h2 class="font-semibold mb-2">Kapitan</h2>
      <input-with-error
        v-model="captain.name"
        type="text"
        placeholder="Imię"
        class="input input-bordered w-full mb-2"
        :error-message="captainNameError"
      />
      <input-with-error
        v-model="captain.surname"
        type="text"
        placeholder="Nazwisko"
        class="input input-bordered w-full mb-2"
        :error-message="captainSurnameError"
      />
      <select v-model="captain.shirtSize" class="select select-bordered w-full mb-2">
        <option disabled value="">Rozmiar koszulki</option>
        <option v-for="size in shirtSizes" :key="size" :value="size">{{ size }}</option>
      </select>
      <input-with-error
        v-model="captain.email"
        type="email"
        placeholder="Email"
        class="input input-bordered w-full mb-2"
        :error-message="captainEmailError"
      />
      <input-with-error
        v-model="captain.phone"
        type="tel"
        placeholder="Telefon"
        class="input input-bordered w-full mb-2"
        :error-message="captainPhoneError"
      />

      <h3 class="font-medium mt-4 mb-2">Adres zamieszkania</h3>
      <input-with-error
        v-model="captain.street"
        type="text"
        placeholder="Ulica i numer"
        class="input input-bordered w-full mb-2"
        :error-message="captainStreetError"
      />
      <div class="flex gap-2 mb-2">
        <input-with-error
          v-model="captain.postalCode"
          type="text"
          placeholder="Kod pocztowy"
          class="input input-bordered w-1/2"
          :error-message="captainPostalCodeError"
        />
        <input-with-error
          v-model="captain.city"
          type="text"
          placeholder="Miejscowość"
          class="input input-bordered w-1/2"
          :error-message="captainCityError"
        />
      </div>
      <select v-model="captain.country" class="select select-bordered w-full">
        <option disabled value="">Kraj</option>
        <option v-for="country in countries" :key="country[0]" :value="country[1]">{{ country[0] }}</option>
      </select>
    </div>

    <div class="mb-6">
      <h2 class="font-semibold mb-2">Zawodnicy ({{ participants.length }} z 9 możliwych)</h2>
      <div v-for="(participant, i) in participants" :key="i" class="flex gap-2 mb-2">
        <input-with-error
          v-model="participant.name"
          type="text"
          placeholder="Imię"
          class="input input-bordered flex-1"
          :error-message="participantsError.length > i ? participantsError[i].name : undefined"
        />
        <input-with-error
          v-model="participant.surname"
          type="text"
          placeholder="Nazwisko"
          class="input input-bordered flex-1"
          :error-message="participantsError.length > i ? participantsError[i].surname : undefined"
        />
        <select v-model="participant.shirtSize" class="select select-bordered w-32">
          <option disabled value="">Rozmiar</option>
          <option v-for="size in shirtSizes" :key="size" :value="size">{{ size }}</option>
        </select>
        <button class="btn btn-sm btn-error" @click="removeParticipant(i)">Usuń</button>
      </div>
      <button
        class="btn btn-sm btn-primary mt-2"
        :disabled="participants.length + 1 >= maxParticipants"
        @click="addParticipant"
      >
        Dodaj zawodnika
      </button>
    </div>

    <div class="mb-6">
      <h2 class="font-semibold mb-2">Roboty ({{ robots.length }} z 5 możliwych)</h2>
      <div v-for="(robot, i) in robots" :key="i" class="flex gap-2 mb-2">
        <input-with-error
          v-model="robot.name"
          type="text"
          placeholder="Nazwa robota"
          class="input input-bordered flex-1"
          :error-message="robotsError.length > i ? robotsError[i].name : undefined"
        />
        <select v-model="robot.category" class="select select-bordered w-64">
          <option disabled value="">Wybierz kategorię</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
        <button class="btn btn-sm btn-error" @click="removeRobot(i)">Usuń</button>
      </div>
      <button class="btn btn-sm btn-primary" :disabled="robots.length >= maxRobots" @click="addRobot">
        Dodaj robota
      </button>
    </div>

    <div class="mb-4 flex items-center gap-2">
      <input v-model="agreePrivacy" type="checkbox" class="checkbox" />
      <label>Wyrażam zgodę na przetwarzanie danych osobowych</label>
    </div>
    <div class="mb-6 flex items-center gap-2">
      <input v-model="agreeTerms" type="checkbox" class="checkbox" />
      <label>Akceptuję regulamin zawodów</label>
    </div>

    <button class="btn btn-success w-full" :disabled="!formOK" @click="submitForm">Zarejestruj zespół</button>
  </div>
</template>
