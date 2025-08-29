import { createKysely } from '@vercel/postgres-kysely'

import type { H3Error } from 'h3'
import type { Database } from '~/types/db/Database'
import type { CompetitionView } from '~/types/db/Views'

export interface CompetitionResponse {
  statusCode: number
  data: {
    competitions: CompetitionView[]
  }
}

export default defineEventHandler(async (): Promise<CompetitionResponse | H3Error> => {
  const kyselyDb = createKysely<Database>()
  try {
    const competitions = (await kyselyDb
      .selectFrom('robocomp.competition' as any)
      .selectAll()
      .execute()) as CompetitionView[]
    await kyselyDb.destroy()
    return {
      statusCode: 200,
      data: {
        competitions
      }
    } as CompetitionResponse
  } catch (error) {
    await kyselyDb.destroy()
    console.error(error)

    return createError({
      statusCode: 500,
      message: (error as Error).message
    })
  }
})
