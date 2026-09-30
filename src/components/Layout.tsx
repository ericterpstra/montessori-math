import { useEffect, useRef } from 'react'
import type { FocusEvent } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { ErrorBoundary } from './ErrorBoundary'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const NAV = [
  { to: '/materials', label: 'Materials' },
  { to: '/lessons', label: 'Lessons' },
  { to: '/worksheets', label: 'Worksheets' },
  { to: '/kits', label: 'Kits' },
  { to: '/planner', label: 'Planner' },
  { to: '/parents', label: 'For Parents' },
  { to: '/ages', label: 'By Age' },
]

/** The colophon's short link row. */
const COLOPHON = [
  { to: '/lessons', label: 'Lessons' },
  { to: '/materials', label: 'Materials' },
  { to: '/worksheets', label: 'Worksheets' },
  { to: '/parents', label: 'For Parents' },
  { to: '/parents/scope-and-sequence', label: 'Scope & sequence' },
]

/**
 * Phones: keep a focused nav link fully clear of the 16px gutter and the
 * 2.5rem right-hand fade. Chrome's focus scrolling ignores scroll-padding
 * for a link that is already partly in view, so without this "Kits" and
 * "By Age" could take focus half under the fade or past the screen edge.
 */
function keepFocusedLinkClear(event: FocusEvent<HTMLElement>) {
  const nav = event.currentTarget
  if (nav.scrollWidth <= nav.clientWidth) return
  const style = getComputedStyle(nav)
  const fade = parseFloat(style.paddingRight) // 2.5rem
  const gutter = parseFloat(style.paddingLeft) // 16px
  const navBox = nav.getBoundingClientRect()
  const linkBox = (event.target as HTMLElement).getBoundingClientRect()
  const over = linkBox.right - (navBox.right - fade)
  const under = navBox.left + gutter - linkBox.left
  if (over > 0) nav.scrollLeft += over
  else if (under > 0) nav.scrollLeft -= under
}

export default function Layout() {
  const { pathname } = useLocation()
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Phones: the nav is one sideways-scrolling row. Bring the current
    // section's link into view so its golden underline is visible.
    const nav = navRef.current
    if (!nav || nav.scrollWidth <= nav.clientWidth) return
    const active = nav.querySelector<HTMLElement>('a.active')
    if (!active) {
      nav.scrollLeft = 0
      return
    }
    const navBox = nav.getBoundingClientRect()
    const linkBox = active.getBoundingClientRect()
    nav.scrollLeft += linkBox.left - navBox.left - (navBox.width - linkBox.width) / 2
  }, [pathname])

  return (
    <div className="site-shell">
      <header className="site-header no-print">
        <div className="site-header-inner container">
          <Link to="/" className="site-title">
            <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
              <defs>
                <radialGradient id="hdrbead" cx="35%" cy="30%" r="75%">
                  <stop offset="0%" style={{ stopColor: 'var(--golden-light)' }} />
                  <stop offset="60%" style={{ stopColor: 'var(--golden)' }} />
                  <stop offset="100%" style={{ stopColor: 'var(--golden-dark)' }} />
                </radialGradient>
              </defs>
              <circle cx="16" cy="16" r="13" fill="url(#hdrbead)" />
            </svg>
            Montessori Math
          </Link>
          <nav className="site-nav" aria-label="Main" ref={navRef} onFocus={keepFocusedLinkClear}>
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} data-label={item.label} className={({ isActive }) => (isActive ? 'active' : '')}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="site-main container">
        {/* Keyed by pathname so leaving a broken page recovers. */}
        <ErrorBoundary key={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="site-footer no-print">
        <div className="site-footer-inner container">
          <span className="fleuron" aria-hidden="true" />
          <p>
            A free Montessori mathematics resource for families — ages 4–12. No accounts, no tracking: just lessons to
            read, materials to explore, and worksheets to print.
          </p>
          <p>
            Virtual materials are a substitute for when the real thing isn't available — hands on real beads is always
            best. All child practice beyond the materials themselves is designed for pencil and paper.
          </p>
          <nav className="colophon-links" aria-label="Footer">
            {COLOPHON.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  )
}
