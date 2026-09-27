import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useNavigate } from 'react-router-dom'
import { NoIndexMeta } from '../components/admin/NoIndexMeta'

const loginSchema = z.object({
  password: z.string().min(1, 'Enter your admin password'),
})

type LoginInput = z.infer<typeof loginSchema>

export const AdminLoginPage = () => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: '' },
  })

  useEffect(() => {
    fetch('/api/admin/login', { credentials: 'include' })
      .then((response) => {
        setLoggedIn(response.ok)
      })
      .catch(() => {
        setLoggedIn(false)
      })
  }, [])

  const onSubmit = form.handleSubmit(async (values) => {
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const data = (await response.json()) as { error?: string }
        setError(data.error ?? 'Login failed')
        return
      }

      navigate('/admin', { replace: true })
    } catch {
      setError('Connection lost. Please try again.')
    } finally {
      setSubmitting(false)
    }
  })

  if (loggedIn) {
    return <Navigate to="/admin" replace />
  }

  return (
    <main className="min-h-screen bg-[#07090f] px-4 py-12 text-zinc-100">
      <NoIndexMeta title="Admin Login | Victor Raji" />
      <div className="mx-auto w-full max-w-md rounded-3xl border border-white/15 bg-[#0b0f19] p-8">
        <h1 className="text-2xl font-semibold">Admin login</h1>
        <p className="mt-2 text-sm text-zinc-400">Private area for editing portfolio content.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          <label className="flex flex-col gap-2 text-sm">
            Password
            <input
              type="password"
              autoComplete="current-password"
              className="rounded-xl border border-white/20 bg-black/30 px-3 py-2"
              {...form.register('password')}
            />
            {form.formState.errors.password ? (
              <span className="text-xs text-red-300">{form.formState.errors.password.message}</span>
            ) : null}
          </label>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button className="chip-link w-full justify-center" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
