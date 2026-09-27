import { useEffect } from 'react'

export const NoIndexMeta = ({ title }: { title: string }) => {
  useEffect(() => {
    document.title = title
    let robots = document.querySelector('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.setAttribute('name', 'robots')
      document.head.appendChild(robots)
    }
    robots.setAttribute('content', 'noindex,nofollow,noarchive')

    return () => {
      if (robots) {
        robots.setAttribute('content', 'index,follow')
      }
    }
  }, [title])

  return null
}
