import { clearSessionCookie, rejectMethod, type AdminRequest, type AdminResponse } from './_shared'

export default function handler(request: AdminRequest, response: AdminResponse) {
  if (request.method !== 'POST') {
    rejectMethod(response)
    return
  }

  response.setHeader('Set-Cookie', clearSessionCookie())
  response.status(200).json({ ok: true })
}
