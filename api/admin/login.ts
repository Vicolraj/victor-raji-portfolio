import {
  issueSessionCookie,
  isRateLimited,
  rejectMethod,
  validateSession,
  verifyPassword,
  type AdminRequest,
  type AdminResponse,
} from './_shared'

const parseBody = (body: unknown) => {
  if (!body || typeof body !== 'object' || !("password" in body)) {
    return ''
  }

  const value = (body as { password?: unknown }).password
  return typeof value === 'string' ? value : ''
}

export default async function handler(request: AdminRequest, response: AdminResponse) {
  if (request.method === 'GET') {
    const valid = await validateSession(request)
    if (!valid) {
      response.status(401).json({ error: 'Unauthorized' })
      return
    }

    response.status(200).json({ ok: true })
    return
  }

  if (request.method !== 'POST') {
    rejectMethod(response)
    return
  }

  if (isRateLimited(request)) {
    response.status(429).json({ error: 'Too many attempts. Please wait and retry.' })
    return
  }

  const password = parseBody(request.body)
  if (!password || !verifyPassword(password)) {
    response.status(401).json({ error: 'Invalid credentials' })
    return
  }

  response.setHeader('Set-Cookie', await issueSessionCookie())
  response.status(200).json({ ok: true })
}
