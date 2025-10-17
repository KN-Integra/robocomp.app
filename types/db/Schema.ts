import type { Generated, Insertable, Selectable, Updateable } from 'kysely'

export interface ParticipantTable {
  id: Generated<number>
  first_name: string
  last_name: string
  year: number
  size: string
}

export type ParticipantRow = Selectable<ParticipantTable>
export type InsertableParticipantRow = Insertable<ParticipantTable>
export type UpdateableParticipantRow = Updateable<ParticipantTable>

export interface RobotTable {
  id: Generated<number>
  robot_no: number
  name: string
  year: number
  team_id: number
  competition: string
  status: Generated<string>
}

export type RobotRow = Selectable<RobotTable>
export type InsertableRobotRow = Insertable<RobotTable>
export type UpdateableRobotRow = Updateable<RobotTable>

export interface TeamTable {
  id: Generated<number>
  name: string
  year: Generated<number>
  status: Generated<string>
}

export type TeamRow = Selectable<TeamTable>
export type InsertableTeamRow = Insertable<TeamTable>
export type UpdateableTeamRow = Updateable<TeamTable>

export interface TeamsParticipantsTable {
  team_id: number
  participant_id: number
  role: Generated<string>
  status: Generated<string>
  received_tshirt: Generated<boolean>
}

export type TeamsParticipantsRow = Selectable<TeamsParticipantsTable>
export type InsertableTeamsParticipantsRow = Insertable<TeamsParticipantsTable>
export type UpdateableTeamsParticipantsRow = Updateable<TeamsParticipantsTable>

export interface StatusesTable {
  name: string
}

export interface RolesTable {
  name: string
}

export interface CompetitionsTable {
  name: string
  scoring_method: 'tournament_bracket' | 'votes' | 'time_shortest' | 'not-available'
  color: string
  display_name: string
  active: Generated<boolean>
}

export interface ScheduleTable {
  id: Generated<number>
  competition: string
  name: string
  type: string
  start_date: Date
  end_date: Date
}

export interface GroupsTable {
  id: Generated<number>
  stage: string
  competition: string
  name: string
}

export interface RobotsGroupsTable {
  robots_id: number
  groups_id: number
}

export interface RobotScheduleTable {
  id: Generated<number>
  time: Date
  stage: string
  robot_1: number
  robot_2: number
  schedule: number
}

export interface ResultsTable {
  try_no: number
  schedule: number
  score: number
}

export interface StagesTable {
  name: string
  order: number
}

export interface CountriesTable {
  code: string
  name: string
}
