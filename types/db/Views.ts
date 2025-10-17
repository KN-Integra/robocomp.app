import type { Selectable } from 'kysely'

export interface TeamsDetailsView {
  team_id: number
  team_name: string
  year: number
  team_status: string
  countries: string
  members_count: number
  robots_count: number
  leader_emails: string
  leader_phones: string
  leaders: string
  participants: string
  robots: string
}

export type TeamsDetailsRow = Selectable<TeamsDetailsView>

export interface CompetitionTimesView {
  robot_id: number
  robot_no: number
  robot_name: string
  year: number
  score: number
  stage: string
}

export type CompetitionTimesRow = Selectable<CompetitionTimesView>

export interface CompetitionTournamentBracketsView {
  robot_id: number
  robot_no: number
  robot_name: string
  year: number
  group_name: string
  stage: string
}

export type CompetitionTournamentBracketsRow = Selectable<CompetitionTournamentBracketsView>

export interface CompetitionVotesView {
  robot_id: number
  robot_no: number
  robot_name: string
  year: number
  score: number
}

export type CompetitionVotesRow = Selectable<CompetitionVotesView>

export interface CompetitionView {
  name: string
  scoring_method: string
  color: string
  display_name: string
}

export type CompetitionViewRow = Selectable<CompetitionView>

export interface CountriesView {
  code: string
  name: string
}

export type CountriesViewRow = Selectable<CountriesView>
