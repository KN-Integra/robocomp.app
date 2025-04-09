import * as schema from './Schema'
import * as views from './Views'
export interface Database {
  'team_participant': schema.TeamsParticipantsTable
  'team': schema.TeamTable
  'participant': schema.ParticipantTable
  'robot': schema.RobotTable
  'role': schema.RolesTable
  'group': schema.GroupsTable
  'robot_schedule': schema.RobotScheduleTable
  'robot_group': schema.RobotScheduleTable
  'result': schema.ResultsTable
  'schedule': schema.ScheduleTable
  'stage': schema.StagesTable
  'competition': schema.CompetitionsTable

  'teams_details': views.TeamsDetailsView
  'times_linefollower-enchanced': views.CompetitionTimesView
  'times_linefollower-standard': views.CompetitionTimesView
  'times_micromouse': views.CompetitionTimesView
  'times_robosprint': views.CompetitionTimesView
  'tournament_brackets_smashbots-mini': views.CompetitionTournamentBracketsView
  'tournament_brackets_sumo-lego': views.CompetitionTournamentBracketsView
  'tournament_brackets_sumo-micro': views.CompetitionTournamentBracketsView
  'tournament_brackets_sumo-mini': views.CompetitionTournamentBracketsView
  'tournament_brackets_sumo-standard': views.CompetitionTournamentBracketsView
  'votes_freestyle_audience': views.CompetitionVotesView
  'votes_freestyle_jury': views.CompetitionVotesView
}
