import { createKysely } from '@vercel/postgres-kysely'

import type { H3Error } from 'h3'
import type { Database } from '~/types/db/Database'
import type { TeamsDetailsRow } from '~/types/db/Views'

export interface TeamsResponse {
  statusCode: number
  data: {
    teams: TeamsDetailsRow[]
  }
}

export default defineEventHandler(async (): Promise<TeamsResponse | H3Error> => {
  const kyselyDb = createKysely<Database>()
  try {
    const teams = (await kyselyDb
      .selectFrom('robocomp.teams_details' as any)
      .where('year', '=', new Date().getFullYear())
      .selectAll()
      .execute()) as TeamsDetailsRow[]
    kyselyDb.destroy()
    return {
      statusCode: 200,
      data: {
        teams
      }
    } as TeamsResponse
  } catch (error) {
    kyselyDb.destroy()
    console.error(error)

    return createError({
      statusCode: 500,
      message: (error as Error).message
    })
  }
})
