import axios from 'axios'
import { type } from 'arktype'

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
        classId: string
      }
}

const SessionInformationType = type({
  'klasseId?': 'number',
  'personId?': 'number',
  'sessionId?': 'string',
  'personType?': 'number',
  'jwt_token?': 'string',
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

  return {
    async login() {
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
            return { error: 'Failed to parse server response.' }
          if (response.data.result.code)
            return {
              error: 'Login returned error code: ' + response.data.result.code,
            }
          const validatedResult = SessionInformationType(response.data.result)
          if (validatedResult instanceof type.errors)
            return { error: validatedResult.summary }
          return validatedResult
        case 'secret':
          return 'hi'
        case 'public':
          return 'hi'
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
  }
}
