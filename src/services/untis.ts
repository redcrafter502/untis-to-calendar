import webuntis from 'webuntis'
import momentTimezone from 'moment-timezone'
import { authenticator as Authenticator } from 'otplib'
import { getUntis } from '@/new-untis/untis-webuntis'
import { Result, ok, err } from 'neverthrow'

const parseTime = (time: number) => {
  const hour = Math.floor(time / 100)
  const minute = time % 100
  return [hour, minute]
}

const getCurrentAndNextWeekRange = () => {
  const now = new Date()

  // Calculate the start of the current week (Monday)
  const startOfCurrentWeek = new Date(now)
  // TODO: change back to +1
  startOfCurrentWeek.setDate(now.getDate() - now.getDay() - 6) // Monday

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

function getAuth(
  untisAccess: UntisAccess,
):
  | { type: 'password'; username: string; password: string }
  | { type: 'secret'; username: string; secret: string }
  | { type: 'public'; classId: number }
  | undefined {
  if (
    untisAccess.untisAccesses.type === 'password' &&
    untisAccess.passwordUntisAccesses
  )
    return {
      type: 'password',
      username: untisAccess.passwordUntisAccesses.username,
      password: untisAccess.passwordUntisAccesses.password,
    }
  if (
    untisAccess.untisAccesses.type === 'secret' &&
    untisAccess.secretUntisAccesses
  )
    return {
      type: 'secret',
      username: untisAccess.secretUntisAccesses.username,
      secret: untisAccess.secretUntisAccesses.secret,
    }
  if (
    untisAccess.untisAccesses.type === 'public' &&
    untisAccess.publicUntisAccesses
  )
    return {
      type: 'public',
      classId: Number(untisAccess.publicUntisAccesses.classId),
    }
}

export const getEvents = async (
  untisAccess: UntisAccess,
): Promise<Result<any, string>> => {
  const auth = getAuth(untisAccess)
  if (!auth) return err('Incorrect UntisAccess')
  const untis = getUntis({
    school: untisAccess.untisAccesses.school,
    url: untisAccess.untisAccesses.domain,
    timezone: untisAccess.untisAccesses.timezone,
    auth,
  })
  const session = await untis.login()
  if (session.isErr()) return err(session.error)
  const { startOfCurrentWeek, endOfNextWeek } = getCurrentAndNextWeekRange()

  let examEvents: Result<any, string>[] = []
  if (
    untisAccess.untisAccesses.type === 'password' ||
    untisAccess.untisAccesses.type === 'secret'
  ) {
    const exams = await untis.getExamsForCurrentSchoolyear(session.value)
    if (exams.isErr()) return err(exams.error)
    examEvents = exams.value.map((exam): Result<any, string> => {
      if (exam.startTime.isErr()) return err(exam.startTime.error.message)
      const year = exam.startTime.value.getUTCFullYear()
      const month = exam.startTime.value.getUTCMonth()
      const day = exam.startTime.value.getUTCDate()
      const startHour = exam.startTime.value.getUTCHours()
      const startMinute = exam.startTime.value.getUTCMinutes()
      if (exam.endTime.isErr()) return err(exam.endTime.error.message)
      const endHour = exam.endTime.value.getUTCHours()
      const endMinute = exam.endTime.value.getUTCMinutes()
      const title = `${exam.exam.name} (${exam.exam.examType})` || 'NO TITLE'
      const description =
        `${exam.exam.name} (${exam.exam.subject} - ${exam.exam.studentClass.join(' ')} - ${exam.exam.teachers.join(' ')}) ${exam.exam.text}` ||
        'NO DESCRIPTION'
      const location = exam.exam.rooms.join(' ') || 'NO LOCATION'

      return ok({
        start: [year, month + 1, day, startHour, startMinute],
        startInputType: 'utc',
        startOutputType: 'utc',
        end: [year, month + 1, day, endHour, endMinute],
        endInputType: 'utc',
        endOutputType: 'utc',
        title,
        description,
        location,
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        transp: 'OPAQUE',
        calName: untisAccess.untisAccesses.name,
      })
    })
  }

  const timetable = await untis.getTimetableWithHomework(
    startOfCurrentWeek,
    endOfNextWeek,
    session.value,
  )
  await untis.logout(session.value)
  if (timetable.isErr()) return err(timetable.error)

  const events = timetable.value.map((lesson): Result<any, string> => {
    if (lesson.startTime.isErr()) return err(lesson.startTime.error.message)
    const year = lesson.startTime.value.getUTCFullYear()
    const month = lesson.startTime.value.getUTCMonth()
    const day = lesson.startTime.value.getUTCDate()
    const startHour = lesson.startTime.value.getUTCHours()
    const startMinute = lesson.startTime.value.getUTCMinutes()
    if (lesson.endTime.isErr()) return err(lesson.endTime.error.message)
    const endHour = lesson.endTime.value.getUTCHours()
    const endMinute = lesson.endTime.value.getUTCMinutes()
    const lessonSu = lesson.lesson.su || []
    const title = lessonSu[0]?.name || lesson.lesson.lstext || 'NO TITLE'
    const lessonKl = lesson.lesson.kl || []
    const description =
      `${lessonSu[0]?.longname} - ${lesson.lesson.kl?.map((k) => k.name).join(', ')}` ||
      `${lesson.lesson.lstext} - ${lessonKl[0].name}` ||
      'NO DESCRIPTION'
    const lessonRo = lesson.lesson.ro || []
    const location =
      `${lessonRo[0]?.longname} (${lessonRo[0]?.name})` || 'NO LOCATION'
    const homeworkStart = lesson.homeworkStart.map((homework) => homework.text)
    const homeworkEnd = lesson.homeworkEnd.map((homework) => homework.text)
    const descriptionWithHomework = [
      description,
      'Homework to today:',
      ...homeworkEnd,
      'Homework from today:',
      ...homeworkStart,
    ].join(`\n`)
    const titleWithInfoMark = title + (homeworkEnd.length > 0 ? ' ℹ️' : '')

    return ok({
      start: [year, month + 1, day, startHour, startMinute],
      startInputType: 'utc',
      startOutputType: 'utc',
      end: [year, month + 1, day, endHour, endMinute],
      endInputType: 'utc',
      endOutputType: 'utc',
      title: titleWithInfoMark,
      description: descriptionWithHomework,
      location,
      status: lesson.lesson.code === 'cancelled' ? 'CANCELLED' : 'CONFIRMED',
      busyStatus: lesson.lesson.code === 'cancelled' ? 'FREE' : 'BUSY',
      transp: lesson.lesson.code === 'cancelled' ? 'TRANSPARENT' : 'OPAQUE',
      calName: untisAccess.untisAccesses.name,
    })
  })
  return ok([
    ...events.filter((event) => event.isOk()).map((event) => event.value),
    ...examEvents.filter((event) => event.isOk()).map((event) => event.value),
  ])
}
