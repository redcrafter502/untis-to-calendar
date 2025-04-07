import { Result, err, ok } from 'neverthrow'

export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise
    return ok(data)
  } catch (error) {
    return err(error as E)
  }
}
