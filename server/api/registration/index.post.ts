import { createKysely } from '@vercel/postgres-kysely'

import { isValidEmail, isValidPhone, isValidPostalCode } from '~/server/utils/formValidator'

import type { Database } from '~/types/db/Database'

export enum RegistrationStatus {
  CorrectAdding,
  InvalidTeamName,
  InvalidCaptain,
  InvalidParticipant,
  InvalidRobot,
  MissingConsent,
  DatabaseFail
}

const shirtSizes = ['S', 'M', 'L', 'XL', 'XXL']

export interface RegistrationResponse {
  statusCode: RegistrationStatus
  message?: string
}

interface Captain {
  name: string
  surname: string
  shirtSize: string
  email: string
  phone: string
  street: string
  postalCode: string
  city: string
  country: string
}

interface Participant {
  name: string
  surname: string
  shirtSize: string
}

interface Robot {
  name: string
  category: string
}

export interface RegistrationRequest {
  teamName: string
  captain: Captain
  participants: Participant[]
  robots: Robot[]
  agreePrivacy: boolean
  agreeTerms: boolean
}

function checkCaptainData(captain: Captain): boolean {
  if (!captain) {
    return false
  }
  if (!(captain.name && captain.name.length > 0 && captain.name.length <= 50)) {
    return false
  }

  if (!(captain.surname && captain.surname.length > 0 && captain.surname.length <= 50)) {
    return false
  }

  if (!(captain.shirtSize && shirtSizes.includes(captain.shirtSize))) {
    return false
  }

  if (!(captain.email && captain.email.length > 0 && captain.email.length <= 50 && isValidEmail(captain.email))) {
    return false
  }

  if (!(captain.phone && captain.phone.length > 0 && captain.phone.length <= 50 && isValidPhone(captain.phone))) {
    return false
  }

  if (!(captain.street && captain.street.length > 0 && captain.street.length <= 100)) {
    return false
  }

  if (!(captain.postalCode && captain.postalCode.length === 6 && isValidPostalCode(captain.postalCode))) {
    return false
  }

  if (!(captain.city && captain.city.length > 0 && captain.city.length <= 50)) {
    return false
  }

  return captain.country !== undefined && captain.country.length === 2
}

function checkParticipantsData(participants: Participant[]): boolean {
  if (!(participants && participants.length >= 0 && participants.length <= 9)) {
    return false
  }
  for (const participant of participants) {
    if (!participant) {
      return false
    }
    if (!(participant.name && participant.name.length > 0 && participant.name.length <= 50)) {
      return false
    }

    if (!(participant.surname && participant.surname.length > 0 && participant.surname.length <= 50)) {
      return false
    }

    if (!(participant.shirtSize && shirtSizes.includes(participant.shirtSize))) {
      return false
    }
  }
  return true
}

function checkRobotsData(robots: Robot[]): boolean {
  if (!(robots && robots.length > 0 && robots.length <= 5)) {
    return false
  }
  for (const robot of robots) {
    if (!robot) {
      return false
    }
    if (!(robot.name && robot.name.length > 0 && robot.name.length <= 100)) {
      return false
    }

    if (!(robot.category && robot.category.length > 0 && robot.category.length <= 100)) {
      return false
    }
  }
  return true
}

async function add2Database(record: RegistrationRequest): Promise<RegistrationResponse> {
  // TODO: ZMIENIĆ NA TRANSAKCJE WRAZ Z ZMIANA BIBLIOTEKI
  const db = createKysely<Database>()
  try {
    const team = await db
      .insertInto('robocomp.team' as any)
      .values({ name: record.teamName })
      .returning('id')
      .executeTakeFirstOrThrow()

    const teamId = team.id

    const captainParticipant = await db
      .insertInto('robocomp.participant' as any)
      .values({
        first_name: record.captain.name,
        last_name: record.captain.surname,
        size: record.captain.shirtSize
      })
      .returning('id')
      .executeTakeFirstOrThrow()

    const captainId = captainParticipant.id

    await db
      .insertInto('robocomp.participant_address' as any)
      .values({
        participant_id: captainId,
        email: record.captain.email,
        phone: record.captain.phone,
        street_address: record.captain.street,
        admin_level2: record.captain.city,
        postal_code: record.captain.postalCode,
        country_code: record.captain.country
      })
      .execute()

    await db
      .insertInto('robocomp.team_participant' as any)
      .values({ team_id: teamId, participant_id: captainId, role: 'leader' })
      .execute()

    for (const participant of record.participants) {
      const par = await db
        .insertInto('robocomp.participant' as any)
        .values({ first_name: participant.name, last_name: participant.surname, size: participant.shirtSize })
        .returning('id')
        .executeTakeFirstOrThrow()

      await db
        .insertInto('robocomp.team_participant' as any)
        .values({ team_id: teamId, participant_id: par.id, role: 'participant' })
        .execute()
    }

    for (const robot of record.robots) {
      await db
        .insertInto('robocomp.robot' as any)
        .values({ name: robot.name, robot_no: 0, team_id: teamId, competition: robot.category })
        .execute()
    }

    return { statusCode: RegistrationStatus.CorrectAdding }
  } catch (error) {
    console.error(error)
    return { statusCode: RegistrationStatus.DatabaseFail }
  }
}

export default defineEventHandler(async (event): Promise<RegistrationResponse> => {
  // Parsujemy body JSON z żądania POST
  const body = (await readBody(event)) as RegistrationRequest

  if (!(body.teamName && body.teamName.length > 0 && body.teamName.length <= 50)) {
    return {
      statusCode: RegistrationStatus.InvalidTeamName
    }
  }

  if (!checkCaptainData(body.captain)) {
    return {
      statusCode: RegistrationStatus.InvalidCaptain
    }
  }

  if (!checkParticipantsData(body.participants)) {
    return {
      statusCode: RegistrationStatus.InvalidParticipant
    }
  }

  if (!checkRobotsData(body.robots)) {
    return {
      statusCode: RegistrationStatus.InvalidRobot
    }
  }
  if (!body.agreeTerms || !body.agreePrivacy) {
    return {
      statusCode: RegistrationStatus.MissingConsent
    }
  }
  return await add2Database(body)
})
