import { createKysely } from '@vercel/postgres-kysely'
import { sql } from 'kysely'

import type { H3Error } from 'h3'

export interface Schedule {
  id: number
  name: string
  start_date: string
  end_date: string
  competition?: string
}

export interface ScheduleResponse {
  data: {
    results: Schedule[]
    competitionNames: string[]
    competitionKeys: string[]
    scheduleTypes: string[]
    events: string[]
  }
  statusCode: number
}

export default defineEventHandler(async (event): Promise<ScheduleResponse | H3Error> => {
  const query = getQuery<Partial<{ year: string }>>(event)
  const year = query.year || new Date().getFullYear().toString()

  if (!year.match(/^20\d{2}$/)) {
    return createError({
      statusCode: 400,
      statusMessage: 'Invalid year'
    })
  }

  const db = createKysely()

  try {
    const schedules = (await db
      .withSchema('robocomp')
      .selectFrom('schedule')
      .innerJoin('competition', 'schedule.competition', 'competition.name')
      .select([
        'schedule.id',
        sql<string>`REPLACE(schedule.name, ' ' || CAST(${new Date().getFullYear()} AS VARCHAR(4)), '')`.as('name'),
        'schedule.start_date',
        'schedule.end_date',
        'schedule.competition',
        'competition.display_name'
      ] as any)
      .where('schedule.name' as any, 'like', '% ' + year)
      .where('schedule.name' as any, 'not like', '%Jury%')
      .execute()) as Schedule[]

    db.destroy()

    const competitions = schedules
      .filter((schedule) => schedule.competition && schedule.competition !== 'events')
      .toSorted((a, b) => b.competition!.localeCompare(a.competition!))
      .map((schedule) => ({
        key: schedule.competition,
        name: schedule.display_name || schedule.competition,
        type: schedule.name.split(' ')[0]
      }))

    const events = schedules
      .filter((schedule) => schedule.competition === 'events')
      .map((schedule) => schedule.name.split(' ').slice(1).join(' '))

    return {
      statusCode: 200,
      data: {
        results: schedules.map((schedule) => ({
          ...schedule,
          name: schedule.display_name ? `${schedule.name.split(' ')[0]} ${schedule.display_name}` : schedule.name
        })) as Schedule[],
        competitionNames: [...new Set(competitions.map((competition) => competition.name))],
        competitionKeys: [...new Set(competitions.map((competition) => competition.key!))],
        scheduleTypes: [...new Set(competitions.map((competition) => competition.type))],
        events
      }
    }
  } catch (error) {
    console.error(error)

    db.destroy()

    return createError({
      statusCode: 500,
      message: 'Failed to fetch schedules'
    })
  }
})
