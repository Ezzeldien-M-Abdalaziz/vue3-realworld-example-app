import { CONFIG } from 'src/config'
import type { GenericErrorModel, HttpResponse } from 'src/services/api'
import { Api, ContentType } from 'src/services/api'

export const limit = 10

const apiBaseUrl = `${CONFIG.API_HOST}/api`
console.log('API Base URL:', apiBaseUrl)
console.log('CONFIG.API_HOST:', CONFIG.API_HOST)

// Temporary fix - use hardcoded URL to test
const finalBaseUrl = CONFIG.API_HOST ? apiBaseUrl : 'http://127.0.0.1:8000/api'
console.log('Final Base URL:', finalBaseUrl)

export const api = new Api({
  baseUrl: finalBaseUrl,
  securityWorker: token => token ? { headers: { Authorization: `Bearer ${String(token)}` } } : {},
  baseApiParams: {
    headers: {
      'content-type': ContentType.Json,
    },
    format: 'json',
  },
})

export function pageToOffset(page: number = 1, localLimit = limit): { limit: number, offset: number } {
  const offset = (page - 1) * localLimit
  return { limit: localLimit, offset }
}

export function isFetchError<E = GenericErrorModel>(e: unknown): e is HttpResponse<unknown, E> {
  return e instanceof Object && 'error' in e
}
