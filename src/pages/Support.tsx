import { useEffect } from 'react'

/**
 * Support page - redirects to static HTML
 * The actual support content is in public/support.html
 * This component handles the route and redirects to the static file
 */
export function Support() {
  useEffect(() => {
    // Redirect to the static HTML file
    window.location.href = '/support.html'
  }, [])

  return null
}
