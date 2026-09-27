import profileJson from '../content/profile.json'
import projectsJson from '../content/projects.json'
import stackJson from '../content/stack.json'
import {
  type PortfolioContent,
  type Profile,
  type Project,
  type StackGroup,
  portfolioContentSchema,
} from '../types/content'

export const profile: Profile = profileJson
export const projects: Project[] = projectsJson
export const stack: StackGroup[] = stackJson

export const portfolioContent: PortfolioContent = portfolioContentSchema.parse({
  profile,
  projects,
  stack,
})
