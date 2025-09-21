import { createKysely } from '@vercel/postgres-kysely'

import type { H3Error } from 'h3'
import type { Database } from '~/types/db/Database'

export interface IsExistTeamResponse {
  statusCode: number
  data: {
    isExist: boolean
  }
}

export default defineEventHandler(async (event): Promise<IsExistTeamResponse | H3Error> => {
  const kyselyDb = createKysely<Database>()
  const query = getQuery(event)

  const name = query.name
  const year = query.year ? Number(query.year) : new Date().getFullYear()
  
  if (!name || typeof name !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Brak lub nieprawidłowa nazwa drużyny.'
    })
  }
  try {
    const result = await kyselyDb
      .selectFrom('robocomp.team' as any)
      .select(['id'])
      .where('name', '=', name)
      .where('year', '=', year)
      .limit(1)
      .execute()

    return {
      statusCode: 200,
      data: {
        isExist: result.length > 0
      }
    }
  } catch (error) {
    console.error(error)
    return {
      statusCode: 500,
      data: {
        isExist: false
      }
    }
  }
})
