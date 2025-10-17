import { createKysely } from '@vercel/postgres-kysely'

import type { H3Error } from 'h3'
import type { Database } from '~/types/db/Database'
import type { TeamRow, RobotRow, ParticipantRow, TeamsParticipantsRow } from '~/types/db/Schema'

export interface TeamsDetailsResponse {
  statusCode: number
  data: {
    team: TeamRow
    robots: (RobotRow & { competition_display_name: string })[]
    participants: (ParticipantRow & TeamsParticipantsRow)[]
  }
}

export default defineEventHandler(async (event): Promise<TeamsDetailsResponse | H3Error> => {
  const { id: teamId } = event.context.params as { id: string }

  if (!teamId) {
    return createError({ statusCode: 400, message: 'Team ID is required' })
  }

  const kyselyDb = createKysely<Database>()
  try {
    const team = await kyselyDb
      .withSchema('robocomp')
      .selectFrom('team')
      .where('id', '=', parseInt(teamId, 10))
      .selectAll()
      .executeTakeFirst()

    const robots = (await kyselyDb
      .withSchema('robocomp')
      .selectFrom('robot')
      .innerJoin('competition', 'robot.competition', 'competition.name')
      .where('team_id', '=', parseInt(teamId, 10))
      .selectAll('robot')
      .select('competition.display_name as competition_display_name')
      .execute()) as RobotRow[]

    const participants = (await kyselyDb
      .withSchema('robocomp')
      .selectFrom('team_participant')
      .innerJoin('participant', 'team_participant.participant_id', 'participant.id')
      .where('team_participant.team_id', '=', parseInt(teamId, 10))
      .selectAll()
      .execute()) as (ParticipantRow & TeamsParticipantsRow)[]

    return {
      statusCode: 200,
      data: {
        team,
        robots,
        participants
      }
    } as TeamsDetailsResponse
  } catch (error) {
    kyselyDb.destroy()
    console.error(error)

    return createError({
      statusCode: 500,
      message: (error as Error).message
    })
  }
})
