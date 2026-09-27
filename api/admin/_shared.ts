import { scryptSync, timingSafeEqual } from 'node:crypto'
import { SignJWT, jwtVerify } from 'jose'
import { Octokit } from '@octokit/rest'
import { portfolioContentSchema } from '../../src/types/content'

type RequestLike = {
  method?: string
  headers: Record<string, string | string[] | undefined>
  body?: unknown
  socket?: { remoteAddress?: string }
}

type ResponseLike = {
  status: (code: number) => ResponseLike
  json: (payload: unknown) => void
  setHeader: (name: string, value: string | string[]) => void
  end: () => void
}

export type AdminRequest = RequestLike
export type AdminResponse = ResponseLike

const SESSION_COOKIE = 'vr_admin_session'
const RATE_WINDOW_MS = 5 * 60 * 1000
const RATE_LIMIT = 8
const attempts = new Map<string, { count: number; startedAt: number }>()

const getEnv = (name: string) => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`)
  }
  return value
}

const getSessionSecret = () => new TextEncoder().encode(getEnv('SESSION_SECRET'))

export const readCookie = (request: AdminRequest, name: string) => {
  const rawCookie = request.headers.cookie
  if (!rawCookie) {
    return null
  }

  const cookieValue = (Array.isArray(rawCookie) ? rawCookie.join(';') : rawCookie)
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))

  if (!cookieValue) {
    return null
  }

  return decodeURIComponent(cookieValue.split('=').slice(1).join('='))
}

const derivePasswordHash = (password: string, salt: string) =>
  scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString('base64')

export const verifyPassword = (password: string) => {
  const expected = getEnv('ADMIN_PASSWORD_HASH')
  const [salt, expectedHash] = expected.split(':')

  if (!salt || !expectedHash) {
    return false
  }

  const passwordHash = derivePasswordHash(password, salt)

  const left = Buffer.from(passwordHash)
  const right = Buffer.from(expectedHash)

  if (left.length !== right.length) {
    return false
  }

  return timingSafeEqual(left, right)
}

export const isRateLimited = (request: AdminRequest) => {
  const key = request.socket?.remoteAddress ?? 'unknown'
  const now = Date.now()
  const entry = attempts.get(key)

  if (!entry || now - entry.startedAt > RATE_WINDOW_MS) {
    attempts.set(key, { count: 1, startedAt: now })
    return false
  }

  entry.count += 1
  attempts.set(key, entry)
  return entry.count > RATE_LIMIT
}

export const issueSessionCookie = async () => {
  const token = await new SignJWT({ scope: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSessionSecret())

  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Strict; Max-Age=28800; Secure`
}

export const clearSessionCookie = () =>
  `${SESSION_COOKIE}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0; Secure`

export const validateSession = async (request: AdminRequest) => {
  const token = readCookie(request, SESSION_COOKIE)
  if (!token) {
    return false
  }

  try {
    const verification = await jwtVerify(token, getSessionSecret())
    return verification.payload.scope === 'admin'
  } catch {
    return false
  }
}

export const parseContentPayload = (payload: unknown) => portfolioContentSchema.parse(payload)

const resolveApiBase64 = (content: string) => Buffer.from(content).toString('base64')

export const saveContentToGitHub = async (payload: unknown) => {
  const content = parseContentPayload(payload)
  const token = getEnv('GITHUB_TOKEN')
  const owner = getEnv('GITHUB_OWNER')
  const repo = getEnv('GITHUB_REPO')
  const octokit = new Octokit({ auth: token })

  const updates = [
    { path: 'src/content/profile.json', body: `${JSON.stringify(content.profile, null, 2)}\n` },
    { path: 'src/content/projects.json', body: `${JSON.stringify(content.projects, null, 2)}\n` },
    { path: 'src/content/stack.json', body: `${JSON.stringify(content.stack, null, 2)}\n` },
  ]

  for (const file of updates) {
    const existing = await octokit.repos.getContent({ owner, repo, path: file.path, ref: 'main' })

    if (!('sha' in existing.data) || !existing.data.sha) {
      throw new Error(`Could not read file SHA for ${file.path}`)
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: file.path,
      branch: 'main',
      message: `admin: update ${file.path}`,
      content: resolveApiBase64(file.body),
      sha: existing.data.sha,
    })
  }
}

export const rejectMethod = (response: AdminResponse) => {
  response.status(405).json({ error: 'Method not allowed' })
}
