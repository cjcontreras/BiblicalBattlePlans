import { useEffect } from 'react'

/**
 * Privacy Policy page - redirects to static HTML
 * The actual privacy policy content is in public/privacy.html
 * This component handles the route and redirects to the static file
 */
export function Privacy() {
  useEffect(() => {
    // Redirect to the static HTML file
    window.location.href = '/privacy.html'
  }, [])

  return null
}
