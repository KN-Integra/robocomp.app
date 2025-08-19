import { createKysely } from '@vercel/postgres-kysely'

import type { H3Error } from 'h3'
import type { Database } from '~/types/db/Database'
import type { CountriesView } from '~/types/db/Views'

export interface CountriesResponse {
  statusCode: number
  data: {
    countries: CountriesView[]
  }
}

export default defineEventHandler(async (): Promise<CountriesResponse | H3Error> => {
  const kyselyDb = createKysely<Database>()
  try {
    const countries = (await kyselyDb
      .selectFrom('robocomp.countries' as any)
      .orderBy('name')
      .selectAll()
      .execute())
    await kyselyDb.destroy()
    return {
      statusCode: 200,
      data: {
        countries
      }
    } as CountriesResponse
  } catch (error) {
    await kyselyDb.destroy()
    console.error(error)

    return createError({
      statusCode: 500,
      message: (error as Error).message
    })
  }
})
