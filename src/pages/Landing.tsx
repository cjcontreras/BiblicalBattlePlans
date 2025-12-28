import { Link } from 'react-router-dom'
import { BookOpen, Users, Trophy, Swords, Flame, Map } from 'lucide-react'
import { Button, Card, CardContent } from '../components/ui'

export function Landing() {
  return (
    <div className="min-h-screen bg-parchment-dark">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-28 h-28 flex items-center justify-center mb-6">
              <img src="/BiblicalBattlePlansLogo.png" alt="Biblical Battle Plans" className="w-full h-full object-contain" />
            </div>
            <h1 className="font-pixel text-base sm:text-lg text-ink text-center">
              BIBLICAL BATTLE PLANS
            </h1>
            <p className="font-pixel text-[0.625rem] text-ink-muted text-center mt-2">
              "Put on the full armor of God" — Ephesians 6:11
            </p>
          </div>

          {/* Tagline */}
          <div className="text-center mb-8">
            <h2 className="font-pixel text-[0.75rem] sm:text-sm text-ink mb-3">
              EMBARK ON SCRIPTURE QUESTS
            </h2>
            <p className="font-pixel text-[0.625rem] text-ink-muted max-w-2xl mx-auto leading-relaxed">
              Track your Bible reading journey with an RPG-themed quest system.
              Build streaks, complete reading plans, and grow in the Word together.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup">
              <Button variant="primary" size="lg" leftIcon={<Swords className="w-5 h-5" />}>
                ENLIST NOW
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                HERO LOGIN
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-10 bg-gradient-to-b from-parchment-dark to-parchment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="font-pixel text-[0.75rem] text-ink text-center mb-8">
            YOUR QUEST AWAITS
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature: Multiple Reading Plans */}
            <Card variant="elevated">
              <CardContent className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-sage/20 border-2 border-sage flex items-center justify-center">
                    <Map className="w-6 h-6 text-sage" />
                  </div>
                </div>
                <h4 className="font-pixel text-[0.625rem] text-ink mb-3">MULTIPLE QUESTS</h4>
                <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">
                  Choose from various reading plans: sequential, cycling, sectional, or free reading.
                  Pick your path through Scripture.
                </p>
              </CardContent>
            </Card>

            {/* Feature: Progress Tracking */}
            <Card variant="elevated">
              <CardContent className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gold/20 border-2 border-gold flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-gold-dark" />
                  </div>
                </div>
                <h4 className="font-pixel text-[0.625rem] text-ink mb-3">TRACK PROGRESS</h4>
                <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">
                  Watch your journey unfold with chapter tracking,
                  daily checklists, and completion stats for every quest.
                </p>
              </CardContent>
            </Card>

            {/* Feature: Streaks */}
            <Card variant="elevated">
              <CardContent className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-warning/20 border-2 border-warning flex items-center justify-center">
                    <Flame className="w-6 h-6 text-warning" />
                  </div>
                </div>
                <h4 className="font-pixel text-[0.625rem] text-ink mb-3">BUILD STREAKS</h4>
                <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">
                  Maintain your daily reading streak and level up your commitment
                  to consistent time in the Word.
                </p>
              </CardContent>
            </Card>

            {/* Feature: Group Accountability */}
            <Card variant="elevated">
              <CardContent className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-blue/20 border-2 border-blue flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue" />
                  </div>
                </div>
                <h4 className="font-pixel text-[0.625rem] text-ink mb-3">GROUP CAMPAIGNS</h4>
                <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">
                  Join reading campaigns with friends or your church.
                  Track progress together and encourage one another.
                </p>
              </CardContent>
            </Card>

            {/* Feature: RPG Theme */}
            <Card variant="elevated">
              <CardContent className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-sage/20 border-2 border-sage flex items-center justify-center">
                    <Swords className="w-6 h-6 text-sage" />
                  </div>
                </div>
                <h4 className="font-pixel text-[0.625rem] text-ink mb-3">GAMIFIED JOURNEY</h4>
                <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">
                  Experience Bible reading as an epic quest.
                  Retro RPG aesthetics make daily reading engaging and fun.
                </p>
              </CardContent>
            </Card>

            {/* Feature: Daily Verse */}
            <Card variant="elevated">
              <CardContent className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-gold/20 border-2 border-gold flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-gold-dark" />
                  </div>
                </div>
                <h4 className="font-pixel text-[0.625rem] text-ink mb-3">DAILY INSPIRATION</h4>
                <p className="font-pixel text-[0.5rem] text-ink-muted leading-relaxed">
                  Start each day with a verse of the day.
                  Be encouraged and equipped for your spiritual battles.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle bg-parchment-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="font-pixel text-[0.5rem] text-ink-muted">
                Created and maintained by{' '}
                <Link
                  to="/about"
                  className="text-sage hover:text-sage-dark transition-colors"
                >
                  ShirePath Solutions
                </Link>
              </p>
              <span className="font-pixel text-[0.4rem] text-ink-muted/50">
                v{__APP_VERSION__}
              </span>
            </div>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="font-pixel text-[0.5rem] text-sage hover:text-sage-dark transition-colors"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="font-pixel text-[0.5rem] text-sage hover:text-sage-dark transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
