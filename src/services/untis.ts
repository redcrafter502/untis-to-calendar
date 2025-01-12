import webuntis from 'webuntis'
import momentTimezone from 'moment-timezone'
import { authenticator as Authenticator } from 'otplib'

const parseTime = (time: number) => {
  const hour = Math.floor(time / 100)
  const minute = time % 100
  return [hour, minute]
}

const getCurrentAndNextWeekRange = () => {
  const now = new Date()

  // Calculate the start of the current week (Monday)
  const startOfCurrentWeek = new Date(now)
  startOfCurrentWeek.setDate(now.getDate() - now.getDay() + 1) // Monday

  // Calculate the end of the next week (Sunday)
  const endOfNextWeek = new Date(startOfCurrentWeek)
  endOfNextWeek.setDate(startOfCurrentWeek.getDate() + 13) // Next week's Sunday

  return { startOfCurrentWeek, endOfNextWeek }
}

type UntisAccessOrPublicData = {
  untisAccesses: {
    type: 'public' | 'password' | 'secret'
    untisAccessId?: number
    userId?: number
    name?: string
    urlId?: string
    school: string
    domain: string
    timezone?: string
    createdAt?: string
    updatedAt?: string
  }
  passwordUntisAccesses?: {
    untisAccessId: number
    password: string
    username: string
  } | null
  secretUntisAccesses?: {
    untisAccessId: number
    secret: string
    username: string
  } | null
  publicUntisAccesses?: {
    untisAccessId: number
    classId: string
  } | null
}

export const getWebUntis = (untisAccess: UntisAccessOrPublicData) => {
  console.log('untis', untisAccess)

  switch (untisAccess.untisAccesses.type) {
    case 'public':
      return new webuntis.WebUntisAnonymousAuth(
        untisAccess.untisAccesses.school,
        untisAccess.untisAccesses.domain,
      )
    case 'password':
      return new webuntis.WebUntis(
        untisAccess.untisAccesses.school,
        untisAccess.passwordUntisAccesses?.username!,
        untisAccess.passwordUntisAccesses?.password!,
        untisAccess.untisAccesses.domain,
      )
    case 'secret':
      return new webuntis.WebUntisSecretAuth(
        untisAccess.untisAccesses.school,
        untisAccess.secretUntisAccesses?.username!,
        untisAccess.secretUntisAccesses?.secret!,
        untisAccess.untisAccesses.domain,
        'custom-identity',
        Authenticator,
      )
  }

  /*if (
    untisAccess.untisAccesses.type === 'password' &&
    untisAccess.passwordUntisAccesses
  ) {
    return new webuntis.WebUntis(
      untisAccess.untisAccesses.school,
      untisAccess.passwordUntisAccesses.username,
      untisAccess.passwordUntisAccesses.password,
      untisAccess.untisAccesses.domain,
    )
  } else {
    return new webuntis.WebUntisAnonymousAuth(
      untisAccess.untisAccesses.school,
      untisAccess.untisAccesses.domain,
    )
  }*/
}

const getPublicTimetable = async (
  startOfCurrentWeek: string | number | Date,
  endOfNextWeek: number | Date,
  classId: any,
  untis: webuntis.Base,
) =>
  await untis
    .getTimetableForRange(
      <Date>startOfCurrentWeek,
      <Date>endOfNextWeek,
      classId,
      webuntis.WebUntisElementType.CLASS,
    )
    .catch(async (err) => {
      console.error('Timetable for range (or parts of it) not available', err)
      console.info('Now requesting each day individually from Untis')
      const returnTimetable = []
      for (
        let date = new Date(startOfCurrentWeek);
        date <= endOfNextWeek;
        date.setDate(date.getDate() + 1)
      ) {
        const dayTimetable = await untis
          .getTimetableFor(date, classId, webuntis.WebUntisElementType.CLASS)
          .catch((dayErr) => {
            console.error('Timetable not available for', date, dayErr)
          })
        if (dayTimetable) {
          returnTimetable.push(...dayTimetable)
        }
      }
      return returnTimetable
    })

const getOwnTimetable = async (
  startOfCurrentWeek: string | number | Date,
  endOfNextWeek: number | Date,
  untis: webuntis.Base,
) =>
  await untis
    .getOwnTimetableForRange(<Date>startOfCurrentWeek, <Date>endOfNextWeek)
    .catch(async (err) => {
      console.error('Timetable for range (or parts of it) not available', err)
      console.info('Now requesting each day individually from Untis')
      const returnTimetable = []
      for (
        let date = new Date(startOfCurrentWeek);
        date <= endOfNextWeek;
        date.setDate(date.getDate() + 1)
      ) {
        const dayTimetable = await untis
          .getOwnTimetableFor(date)
          .catch((dayErr) => {
            console.error('Timetable not available for', date, dayErr)
          })
        if (dayTimetable) {
          returnTimetable.push(...dayTimetable)
        }
      }
      return returnTimetable
    })

const getTimetable = async (
  startOfCurrentWeek: Date,
  endOfNextWeek: Date,
  untisAccess: UntisAccess,
  untis: webuntis.Base,
) => {
  if (
    untisAccess.untisAccesses.type === 'public' &&
    untisAccess.publicUntisAccesses
  ) {
    return await getPublicTimetable(
      startOfCurrentWeek,
      endOfNextWeek,
      untisAccess.publicUntisAccesses.classId,
      untis,
    )
  } else {
    return await getOwnTimetable(startOfCurrentWeek, endOfNextWeek, untis)
  }
}

type UntisAccess = {
  untisAccesses: {
    type: 'public' | 'password' | 'secret'
    untisAccessId: number
    userId: number
    name: string
    urlId: string
    school: string
    domain: string
    timezone: string
    createdAt: string
    updatedAt: string
  }
  passwordUntisAccesses: {
    untisAccessId: number
    password: string
    username: string
  } | null
  publicUntisAccesses: {
    untisAccessId: number
    classId: string
  } | null
  secretUntisAccesses?: {
    untisAccessId: number
    secret: string
    username: string
  } | null
}

export const getEvents = async (untisAccess: UntisAccess) => {
  const untis = getWebUntis(untisAccess)
  await untis.login().catch((err) => {
    console.error('Login Error (getEvents)', err)
  })
  const { startOfCurrentWeek, endOfNextWeek } = getCurrentAndNextWeekRange()
  const timetable = await getTimetable(
    startOfCurrentWeek,
    endOfNextWeek,
    untisAccess,
    untis,
  )

  let homework = {
    records: [],
    homeworks: [],
    teachers: [],
    lessons: [],
  }
  let examEvents: {
    start: number[]
    startInputType: string
    startOutputType: string
    end: number[]
    endInputType: string
    endOutputType: string
    title: string
    description: string
    location: string
    status: string
    busyStatus: string
    transp: string
    calName: any
  }[] = []
  if (
    untisAccess.untisAccesses.type === 'password' ||
    untisAccess.untisAccesses.type === 'secret'
  ) {
    // @ts-ignore
    homework = await untis.getHomeWorksFor(startOfCurrentWeek, endOfNextWeek)

    const { startDate, endDate } = await untis.getCurrentSchoolyear()
    const exams = await untis.getExamsForRange(startDate, endDate)
    examEvents = exams.map((exam) => {
      const year = Math.floor(exam.examDate / 10000)
      const month = Math.floor((exam.examDate % 10000) / 100)
      const day = exam.examDate % 100
      const [startHour, startMinute] = parseTime(exam.startTime)
      const [endHour, endMinute] = parseTime(exam.endTime)
      const startUtc = momentTimezone
        .tz(
          [year, month - 1, day, startHour, startMinute],
          untisAccess.untisAccesses.timezone,
        )
        .utc()
      const endUtc = momentTimezone
        .tz(
          [year, month - 1, day, endHour, endMinute],
          untisAccess.untisAccesses.timezone,
        )
        .utc()
      const title = `${exam.name} (${exam.examType})` || 'NO TITLE'
      const description =
        `${exam.name} (${exam.subject} - ${exam.studentClass.join(' ')} - ${exam.teachers.join(' ')}) ${exam.text}` ||
        'NO DESCRIPTION'
      const location = exam.rooms.join(' ') || 'NO LOCATION'

      return {
        start: [
          startUtc.year(),
          startUtc.month() + 1,
          startUtc.date(),
          startUtc.hour(),
          startUtc.minute(),
        ],
        startInputType: 'utc',
        startOutputType: 'utc',
        end: [
          endUtc.year(),
          endUtc.month() + 1,
          endUtc.date(),
          endUtc.hour(),
          endUtc.minute(),
        ],
        endInputType: 'utc',
        endOutputType: 'utc',
        title,
        description,
        location,
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        transp: 'OPAQUE',
        calName: untisAccess.untisAccesses.name,
      }
    })
  }

  const events = timetable.map((lesson) => {
    const homeworks: string[] = []
    homework.homeworks.forEach((iHomework) => {
      const homeworkLesson = homework.lessons.filter(
        // @ts-ignore
        (l) => l.id === iHomework.lessonId,
      )
      // @ts-ignore
      const correctLesson =
        // @ts-ignore
        homeworkLesson[0].subject ===
        `${lesson.su[0].longname} (${lesson.su[0].name})`
      // @ts-ignore
      if (lesson.date === iHomework.date && correctLesson) {
        // @ts-ignore
        homeworks.push(`${iHomework.text} (Start)`)
      }
      // @ts-ignore
      if (lesson.date === iHomework.dueDate && correctLesson) {
        // @ts-ignore
        homeworks.push(`${iHomework.text} (End)`)
      }
    })

    const year = Math.floor(lesson.date / 10000)
    const month = Math.floor((lesson.date % 10000) / 100)
    const day = lesson.date % 100
    const [startHour, startMinute] = parseTime(lesson.startTime)
    const [endHour, endMinute] = parseTime(lesson.endTime)
    const title = lesson.su[0].name || lesson.lstext || 'NO TITLE'
    const description =
      `${lesson.su[0].longname} - ${lesson.kl.map((k) => k.name).join(', ')}` ||
      `${lesson.lstext} - ${lesson.kl[0].name}` ||
      'NO DESCRIPTION'
    const location =
      `${lesson.ro[0].longname} (${lesson.ro[0].name})` || 'NO LOCATION'
    const startUtc = momentTimezone
      .tz(
        [year, month - 1, day, startHour, startMinute],
        untisAccess.untisAccesses.timezone,
      )
      .utc()
    const endUtc = momentTimezone
      .tz(
        [year, month - 1, day, endHour, endMinute],
        untisAccess.untisAccesses.timezone,
      )
      .utc()
    const descriptionWithHomework = [description, ...homeworks].join(`\n`)
    const titleWithInfoMark = title + (homeworks.length > 0 ? ' ℹ️' : '')

    return {
      start: [
        startUtc.year(),
        startUtc.month() + 1,
        startUtc.date(),
        startUtc.hour(),
        startUtc.minute(),
      ],
      startInputType: 'utc',
      startOutputType: 'utc',
      end: [
        endUtc.year(),
        endUtc.month() + 1,
        endUtc.date(),
        endUtc.hour(),
        endUtc.minute(),
      ],
      endInputType: 'utc',
      endOutputType: 'utc',
      title: titleWithInfoMark,
      description: descriptionWithHomework,
      location,
      status: lesson.code === 'cancelled' ? 'CANCELLED' : 'CONFIRMED',
      busyStatus: lesson.code === 'cancelled' ? 'FREE' : 'BUSY',
      transp: lesson.code === 'cancelled' ? 'TRANSPARENT' : 'OPAQUE',
      calName: untisAccess.untisAccesses.name,
    }
  })
  await untis.logout()
  return [...events, ...examEvents]
}
