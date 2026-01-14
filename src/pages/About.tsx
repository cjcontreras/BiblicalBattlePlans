import { Link } from 'react-router-dom'
import { ChevronLeft, Mail } from 'lucide-react'
import { Card, CardContent } from '../components/ui'
import { useAuth } from '../hooks/useAuth'

export function About() {
  const { user } = useAuth()
  const backLink = user ? '/dashboard' : '/'

  return (
    <div
      className="max-w-3xl mx-auto space-y-6 px-4 pb-4"
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
    >
      {/* Back button */}
      <Link
        to={backLink}
        className="inline-flex items-center gap-1 font-pixel text-[0.625rem] text-ink-muted hover:text-sage transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        BACK TO HOME
      </Link>

      {/* Header */}
      <Card variant="elevated">
        <CardContent>
          <h1 className="font-pixel text-sm text-ink mb-3">
            SHIREPATH SOLUTIONS
          </h1>
          <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">
            Building purposeful software with faith and precision.
          </p>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card noPadding>
        <div className="p-5">
          <h2 className="font-pixel text-[0.75rem] text-ink mb-3">
            WHAT I DO
          </h2>
          <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed mb-4">
            ShirePath Solutions is a solo software development venture focused on creating
            meaningful applications that serve others. I specialize in building web and mobile
            applications with clean, user-friendly designs and reliable functionality.
          </p>
          <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">
            Biblical Battle Plans is a passion project born from my own desire to stay
            consistent in Scripture reading. My goal is to help fellow believers engage
            with God's Word through an experience that feels both familiar and encouraging.
          </p>
        </div>
      </Card>

      {/* Contact Section */}
      <Card noPadding>
        <div className="p-5">
          <h2 className="font-pixel text-[0.75rem] text-ink mb-3">
            GET IN TOUCH
          </h2>
          <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed mb-4">
            Have questions, feedback, or ideas? I'd love to hear from you.
            Whether it's about Biblical Battle Plans or a potential project,
            feel free to reach out.
          </p>
          <a
            href="mailto:conner@shirepathsolutions.com"
            className="inline-flex items-center gap-2 font-pixel text-[0.625rem] text-sage hover:text-sage-dark transition-colors"
          >
            <Mail className="w-3 h-3" />
            conner@shirepathsolutions.com
          </a>
        </div>
      </Card>
    </div>
  )
}
