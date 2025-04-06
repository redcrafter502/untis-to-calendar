import webuntis from 'webuntis'
import { type } from 'arktype'
import { ok, err, Result } from 'neverthrow'
import { authenticator as Authenticator } from 'otplib'

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
    longName: 'string',
    'orgname?': 'string',
    'ordid?': 'number',
  },
  '[]',
)

const LessonType = type({
  'id?': 'number',
  'date?': 'number',
  'startTime?': 'number',
  'endTime?': 'number',
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

type Session = {
  session: typeof SessionInformationType.infer
  untis: webuntis.Base
}

export function getUntis({ url, school, timezone, auth }: GetUntisProps) {
  async function getTimetable(
    session: Session,
    startDate: Date,
    endDate: Date,
  ): Promise<Result<typeof LessonType.infer, string>> {
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
      if (classes.isErr()) return err(classes.error.message)
      const validatedClasses = LessonType(classes)
      if (validatedClasses instanceof type.errors)
        return err(validatedClasses.summary)

      return ok(validatedClasses)
    }
    const classes = await tryCatch(
      session.untis.getOwnTimetableForRange(startDate, endDate),
    )
    if (classes.isErr()) return err(classes.error.message)
    const validatedClasses = LessonType(classes.value)
    if (validatedClasses instanceof type.errors)
      return err(validatedClasses.summary)
    return ok(validatedClasses)
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
    ): Promise<Result<void, string>> {
      const timetable = await getTimetable(session, startDate, endDate)
      console.log(timetable)

      return err('Not implemented')
    },
  }
}

function convertDateToUntis(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timeZone,
    hour12: false,
  })

  const parts = formatter.formatToParts(date)

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error('Could not format date')
  }

  return year + month + day
}

async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise
    return ok(data)
  } catch (error) {
    return err(error as E)
  }
}
