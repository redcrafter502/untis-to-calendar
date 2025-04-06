import axios from 'axios'
import { type } from 'arktype'
import { ok, err, Result } from 'neverthrow'

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
        classId?: string
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
  startDate: 'number',
  endDate: 'number',
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
  id: 'number',
  date: 'number',
  startTime: 'number',
  endTime: 'number',
  kl: ShortDataType,
  te: ShortDataType,
  su: ShortDataType,
  ro: ShortDataType,
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

export function getUntis({ url, school, timezone, auth }: GetUntisProps) {
  const identity = 'Awesome'

  const additionalHeaders: Record<string, string> = {}

  const disableUserAgent = false
  if (!disableUserAgent) {
    additionalHeaders['User-Agent'] =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36'
  }

  const myAxios = axios.create({
    baseURL: url,
    maxRedirects: 0,
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      'X-Requested-With': 'XMLHttpRequest',
      ...additionalHeaders,
    },
    validateStatus: function (status) {
      return status >= 200 && status < 303
    },
  })

  const schoolBase64 = '_' + btoa(school)

  async function request<Params>(
    method: string,
    params: Params,
    validateSession: boolean,
    session: typeof SessionInformationType.infer,
    url = '/WebUntis/jsonrpc.do',
  ): Promise<Result<unknown, string>> {
    /*if (validateSession && !(await this.validateSession()))
      return { error: 'Current Session is not valid.' }*/
    const response = await myAxios({
      method: 'post',
      url,
      params: {
        school: school,
      },
      headers: {
        Cookie: [
          `JSESSIONID=${session.sessionId}`,
          `schoolname?${schoolBase64}`,
        ].join('; '),
      },
      data: {
        id: identity,
        method,
        params,
        jsonrpc: '2.0',
      },
    })
    if (typeof response.data !== 'object')
      return err('Failed to parse server response.')
    if (!response.data.result) return err('Server returned no result.')
    if (response.data.result.code)
      return err('Login returned error code: ' + response.data.result.code)
    return ok(response.data.result)
  }

  async function timetableRequest(
    id: string | number,
    type: number,
    validateSession: boolean,
    session: typeof SessionInformationType.infer,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Result<unknown, string>> {
    const additionalOptions: Record<string, string> = {}
    if (startDate) {
      additionalOptions.startDate = convertDateToUntis(startDate, timezone)
    }
    if (endDate) {
      additionalOptions.endDate = convertDateToUntis(endDate, timezone)
    }

    const lessons = await request(
      'getTimetable',
      {
        options: {
          id: new Date().getTime(),
          element: {
            id,
            type,
          },
          ...additionalOptions,
          showLsText: true,
          showStudentgroup: true,
          showLsNumber: true,
          showSubstText: true,
          showInfo: true,
          showBooking: true,
          klasseFields: ['id', 'name', 'longname', 'externalkey'],
          roomFields: ['id', 'name', 'longname', 'externalkey'],
          subjectFields: ['id', 'name', 'longname', 'externalkey'],
          teacherFields: ['id', 'name', 'longname', 'externalkey'],
        },
      },
      validateSession,
      session,
    )

    console.log('Lessons', lessons)

    return ok()
  }

  return {
    async login(): Promise<
      Result<typeof SessionInformationType.infer, string>
    > {
      switch (auth.type) {
        case 'password':
          const response = await myAxios({
            method: 'post',
            url: '/WebUntis/jsonrpc.do',
            params: {
              school: school,
            },
            data: {
              id: identity,
              method: 'authenticate',
              params: {
                user: auth.username,
                password: auth.password,
                client: identity,
              },
              jsonrpc: '2.0',
            },
          })
          if (typeof response.data !== 'object')
            return err('Failed to parse server response.')
          if (response.data.result.code)
            return err(
              'Login returned error code: ' + response.data.result.code,
            )
          const validatedResult = SessionInformationType(response.data.result)
          if (validatedResult instanceof type.errors)
            return err(validatedResult.summary)
          return ok(validatedResult)
        case 'secret':
          return err('No implementation for secret auth')
        case 'public':
          return err('No implementation for public auth')
      }
    },
    async logout() {
      await myAxios({
        method: 'post',
        url: '/WebUntis/jsonrpc.do',
        params: {
          school: school,
        },
        data: {
          id: identity,
          method: 'logout',
          params: {},
          jsonrpc: '2.0',
        },
      })
      return
    },
    async getClassesForCurrentSchoolYear(
      session: typeof SessionInformationType.infer,
      validateSession = true,
    ): Promise<Result<typeof ClassType.infer, string>> {
      const schoolyearData = await request(
        'getCurrentSchoolyear',
        {},
        validateSession,
        session,
      )
      if (schoolyearData.isErr()) return err(schoolyearData.error)
      const validatedSchoolyearData = SchoolYearType(schoolyearData.value)
      if (validatedSchoolyearData instanceof type.errors)
        return err(validatedSchoolyearData.summary)

      const classesData = await request(
        'getKlassen',
        {
          schoolyearId: validatedSchoolyearData.id,
        },
        validateSession,
        session,
      )
      if (classesData.isErr()) return err(classesData.error)
      const validatedClassesData = ClassType(classesData.value)
      if (validatedClassesData instanceof type.errors)
        return err(validatedClassesData.summary)
      return ok(validatedClassesData)
    },
    async getTimetableWithHomework(
      startDate: Date,
      endDate: Date,
      classId: number | 'own',
      session: typeof SessionInformationType.infer,
      validateSession = true,
    ): Promise<Result<void, string>> {
      if (classId === 'own' && auth.type === 'public')
        return err('Cannot get timetable for "own" class with public auth.')

      await timetableRequest(
        classId,
        1,
        validateSession,
        session,
        startDate,
        endDate,
      )

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
