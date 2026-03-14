const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

type FetchOptions = Omit<RequestInit, 'body'> & { body?: unknown }

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<{ data: T | null; error: string | null }> {
  try {
    const { body, ...rest } = options
    const response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...rest.headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    const json = await response.json()

    if (!response.ok) {
      const message =
        typeof json.message === 'string'
          ? json.message
          : Array.isArray(json.message)
            ? json.message.join('; ')
            : 'Có lỗi xảy ra. Vui lòng thử lại.'
      return { data: null, error: message }
    }

    return { data: json as T, error: null }
  } catch {
    return { data: null, error: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.' }
  }
}
