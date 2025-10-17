import { createKysely } from '@vercel/postgres-kysely'

import auth, { AccessResourceMethods } from '~/server/utils/auth'

import type { Database } from '~/types/db/Database'

export default defineEventHandler(async (event) => {
  const isAuthorized = await auth.user(event, 'participants', AccessResourceMethods.PATCH)

  if (!isAuthorized) {
    return createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  const { id } = event.context.params as { id: string }
  const teamId = getQuery(event).teamId as string

  if (!teamId || isNaN(Number(teamId))) {
    return createError({ statusCode: 400, message: 'teamId query parameter is required and must be a number' })
  }

  if (!id || isNaN(Number(id))) {
    return createError({ statusCode: 400, message: 'Invalid participant id' })
  }

  const db = createKysely<Database>()

  try {
    if (body.status !== undefined || body.tshirt !== undefined) {
      await db
        .withSchema('robocomp')
        .updateTable('team_participant')
        .set({
          status: body.status,
          received_tshirt: body.tshirt
        })
        .where('participant_id', '=', Number(id))
        .where('team_id', '=', Number(teamId))
        .executeTakeFirst()
    }

    if (body.first_name !== undefined || body.last_name !== undefined || body.size !== undefined) {
      await db
        .withSchema('robocomp')
        .updateTable('participant')
        .set({
          first_name: body.first_name,
          last_name: body.last_name,
          size: body.size
        })
        .where('id', '=', Number(id))
        .executeTakeFirst()
    }
  } catch (error) {
    console.error(error)

    db.destroy()

    return createError({
      statusCode: 500,
      message: 'Failed to update participant'
    })
  }

  db.destroy()
})
