import { z } from 'zod'

export const statSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

export const profileSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  bio: z.string().min(1),
  stats: z.array(statSchema).min(1),
  email: z.string().email(),
  github: z.string().min(1),
  linkedin: z.string().min(1),
})

export const projectSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  tech: z.array(z.string().min(1)).min(1),
  description: z.string().min(1),
  year: z.number().int().min(2000),
  live: z.string().min(1),
  github: z.string().min(1).optional(),
})

export const stackGroupSchema = z.object({
  category: z.string().min(1),
  items: z.array(z.string().min(1)).min(1),
})

export const portfolioContentSchema = z.object({
  profile: profileSchema,
  projects: z.array(projectSchema).min(1),
  stack: z.array(stackGroupSchema).min(1),
})

export type Stat = z.infer<typeof statSchema>
export type Profile = z.infer<typeof profileSchema>
export type Project = z.infer<typeof projectSchema>
export type StackGroup = z.infer<typeof stackGroupSchema>
export type PortfolioContent = z.infer<typeof portfolioContentSchema>
