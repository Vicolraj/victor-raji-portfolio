import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  profileSchema,
  projectSchema,
  stackGroupSchema,
  type Profile,
  type Project,
  type StackGroup,
} from '../types/content'
import { portfolioContent } from '../lib/content'
import { NoIndexMeta } from '../components/admin/NoIndexMeta'

type ActivePanel = 'projects' | 'stack' | 'profile'

const panels: { id: ActivePanel; label: string }[] = [
  { id: 'projects', label: 'Projects' },
  { id: 'stack', label: 'Tech Stack' },
  { id: 'profile', label: 'Profile' },
]

export const AdminPage = () => {
  const navigate = useNavigate()
  const [activePanel, setActivePanel] = useState<ActivePanel>('projects')
  const [projects, setProjects] = useState<Project[]>(portfolioContent.projects)
  const [stack, setStack] = useState<StackGroup[]>(portfolioContent.stack)
  const [profile, setProfile] = useState<Profile>(portfolioContent.profile)
  const [selectedProject, setSelectedProject] = useState(0)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/login', { credentials: 'include' }).then((response) => {
      if (!response.ok) {
        navigate('/admin/login', { replace: true })
      }
    })
  }, [navigate])

  const selectedProjectData = useMemo(() => projects[selectedProject], [projects, selectedProject])

  const profileForm = useForm<Profile>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  })

  const projectForm = useForm<Project>({
    resolver: zodResolver(projectSchema),
    defaultValues: selectedProjectData,
  })

  const stackForm = useForm<StackGroup[]>({
    resolver: zodResolver(stackGroupSchema.array()),
    values: stack,
  })

  useEffect(() => {
    profileForm.reset(profile)
  }, [profile, profileForm])

  useEffect(() => {
    projectForm.reset(selectedProjectData)
  }, [selectedProjectData, projectForm])

  const updateProject = projectForm.handleSubmit((values) => {
    setProjects((current) => {
      const next = [...current]
      next[selectedProject] = values
      return next
    })
    setStatus('Project draft updated.')
  })

  const updateProfile = profileForm.handleSubmit((values) => {
    setProfile(values)
    setStatus('Profile draft updated.')
  })

  const updateStack = stackForm.handleSubmit((values) => {
    setStack(values)
    setStatus('Stack draft updated.')
  })

  const saveAll = async () => {
    if (!window.confirm('Save these updates to the GitHub repository?')) {
      return
    }

    setSaving(true)
    setError(null)
    setStatus(null)

    try {
      const response = await fetch('/api/admin/save', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, projects, stack }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        setError(payload.error ?? 'Failed to save content.')
        return
      }

      setStatus('Saved. Repository content is up to date.')
    } catch {
      setError('Connection lost. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const logout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
    navigate('/admin/login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-[#07090f] text-zinc-100">
      <NoIndexMeta title="Admin | Victor Raji" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:flex-row md:px-8">
        <aside className="rounded-3xl border border-white/15 bg-[#090c15] p-4 md:w-56">
          <h1 className="mb-4 text-lg font-semibold">Admin</h1>
          <nav className="space-y-2" aria-label="Admin sections">
            {panels.map((panel) => (
              <button
                type="button"
                key={panel.id}
                className={`w-full rounded-xl px-3 py-2 text-left ${
                  activePanel === panel.id ? 'bg-white/12 text-white' : 'bg-transparent text-zinc-400'
                }`}
                onClick={() => setActivePanel(panel.id)}
              >
                {panel.label}
              </button>
            ))}
          </nav>
          <button className="chip-link mt-6 w-full justify-center" onClick={logout}>
            Logout
          </button>
        </aside>

        <section className="flex-1 rounded-3xl border border-white/15 bg-[#090c15] p-6">
          {activePanel === 'projects' ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Projects</h2>
              <div className="overflow-x-auto rounded-2xl border border-white/10">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="bg-white/5 text-zinc-300">
                    <tr>
                      <th className="px-3 py-2">Title</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Year</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((project, index) => (
                      <tr key={project.title}>
                        <td className="px-3 py-2">
                          <button className="underline-offset-2 hover:underline" onClick={() => setSelectedProject(index)}>
                            {project.title}
                          </button>
                        </td>
                        <td className="px-3 py-2">{project.category}</td>
                        <td className="px-3 py-2">{project.year}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <form onSubmit={updateProject} className="grid gap-3 md:grid-cols-2" noValidate>
                <label className="admin-field">
                  Title
                  <input {...projectForm.register('title')} />
                </label>
                <label className="admin-field">
                  Category
                  <input {...projectForm.register('category')} />
                </label>
                <label className="admin-field md:col-span-2">
                  Description
                  <textarea rows={3} {...projectForm.register('description')} />
                </label>
                <label className="admin-field">
                  Year
                  <input type="number" {...projectForm.register('year', { valueAsNumber: true })} />
                </label>
                <label className="admin-field">
                  Live URL
                  <input {...projectForm.register('live')} />
                </label>
                <label className="admin-field">
                  GitHub Repo
                  <input {...projectForm.register('github')} />
                </label>
                <label className="admin-field md:col-span-2">
                  Tech list (comma-separated)
                  <input
                    value={projectForm.watch('tech')?.join(', ') ?? ''}
                    onChange={(event) => {
                      projectForm.setValue(
                        'tech',
                        event.target.value
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean),
                      )
                    }}
                  />
                </label>
                <button className="chip-link w-fit" type="submit">
                  Update project draft
                </button>
              </form>
            </div>
          ) : null}

          {activePanel === 'stack' ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Tech Stack</h2>
              <form onSubmit={updateStack} className="space-y-4" noValidate>
                {stack.map((group, index) => (
                  <fieldset key={group.category} className="rounded-2xl border border-white/10 p-4">
                    <label className="admin-field">
                      Category
                      <input {...stackForm.register(`${index}.category`)} />
                    </label>
                    <label className="admin-field mt-3">
                      Items (comma-separated)
                      <input
                        value={stackForm.watch(`${index}.items`)?.join(', ') ?? ''}
                        onChange={(event) => {
                          stackForm.setValue(
                            `${index}.items`,
                            event.target.value
                              .split(',')
                              .map((item) => item.trim())
                              .filter(Boolean),
                          )
                        }}
                      />
                    </label>
                  </fieldset>
                ))}
                <button className="chip-link" type="submit">
                  Update stack draft
                </button>
              </form>
            </div>
          ) : null}

          {activePanel === 'profile' ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Profile</h2>
              <form onSubmit={updateProfile} className="grid gap-3 md:grid-cols-2" noValidate>
                <label className="admin-field">
                  Name
                  <input {...profileForm.register('name')} />
                </label>
                <label className="admin-field">
                  Role
                  <input {...profileForm.register('role')} />
                </label>
                <label className="admin-field md:col-span-2">
                  Bio
                  <textarea rows={4} {...profileForm.register('bio')} />
                </label>
                <label className="admin-field">
                  Email
                  <input type="email" {...profileForm.register('email')} />
                </label>
                <label className="admin-field">
                  GitHub
                  <input {...profileForm.register('github')} />
                </label>
                <label className="admin-field">
                  LinkedIn
                  <input {...profileForm.register('linkedin')} />
                </label>
                {profile.stats.map((_, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3 md:col-span-2">
                    <label className="admin-field">
                      Stat label
                      <input {...profileForm.register(`stats.${index}.label`)} />
                    </label>
                    <label className="admin-field">
                      Stat value
                      <input {...profileForm.register(`stats.${index}.value`)} />
                    </label>
                  </div>
                ))}
                <button className="chip-link w-fit" type="submit">
                  Update profile draft
                </button>
              </form>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
            <button className="chip-link" onClick={saveAll} disabled={saving}>
              {saving ? 'Saving...' : 'Commit updates'}
            </button>
            {status ? <p className="text-sm text-emerald-300">{status}</p> : null}
            {error ? <p className="text-sm text-red-300">{error}</p> : null}
          </div>
        </section>
      </div>
    </main>
  )
}
