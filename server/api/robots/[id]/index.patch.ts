import { createKysely } from '@vercel/postgres-kysely'

import auth, { AccessResourceMethods } from '~/server/utils/auth'

import type { Database } from '~/types/db/Database'

export default defineEventHandler(async (event) => {
  const isAuthorized = await auth.user(event, 'robots', AccessResourceMethods.PATCH)

  if (!isAuthorized) {
    return createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const body = await readBody(event)

  const { id } = event.context.params as { id: string }

  const db = createKysely<Database>()

  try {
    if (body.name !== undefined || body.competition !== undefined || body.status !== undefined) {
      await db
        .withSchema('robocomp')
        .updateTable('robot')
        .set({
          name: body.name,
          competition: body.competition,
          status: body.status
        })
        .where('id', '=', Number(id))
        .executeTakeFirst()
    }
  } catch (error) {
    console.error(error)

    db.destroy()

    return createError({
      statusCode: 500,
      message: 'Failed to update robot'
    })
  }

  db.destroy()
})
