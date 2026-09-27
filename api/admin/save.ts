import {
  rejectMethod,
  saveContentToGitHub,
  validateSession,
  type AdminRequest,
  type AdminResponse,
} from './_shared'

export default async function handler(request: AdminRequest, response: AdminResponse) {
  if (request.method !== 'POST') {
    rejectMethod(response)
    return
  }

  const isAuthed = await validateSession(request)
  if (!isAuthed) {
    response.status(401).json({ error: 'Unauthorized' })
    return
  }

  try {
    await saveContentToGitHub(request.body)
    response.status(200).json({ ok: true })
  } catch (error) {
    response.status(400).json({
      error: error instanceof Error ? error.message : 'Save failed',
    })
  }
}
