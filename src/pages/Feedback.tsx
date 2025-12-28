import { Link } from 'react-router-dom'
import { ChevronLeft, MessageSquarePlus, Bug, Lightbulb, ExternalLink } from 'lucide-react'
import { Card, CardContent } from '../components/ui'

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfVgGHqLyIPkaRaH7Oa5qL5S5iuR6VOPs_GS-aWG5YLcUrcNg/viewform?usp=header'

export function Feedback() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1 font-pixel text-[0.625rem] text-ink-muted hover:text-sage transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        BACK TO HOME
      </Link>

      {/* Header */}
      <Card variant="elevated">
        <CardContent>
          <h1 className="font-pixel text-sm text-ink mb-3">
            SEND FEEDBACK
          </h1>
          <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">
            Biblical Battle Plans is a work in progress. Your feedback helps shape the future of this app!
          </p>
        </CardContent>
      </Card>

      {/* Feedback Types */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card noPadding>
          <div className="p-4 text-center">
            <Bug className="w-6 h-6 mx-auto mb-2 text-red-600" />
            <h3 className="font-pixel text-[0.625rem] text-ink mb-1">BUGS</h3>
            <p className="font-pixel text-[0.5rem] text-ink-muted">
              Something broken or not working right?
            </p>
          </div>
        </Card>
        <Card noPadding>
          <div className="p-4 text-center">
            <Lightbulb className="w-6 h-6 mx-auto mb-2 text-gold" />
            <h3 className="font-pixel text-[0.625rem] text-ink mb-1">IDEAS</h3>
            <p className="font-pixel text-[0.5rem] text-ink-muted">
              Feature requests or suggestions?
            </p>
          </div>
        </Card>
        <Card noPadding>
          <div className="p-4 text-center">
            <MessageSquarePlus className="w-6 h-6 mx-auto mb-2 text-sage" />
            <h3 className="font-pixel text-[0.625rem] text-ink mb-1">GENERAL</h3>
            <p className="font-pixel text-[0.5rem] text-ink-muted">
              Any other thoughts or comments?
            </p>
          </div>
        </Card>
      </div>

      {/* Form Link */}
      <Card noPadding>
        <div className="p-6 text-center">
          <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed mb-4">
            Click below to open the feedback form. It only takes a minute!
          </p>
          <a
            href={GOOGLE_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-b from-sage to-sage-dark border-2 border-sage-dark text-white font-pixel text-[0.625rem] hover:from-sage-dark hover:to-sage-dark transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]"
          >
            OPEN FEEDBACK FORM
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </Card>

      {/* Note */}
      <Card>
        <CardContent className="text-center">
          <p className="font-pixel text-[0.625rem] text-ink-muted leading-relaxed">
            Thank you for helping improve Biblical Battle Plans. Every piece of feedback is read and appreciated!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
