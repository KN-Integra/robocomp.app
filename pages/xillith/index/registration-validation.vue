<script setup lang="ts">
import {
  FwbTable,
  FwbTableHead,
  FwbTableBody,
  FwbTableHeadCell,
  FwbTableCell,
  FwbTableRow,
  FwbButton,
  FwbSelect,
  FwbCheckbox,
  FwbInput
} from 'flowbite-vue'
import type { TeamsDetailsResponse } from '~/server/api/teams/[id]/index.get'
import type { TeamsResponse } from '~/server/api/teams/index.get'

import COMPETITION_RULES from '~/settings/competition-rules'

import { useUserStore } from '~/store/user.store'

const userStore = useUserStore()

const teamNameFilter = ref('')
const selectedTeamId = ref<number | null>(null)

const { data: teams } = useLazyAsyncData('admin-teams-list', async () => {
  const response = await $fetch<TeamsResponse>('/api/teams')

  if (!(response && response.data && response.data.teams)) {
    return null
  }

  return response.data.teams.filter((team) =>
    team.team_name.toLowerCase().trim().includes(teamNameFilter.value.toLowerCase().trim())
  )
}, { watch: [teamNameFilter] })

const { data: teamDetail } = useLazyAsyncData(
  'admin-team-details',
  async () => {
    if (!selectedTeamId.value) {
      return null
    }

    const response = await $fetch<TeamsDetailsResponse>(`/api/teams/${selectedTeamId.value}`)

    console.info(response)

    if (!(response && response.data)) {
      return null
    }

    return response.data
  },
  { watch: [selectedTeamId] }
)

onMounted(() => {
  refreshNuxtData('admin-teams-list')
})

enum StatusEnum {
  disqualified = 'Zdyskwalifikowany',
  registered = 'Zarejestrowany',
  verified = 'Zweryfikowany'
}

enum RoleEnum {
  participant = 'Zawodnik',
  leader = 'Kapitan',
  mentor = 'Opiekun'
}

async function updateRobotStatus(robotId: number, status: keyof typeof StatusEnum) {
  try {
    const response = await $fetch(`/api/robots/${robotId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${userStore.tokenType} ${userStore.accessToken}`
      },
      body: { status }
    })

    console.info(response)
  } catch (error) {
    console.error('Error updating robot status:', error)
  }
}

async function updateParticipantStatus(participantId: number, changeType: 'tshirt' | 'status', changeValue: string | boolean) {
  try {
    const response = await $fetch(`/api/participants/${participantId}?teamId=${selectedTeamId.value}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${userStore.tokenType} ${userStore.accessToken}`
      },
      body: { [changeType]: changeValue }
    })

    console.info(response)
  } catch (error) {
    console.error('Error updating participant status:', error)
  }
}

async function backToTeamsList() {
  selectedTeamId.value = null
  await refreshNuxtData('admin-teams-list')
}
</script>

<template>
  <div class="flex flex-col w-full">
    <span class="inline-flex items-center justify-between mb-2">
      <h2 class="mb-2 text-2xl font-bold dark:text-white">Walidacja rejestracji</h2>

      <fwb-input
        v-if="!selectedTeamId"
        v-model="teamNameFilter"
        placeholder="Filtruj zespoły..."
      />

      <fwb-button
        v-if="selectedTeamId"
        @click="backToTeamsList()"
      >Powrót do listy zespołów</fwb-button>
    </span>

    <section>
      

      <lazy-client-only>
        <fwb-table v-if="!selectedTeamId" class="w-full mb-8 flowbite-table">
          <fwb-table-head>
            <fwb-table-head-cell>ID</fwb-table-head-cell>
            <fwb-table-head-cell>Nazwa zespołu</fwb-table-head-cell>
            <fwb-table-head-cell>Kraj</fwb-table-head-cell>
            <fwb-table-head-cell>Kapitan</fwb-table-head-cell>
            <fwb-table-head-cell>Liczba członków</fwb-table-head-cell>
            <fwb-table-head-cell>Liczba robotów</fwb-table-head-cell>
            <fwb-table-head-cell>Status</fwb-table-head-cell>
            <fwb-table-head-cell>Akcje</fwb-table-head-cell>
          </fwb-table-head>

          <fwb-table-body>
            <fwb-table-row v-for="row in teams" :key="row.team_id">
              <fwb-table-cell>{{ row.team_id }}</fwb-table-cell>
              <fwb-table-cell>{{ row.team_name }}</fwb-table-cell>
              <fwb-table-cell>{{ row.countries }}</fwb-table-cell>
              <fwb-table-cell>{{ row.leaders }}</fwb-table-cell>
              <fwb-table-cell>{{ row.members_count }}</fwb-table-cell>
              <fwb-table-cell>{{ row.robots_count }}</fwb-table-cell>
              <fwb-table-cell>{{ StatusEnum[row.team_status as keyof typeof StatusEnum] }}</fwb-table-cell>
              <fwb-table-cell>
                <fwb-button @click="selectedTeamId = row.team_id">Wybierz</fwb-button>
              </fwb-table-cell>
            </fwb-table-row>
          </fwb-table-body>
        </fwb-table>

        <div v-else-if="teamDetail">
          <h3 class="mb-2 text-xl font-bold dark:text-white">Szczegóły zespołu: {{ teamDetail.team.name }} (ID: {{ teamDetail.team.id }})</h3>

          <fwb-table class="w-full mb-8 flowbite-table">
            <fwb-table-head>
              <fwb-table-head-cell>ID</fwb-table-head-cell>
              <fwb-table-head-cell>Imię</fwb-table-head-cell>
              <fwb-table-head-cell>Nazwisko</fwb-table-head-cell>
              <fwb-table-head-cell>Rola</fwb-table-head-cell>
              <fwb-table-head-cell>Rozmiar koszulki</fwb-table-head-cell>
              <fwb-table-head-cell>Status</fwb-table-head-cell>
              <fwb-table-head-cell>Koszulka odebrana</fwb-table-head-cell>
            </fwb-table-head>

            <fwb-table-body>
              <fwb-table-row v-for="participant in teamDetail.participants" :key="participant.id">
                <fwb-table-cell>{{ participant.id }}</fwb-table-cell>
                <fwb-table-cell>{{ participant.first_name }}</fwb-table-cell>
                <fwb-table-cell>{{ participant.last_name }}</fwb-table-cell>
                <fwb-table-cell>{{ RoleEnum[participant.role as keyof typeof RoleEnum] }}</fwb-table-cell>
                <fwb-table-cell>{{ participant.size }}</fwb-table-cell>
                <fwb-table-cell>
                  <fwb-select
                    v-model="participant.status"
                    @update:model-value="updateParticipantStatus(participant.id, 'status', $event)"
                    class="cursor-pointer"
                    :options="[
                      { value: 'registered', name: StatusEnum.registered },
                      { value: 'verified', name: StatusEnum.verified },
                      { value: 'disqualified', name: StatusEnum.disqualified }
                    ]"
                  />
                </fwb-table-cell>
                <fwb-table-cell>
                  <fwb-checkbox
                    v-model="participant.received_tshirt"
                    @update:model-value="updateParticipantStatus(participant.id, 'tshirt', $event as boolean)"
                    class="cursor-pointer"
                    :label="participant.received_tshirt ? 'Tak' : 'Nie'"
                  />
                </fwb-table-cell>
              </fwb-table-row>
            </fwb-table-body>
          </fwb-table>

          <fwb-table class="w-full mb-8 flowbite-table">
            <fwb-table-head>
              <fwb-table-head-cell>ID</fwb-table-head-cell>
              <fwb-table-head-cell>Nazwa robota</fwb-table-head-cell>
              <fwb-table-head-cell>Kategoria</fwb-table-head-cell>
              <fwb-table-head-cell>Status</fwb-table-head-cell>
              <fwb-table-head-cell>Zasady konkurencji</fwb-table-head-cell>
            </fwb-table-head>

            <fwb-table-body>
              <fwb-table-row v-for="robot in teamDetail.robots" :key="robot.id">
                <fwb-table-cell>{{ robot.id }}</fwb-table-cell>
                <fwb-table-cell>{{ robot.name }}</fwb-table-cell>
                <fwb-table-cell>{{ robot.competition_display_name }}</fwb-table-cell>
                <fwb-table-cell>
                  <fwb-select
                    v-model="robot.status"
                    @update:model-value="updateRobotStatus(robot.id, $event)"
                    class="cursor-pointer"
                    :options="[
                      { value: 'registered', name: StatusEnum.registered },
                      { value: 'verified', name: StatusEnum.verified },
                      { value: 'disqualified', name: StatusEnum.disqualified }
                    ]"
                  />
                </fwb-table-cell>
                <fwb-table-cell>{{ COMPETITION_RULES[robot.competition as keyof typeof COMPETITION_RULES] }}</fwb-table-cell>
              </fwb-table-row>
            </fwb-table-body>
          </fwb-table>
        </div>
      </lazy-client-only>
    </section>
  </div>
</template>