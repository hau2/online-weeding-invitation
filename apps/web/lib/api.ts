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

/**
 * Upload FormData to the API (for file uploads via Multer).
 * Does NOT set Content-Type header -- the browser automatically sets
 * multipart/form-data with the correct boundary. Setting it manually
 * breaks Multer parsing.
 */
export async function apiUpload<T>(
  path: string,
  formData: FormData,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    const json = await response.json()
    if (!response.ok) {
      const message =
        typeof json.message === 'string'
          ? json.message
          : Array.isArray(json.message)
            ? json.message.join('; ')
            : 'Co loi xay ra. Vui long thu lai.'
      return { data: null, error: message }
    }
    return { data: json as T, error: null }
  } catch {
    return { data: null, error: 'Khong the ket noi den may chu. Vui long thu lai.' }
  }
}
