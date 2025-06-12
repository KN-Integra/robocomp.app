<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

import type { CompetitionResponse } from '~/server/api/competition/index.get'

interface Player {
  name: string
  shirtSize: string
}

interface Robot {
  name: string
  category: string
}

const shirtSizes = ['S', 'M', 'L', 'XL', 'XXL']
const maxPlayers = 10
const maxRobots = 5

const teamName = ref('')

const captain = reactive({
  name: '',
  shirtSize: '',
  email: '',
  phone: '',
  street: '',
  postalCode: '',
  city: '',
  country: ''
})

const players = ref<Player[]>([])

const robots = ref<Robot[]>([])

const categories = ref<string[]>([])
const countries = ref<[string, string][]>([
  ['Polska', 'PL'],
  ['Niemcy', 'DE'],
  ['Francja', 'FR'],
  ['Hiszpania', 'ES'],
  ['Włochy', 'IT'],
  ['Stany Zjednoczone', 'US'],
  ['Kanada', 'CA'],
  ['Wielka Brytania', 'GB'],
  ['Australia', 'AU'],
  ['Nowa Zelandia', 'NZ'],
  ['Japonia', 'JP'],
  ['Indie', 'IN'],
  ['Chiny', 'CN'],
  ['Brazylia', 'BR'],
  ['Argentyna', 'AR'],
  ['Meksyk', 'MX'],
  ['Norwegia', 'NO'],
  ['Szwecja', 'SE'],
  ['Finlandia', 'FI'],
  ['Turcja', 'TR']
])

const agreePrivacy = ref(false)
const agreeTerms = ref(false)

function addPlayer() {
  if (players.value.length + 1 < maxPlayers) {
    players.value.push({ name: '', shirtSize: '' })
  }
}

function removePlayer(index: number) {
  players.value.splice(index, 1)
}

function addRobot() {
  if (robots.value.length < maxRobots) {
    robots.value.push({ name: '', category: '' })
  }
}

function removeRobot(index: number) {
  robots.value.splice(index, 1)
}

function submitForm() {
  if (!agreePrivacy.value || !agreeTerms.value) {
    alert('Musisz zaakceptować zgodę i regulamin.')
    return
  }

  const fullTeam = [captain, ...players.value]

  if (fullTeam.length !== maxPlayers) {
    alert(`Zespół musi mieć dokładnie ${maxPlayers} zawodników (w tym kapitana).`)
    return
  }

  console.log({
    teamName: teamName.value,
    captain,
    players: players.value,
    robots: robots.value
  })
}

// Fetch categories from API on mount
onMounted(async () => {
  try {
    const response = await fetch('api/competition')
    const data = (await response.json()) as CompetitionResponse
    categories.value = data.data.competitions.map((element) => element.name) || []
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
      <input v-model="teamName" type="text" class="input input-bordered w-full" />
    </div>

    <div class="mb-6">
      <h2 class="font-semibold mb-2">Kapitan</h2>
      <input
        v-model="captain.name"
        type="text"
        placeholder="Imię i nazwisko"
        class="input input-bordered w-full mb-2"
      />
      <select v-model="captain.shirtSize" class="select select-bordered w-full mb-2">
        <option disabled value="">Rozmiar koszulki</option>
        <option v-for="size in shirtSizes" :key="size" :value="size">{{ size }}</option>
      </select>
      <input v-model="captain.email" type="email" placeholder="Email" class="input input-bordered w-full mb-2" />
      <input v-model="captain.phone" type="tel" placeholder="Telefon" class="input input-bordered w-full mb-2" />

      <h3 class="font-medium mt-4 mb-2">Adres zamieszkania</h3>
      <input
        v-model="captain.street"
        type="text"
        placeholder="Ulica i numer"
        class="input input-bordered w-full mb-2"
      />
      <div class="flex gap-2 mb-2">
        <input v-model="captain.postalCode" type="text" placeholder="Kod pocztowy" class="input input-bordered w-1/2" />
        <input v-model="captain.city" type="text" placeholder="Miejscowość" class="input input-bordered w-1/2" />
      </div>
      <select v-model="captain.country" class="select select-bordered w-full">
        <option disabled value="">Kraj</option>
        <option v-for="country in countries" :key="country[0]" :value="country[1]">{{ country[0] }}</option>
      </select>
    </div>

    <div class="mb-6">
      <h2 class="font-semibold mb-2">Zawodnicy ({{ players.length }} z 9 możliwych)</h2>
      <div v-for="(player, i) in players" :key="i" class="flex gap-2 mb-2">
        <input v-model="player.name" type="text" placeholder="Imię i nazwisko" class="input input-bordered flex-1" />
        <select v-model="player.shirtSize" class="select select-bordered w-32">
          <option disabled value="">Rozmiar</option>
          <option v-for="size in shirtSizes" :key="size" :value="size">{{ size }}</option>
        </select>
        <button class="btn btn-sm btn-error" @click="removePlayer(i)">Usuń</button>
      </div>
      <button class="btn btn-sm btn-primary mt-2" :disabled="players.length + 1 >= maxPlayers" @click="addPlayer">
        Dodaj zawodnika
      </button>
    </div>

    <div class="mb-6">
      <h2 class="font-semibold mb-2">Roboty ({{ robots.length }} z 5 możliwych)</h2>
      <div v-for="(robot, i) in robots" :key="i" class="flex gap-2 mb-2">
        <input v-model="robot.name" type="text" placeholder="Nazwa robota" class="input input-bordered flex-1" />
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

    <button class="btn btn-success w-full" @click="submitForm">Zarejestruj zespół</button>
  </div>
</template>
