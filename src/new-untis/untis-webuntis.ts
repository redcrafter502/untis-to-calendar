import webuntis from 'webuntis'
import { type } from 'arktype'
import { ok, err, Result } from 'neverthrow'
import { authenticator as Authenticator } from 'otplib'
import { tryCatch } from './try-catch'

type GetUntisProps = {
  url: string
  school: string
  timezone: string
  auth:
    | {
        type: 'password'
        username: string
        password: string
      }
    | {
        type: 'secret'
        username: string
        secret: string
      }
    | {
        type: 'public'
        classId?: number
      }
}

const SessionInformationType = type({
  'klasseId?': 'number',
  'personId?': 'number',
  'sessionId?': 'string',
  'personType?': 'number',
  'jwt_token?': 'string',
})

const SchoolYearType = type({
  name: 'string',
  id: 'number',
  startDate: 'Date',
  endDate: 'Date',
})

const ClassType = type(
  {
    id: 'number',
    name: 'string',
    longName: 'string',
    active: 'boolean',
    'foreColor?': 'string',
    'backColor?': 'string',
    'did?': 'number',
    'teacher1?': 'number',
    'teacher2?': 'number',
  },
  '[]',
)

const ShortDataType = type(
  {
    id: 'number',
    name: 'string',
    'longname?': 'string',
    'orgname?': 'string', // Replacement if original is not available
    'ordid?': 'number',
  },
  '[]',
)

const LessonType = type({
  id: 'number',
  date: 'number',
  startTime: 'number',
  endTime: 'number',
  'kl?': ShortDataType,
  'te?': ShortDataType,
  'su?': ShortDataType,
  'ro?': ShortDataType,
  'lstext?': 'string',
  'lsnumber?': 'number',
  'activityType?': '"Unterricht" | string',
  'code?': '"cancelled" | "irregular"',
  'info?': 'string',
  'substText?': 'string',
  'statflags?': 'string',
  'sg?': 'string',
  'bgRemark?': 'string',
  'bkText?': 'string',
})

const LessonsType = type(LessonType, '[]')

const HomeworkType = type({
  records: type(
    {
      homeworkId: 'number',
      teacherId: 'number',
      elementIds: 'number[]',
    },
    '[]',
  ),
  homeworks: type(
    {
      id: 'number',
      lessonId: 'number',
      date: 'number',
      dueDate: 'number',
      text: 'string',
      remark: 'string',
      completed: 'boolean',
      attachments: 'unknown[]',
    },
    '[]',
  ),
  teachers: type(
    {
      id: 'number',
      name: 'string',
    },
    '[]',
  ),
  lessons: type(
    {
      id: 'number',
      subject: 'string',
      lessonType: '"Unterricht" | string',
    },
    '[]',
  ),
})

type Session = {
  session: typeof SessionInformationType.infer
  untis: webuntis.Base
}

export function getUntis({ url, school, timezone, auth }: GetUntisProps) {
  async function getTimetable(
    session: Session,
    startDate: Date,
    endDate: Date,
  ): Promise<Result<typeof LessonsType.infer, string>> {
    // Public timetables
    if (auth.type === 'public') {
      if (!auth.classId) return err('No classId provided for public auth.')
      const classes = await tryCatch(
        session.untis.getTimetableForRange(
          startDate,
          endDate,
          auth.classId,
          webuntis.WebUntisElementType.CLASS,
        ),
      )
      if (classes.isOk()) {
        const validatedClasses = LessonsType(classes.value)
        if (!(validatedClasses instanceof type.errors))
          return ok(validatedClasses)
      }
      // if range failed get each day individually
      let returnTimetable: typeof LessonsType.infer = []
      for (
        let date = new Date(startDate);
        date <= endDate;
        date.setDate(date.getDate() + 1)
      ) {
        const dayTimetable = await tryCatch(
          session.untis.getTimetableForRange(
            date,
            date,
            auth.classId,
            webuntis.WebUntisElementType.CLASS,
          ),
        )
        if (dayTimetable.isOk()) {
          const validatedDayTimetable = LessonType(dayTimetable)
          if (!(validatedDayTimetable instanceof type.errors))
            returnTimetable.push(validatedDayTimetable)
        }
      }
      return ok(returnTimetable)
    }
    // Private timetables
    const classes = await tryCatch(
      session.untis.getOwnTimetableForRange(startDate, endDate),
    )
    if (classes.isOk()) {
      const validatedClasses = LessonsType(classes.value)
      if (!(validatedClasses instanceof type.errors))
        return ok(validatedClasses)
    }
    // if range failed get each day individually
    let returnTimetable: typeof LessonsType.infer = []
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dayTimetable = await tryCatch(
        session.untis.getOwnTimetableForRange(date, date),
      )
      if (dayTimetable.isOk()) {
        const validatedDayTimetable = LessonType(dayTimetable)
        if (!(validatedDayTimetable instanceof type.errors))
          returnTimetable.push(validatedDayTimetable)
      }
    }
    return ok(returnTimetable)
  }

  async function getHomework(
    session: Session,
    startDate: Date,
    endDate: Date,
  ): Promise<Result<typeof HomeworkType.infer, string>> {
    const homework = await tryCatch(
      session.untis.getHomeWorksFor(startDate, endDate),
    )
    if (homework.isErr())
      return ok({ records: [], homeworks: [], teachers: [], lessons: [] })
    const validatedHomework = HomeworkType(homework.value)
    if (validatedHomework instanceof type.errors)
      return err(validatedHomework.summary)
    return ok(validatedHomework)
  }

  return {
    async login(): Promise<Result<Session, string>> {
      switch (auth.type) {
        case 'password': {
          const untis = new webuntis.WebUntis(
            school,
            auth.username,
            auth.password,
            url,
          )
          const session = await tryCatch(untis.login())
          if (session.isErr()) return err(session.error.message)
          const validatedSession = SessionInformationType(session)
          if (validatedSession instanceof type.errors)
            return err(validatedSession.summary)
          return ok({ session: validatedSession, untis })
        }
        case 'secret': {
          const untis = new webuntis.WebUntisSecretAuth(
            school,
            auth.username,
            auth.secret,
            url,
            'custom-identity',
            Authenticator,
          )
          const session = await tryCatch(untis.login())
          if (session.isErr()) return err(session.error.message)
          const validatedSession = SessionInformationType(session)
          if (validatedSession instanceof type.errors)
            return err(validatedSession.summary)
          return ok({ session: validatedSession, untis })
        }
        case 'public': {
          const untis = new webuntis.WebUntisAnonymousAuth(school, url)
          const session = await tryCatch(untis.login())
          if (session.isErr()) return err(session.error.message)
          const validatedSession = SessionInformationType(session)
          if (validatedSession instanceof type.errors)
            return err(validatedSession.summary)
          return ok({ session: validatedSession, untis })
        }
      }
    },
    async logout(session: Session): Promise<Result<void, string>> {
      const logoutResponse = await tryCatch(session.untis.logout())
      if (logoutResponse.isErr()) return err(logoutResponse.error.message)
      return ok()
    },
    async getClassesForCurrentSchoolYear(
      session: Session,
    ): Promise<Result<typeof ClassType.infer, string>> {
      const schoolyearData = await session.untis.getCurrentSchoolyear()
      const validatedSchoolyearData = SchoolYearType(schoolyearData)
      if (validatedSchoolyearData instanceof type.errors)
        return err(validatedSchoolyearData.summary)

      const classesData = await session.untis.getClasses(
        true,
        validatedSchoolyearData.id,
      )
      const validatedClassesData = ClassType(classesData)
      if (validatedClassesData instanceof type.errors)
        return err(validatedClassesData.summary)
      return ok(validatedClassesData)
    },
    async getTimetableWithHomework(
      startDate: Date,
      endDate: Date,
      session: Session,
    ): Promise<
      Result<
        {
          startTime: Result<Date, Error>
          endTime: Result<Date, Error>
          lesson: typeof LessonType.infer
          homeworkStart: typeof HomeworkType.infer.homeworks
          homeworkEnd: typeof HomeworkType.infer.homeworks
        }[],
        string
      >
    > {
      const startDateInTimezone = setDateToTimezone(startDate, timezone)
      const endDateInTimezone = setDateToTimezone(endDate, timezone)
      const timetable = await getTimetable(
        session,
        startDateInTimezone,
        endDateInTimezone,
      )
      if (timetable.isErr()) return err(timetable.error)
      const homeworkData = await getHomework(
        session,
        startDateInTimezone,
        endDateInTimezone,
      )
      if (homeworkData.isErr()) return err(homeworkData.error)

      const homeworkWithLesson = homeworkData.value.homeworks.map(
        (homework) => ({
          homework,
          lesson: homeworkData.value.lessons.find(
            (lesson) => lesson.id === homework.lessonId,
          ),
        }),
      )

      const timetableWithHomework = timetable.value.map((lesson) => {
        const homeworkForLesson = homeworkWithLesson.filter(
          (homework) =>
            homework.lesson?.subject ===
              (lesson?.su !== undefined
                ? `${lesson.su[0]?.longname} (${lesson.su[0]?.name})`
                : false) &&
            (homework.homework.date === lesson.date ||
              homework.homework.dueDate === lesson.date),
        )
        if (homeworkForLesson.length > 0) {
          return {
            lesson,
            homeworkStart: homeworkForLesson
              .map((homework) => homework.homework)
              .filter((homework) => homework.date === lesson.date),
            homeworkEnd: homeworkForLesson
              .map((homework) => homework.homework)
              .filter((homework) => homework.dueDate === lesson.date),
          }
        }
        return { lesson, homeworkStart: [], homeworkEnd: [] }
      })
      const timetableWithTimezones = timetableWithHomework.map((lesson) => {
        const lessonWithTimezones = {
          ...lesson,
          startTime: convertUntisDateToDate(
            timezone,
            lesson.lesson.date,
            lesson.lesson.startTime,
          ),
          endTime: convertUntisDateToDate(
            timezone,
            lesson.lesson.date,
            lesson.lesson.endTime,
          ),
        }
        return lessonWithTimezones
      })
      return ok(timetableWithTimezones)
    },
  }
}

function setDateToTimezone(date: Date, timezone: string): Date {
  return new Date(date.toLocaleString('en-US', { timeZone: timezone }))
}

function convertUntisDateToDate(
  timezone: string,
  untisDate: number,
  untisTime: number,
): Result<Date, Error> {
  const dateString = String(untisDate)

  if (dateString.length !== 8) {
    return err(
      new Error('Invalid date format. Date must be in YYYYMMDD format.'),
    )
  }

  const year = parseInt(dateString.slice(0, 4))
  const month = parseInt(dateString.slice(4, 6)) - 1
  const day = parseInt(dateString.slice(6, 8))

  let hour = 0
  let minute = 0

  const timeString = String(untisTime).padStart(4, '0')

  if (timeString.length === 4) {
    hour = parseInt(timeString.slice(0, 2))
    minute = parseInt(timeString.slice(2, 4))

    if (isNaN(hour) || isNaN(minute)) {
      return err(new Error('Invalid time value.'))
    }
  }

  try {
    // Create a Date object in the specified timezone
    const dateInTimezone = new Date(year, month, day, hour, minute)

    // Use toLocaleString to ensure the Date object is interpreted in the specified timezone.
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
    })

    const dateStringInTimezone = formatter.format(dateInTimezone)
    return ok(new Date(dateStringInTimezone))
  } catch (error) {
    console.error('Error converting to timezone:', error)
    return err(error as Error)
  }
}
