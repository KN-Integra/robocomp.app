import { Pool, neonConfig } from '@neondatabase/serverless'
import { Kysely, PostgresDialect, sql } from 'kysely'
import ws from 'ws'

import { Competition } from '~/settings/constants'

import type { NuxtError } from '@nuxt/types'
import type { Database } from '~/types/db/Database'

neonConfig.webSocketConstructor = ws

const runtimeConfig = useRuntimeConfig()

export enum StatsTypes {
  'competitions' = 'competitions',
  'average' = 'average',
  'total' = 'total'
}

export interface StatsQuery {
  year: string
  types: string | string[]
}

export interface StatsResultsBase extends Record<StatsTypes, unknown> {
  competitions: {
    competition: string
    count: number
    color: string
  }[]
  average: {
    avg_members_count: number
    avg_robots_count: number
  }
  total: {
    total_teams: number
    total_members_count: number
    total_robots_count: number
  }
}

export type StatsResults = Partial<StatsResultsBase>

export interface StatsResponse {
  statusCode: number
  data: StatsResults
}

export default defineEventHandler(async (event): Promise<StatsResponse | NuxtError> => {
  const query = getQuery<Partial<StatsQuery>>(event)
  const year = query.year || new Date().getFullYear().toString()

  if (!year.match(/^20\d{2}$/)) {
    return createError({
      statusCode: 400,
      statusMessage: 'Invalid year'
    })
  }

  const types = typeof query.types === 'string' ? [query.types] : query.types

  if (!types || !types.length) {
    return createError({
      statusCode: 400,
      statusMessage: 'Missing stats types'
    })
  }

  const invalidTypes = types.filter((type) => !Object.values(StatsTypes).includes(type as StatsTypes))

  const uniqueTypes = [...new Set(types)]

  if (invalidTypes.length) {
    return createError({
      statusCode: 400,
      statusMessage: `Invalid stats types: ${invalidTypes.join(', ')}`
    })
  }

  const results: StatsResults = {}

  const pool = new Pool({
    user: runtimeConfig.POSTGRES_USER,
    password: runtimeConfig.POSTGRES_PASSWORD,
    host: runtimeConfig.POSTGRES_HOST,
    database: runtimeConfig.POSTGRES_DATABASE
  })

  const db = new Kysely<Database>({
    dialect: new PostgresDialect({ pool })
  })

  try {
    for (const type of uniqueTypes) {
      switch (type) {
        case StatsTypes.competitions:
          results.competitions = (
            (await db
              .withSchema('robocomp')
              .selectFrom('robot')
              .innerJoin('competition', 'robot.competition', 'competition.name')
              .select(
                ({ fn }) =>
                  [
                    'competition.name',
                    'competition.display_name',
                    'competition.color',
                    fn.countAll().as('count')
                  ] as any
              )
              .groupBy(['competition.name', 'competition.display_name', 'competition.color'])
              .orderBy('competition.display_name')
              .where('robot.year', '=', Number(year))
              .execute()) || []
          ).map((row) => ({
            ...row,
            competition: row.display_name || row.name
          }))
          break

        case StatsTypes.average:
          results.average = await db
            .withSchema('robocomp')
            .selectFrom('teams_details')
            .select(({ fn }) => [
              fn.avg('members_count').as('avg_members_count'),
              fn.avg('robots_count').as('avg_robots_count')
            ])
            .where('year', '=', Number(year))
            .executeTakeFirstOrThrow()
          break

        case StatsTypes.total:
          results.total = await db
            .withSchema('robocomp')
            .selectFrom('teams_details')
            .select(({ fn }) => [
              fn.countAll().as('total_teams'),
              fn.sum('members_count').as('total_members_count'),
              fn.sum('robots_count').as('total_robots_count')
            ])
            .where('year', '=', Number(year))
            .executeTakeFirstOrThrow()
          break
      }
    }

    db.destroy()

    return {
      statusCode: 200,
      data: results
    }
  } catch (error) {
    console.error(error)

    db.destroy()

    return createError({
      statusCode: 500,
      statusMessage: 'Internal server error',
      stack: (error as Error).stack
    })
  }
})
