import { useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { animate, stagger } from 'animejs'
import { portfolioContent } from '../lib/content'
import { HeroAtmosphere } from '../components/public/HeroAtmosphere'
import { useReducedMotion } from '../hooks/useReducedMotion'

const heroLetters = ['V', 'I', 'C', 'T', 'O', 'R', 'R', 'A', 'J', 'I']

export const PublicPage = () => {
  const reducedMotion = useReducedMotion()
  const letterRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    document.title = 'Victor Raji Portfolio'
  }, [])

  useEffect(() => {
    if (reducedMotion || !letterRef.current) {
      return
    }

    const targets = Array.from(letterRef.current.querySelectorAll('[data-hero-letter]'))
    animate(targets, {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(35),
      duration: 420,
      easing: 'out(3)',
    })
  }, [reducedMotion])

  const marqueeItems = useMemo(
    () => portfolioContent.stack.flatMap((group) => group.items).slice(0, 16),
    [],
  )

  return (
    <div className="min-h-screen bg-[#07090f] text-zinc-100">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <header className="sticky top-0 z-50 mx-auto w-full max-w-6xl px-4 pt-4 sm:px-8">
        <nav className="glass-nav" aria-label="Main navigation">
          <Link to="/#work">Work</Link>
          <Link to="/#tech">Stack</Link>
          <Link to="/#contact">Contact</Link>
          <a href="mailto:vicolraj@gmail.com" className="hire-link">
            Hire Me
          </a>
        </nav>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-8">
        <section className="relative grid min-h-[72vh] grid-cols-1 gap-8 overflow-hidden rounded-3xl border border-white/10 bg-[#05070d]/90 p-8 md:grid-cols-[200px_1fr] md:p-12">
          <HeroAtmosphere enabled={!reducedMotion} />
          <div ref={letterRef} className="relative z-10 flex flex-wrap gap-2 text-4xl font-semibold tracking-[0.32em] text-white/75 md:flex-col md:gap-0 md:text-6xl">
            {heroLetters.map((letter, index) => (
              <span key={`${letter}-${index}`} data-hero-letter className="opacity-0">
                {letter}
              </span>
            ))}
          </div>
          <div className="relative z-10 flex max-w-2xl flex-col justify-end gap-6">
            <motion.p
              initial={reducedMotion ? false : { opacity: 0, y: 24 }}
              animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-sm uppercase tracking-[0.3em] text-white/65"
            >
              {portfolioContent.profile.role}
            </motion.p>
            <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
              I build resilient web products with clean UI, tested flows, and stable infrastructure.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-zinc-300">{portfolioContent.profile.bio}</p>
            <div className="grid max-w-xl grid-cols-3 gap-3 text-sm text-zinc-300">
              {portfolioContent.profile.stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="pt-20" aria-labelledby="work-heading">
          <h2 id="work-heading" className="section-heading">
            Work
          </h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {portfolioContent.projects.map((project) => (
              <article key={project.title} className="work-card group">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-zinc-400">
                  <span>{project.category}</span>
                  <span>{project.year}</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-zinc-100">{project.title}</h3>
                <p className="mt-3 text-zinc-300">{project.description}</p>
                <p className="mt-4 text-sm text-zinc-400">{project.tech.join(' · ')}</p>
                <div className="mt-6 flex gap-3 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
                  <a href={`https://${project.live}`} target="_blank" rel="noreferrer" className="chip-link">
                    Live
                  </a>
                  {project.github ? (
                    <a href={`https://github.com/${project.github}`} target="_blank" rel="noreferrer" className="chip-link">
                      GitHub
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="tech" className="pt-20" aria-labelledby="stack-heading">
          <h2 id="stack-heading" className="section-heading">
            Stack
          </h2>
          <div className="marquee mt-8" aria-label="Current tools">
            <div className="marquee-track">
              {[...marqueeItems, ...marqueeItems].map((item, index) => (
                <span key={`${item}-${index}`}>{item}</span>
              ))}
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {portfolioContent.stack.map((group) => (
              <article key={group.category} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <h3 className="text-sm uppercase tracking-[0.2em] text-zinc-400">{group.category}</h3>
                <ul className="mt-4 flex flex-wrap gap-2 text-sm text-zinc-100">
                  {group.items.map((item) => (
                    <li key={item} className="rounded-full border border-white/15 px-3 py-1">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="pt-20" aria-labelledby="contact-heading">
          <h2 id="contact-heading" className="section-heading">
            Contact
          </h2>
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-8">
            <p className="text-lg text-zinc-200">Open to freelance builds and product teams that ship often.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="chip-link" href={`mailto:${portfolioContent.profile.email}`}>
                {portfolioContent.profile.email}
              </a>
              <a className="chip-link" href={`https://${portfolioContent.profile.github}`} target="_blank" rel="noreferrer">
                GitHub
              </a>
              <a className="chip-link" href={`https://${portfolioContent.profile.linkedin}`} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-10 text-sm text-zinc-500 sm:px-8">
        Built by Victor Raji.
      </footer>
    </div>
  )
}
