import type { Schedule } from '~/server/api/schedule/index.get'

const getColorForScheduleType = (type: string): string => {
  switch (type) {
    case 'eliminations':
    case 'calibration':
      return '#7fb7df'
    case 'presentations':
      return '#f87171'
    case 'finals':
      return '#4295d0'
    case 'organizational':
      return '#404040'
    default:
      return '#000000'
  }
}

const EVENT_TYPE = {
  eliminations: 'Eliminacje',
  calibration: 'Kalibracja',
  presentations: 'Prezentacje',
  finals: 'Finał',
  organizational: 'Organizacyjne'
}

export default function prepareDataForSchedule(
  scheduleName: 'robots' | 'events',
  data: Schedule[],
  scheduleTypes: string[]
) {
  const annotationData = data.filter((schedule) => schedule.type === 'organizational')

  const scheduleData = data
    .filter(
      (schedule) =>
        schedule.type !== 'organizational' &&
        (scheduleName === 'robots' ? schedule.type !== 'event' : schedule.type === 'event')
    )
    .map((s) => {
      let category = s.name

      if (s.type in EVENT_TYPE) {
        category = category.replace(EVENT_TYPE[s.type as keyof typeof EVENT_TYPE] + ' ', '')
      }

      return { ...s, category }
    })
    .sort((a, b) => {
      return a.competition.localeCompare(b.competition)
    })

  const labels = [...new Set(scheduleData.map((s) => s.category))]

  const annotations = Object.fromEntries(
    annotationData.map((s) => [
      s.name,
      {
        type: 'box',
        xMin: -0.5,
        xMax: labels.length - 0.5,
        yMin: new Date(s.start_date).getTime(),
        yMax: new Date(s.end_date).getTime(),
        backgroundColor: '#404040',
        label: { display: true, content: s.name, color: 'white' }
      }
    ])
  )

  const eventStartDate = annotationData
    .toSorted((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .at(0)?.start_date

  const eventEndDate = annotationData
    .toSorted((a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime())
    .at(0)?.end_date

  if (!(eventStartDate && eventEndDate)) {
    throw new Error('Failed to find ROBOCOMP start or end date')
  }

  const datasets = scheduleTypes.map((type) => {
    const typeEvents = scheduleData.filter((s) => s.type === type)

    const color = getColorForScheduleType(type)

    const dataPoints = labels.map((label) => {
      const schedule = typeEvents.find((e) => e.category === label)
      return schedule ? [new Date(schedule.start_date).getTime(), new Date(schedule.end_date).getTime()] : null
    })

    return {
      typeEvents,
      label: EVENT_TYPE[type as keyof typeof EVENT_TYPE] || type,
      backgroundColor: color,
      data: dataPoints
    }
  })

  return {
    labels,
    annotations,
    datasets,
    eventStartDate: new Date(eventStartDate).getTime(),
    eventEndDate: new Date(eventEndDate).getTime()
  }
}
