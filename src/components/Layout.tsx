import { useEffect } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'

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
  { to: '/parents', label: 'For Parents' },
  { to: '/ages', label: 'By Age' },
]

export default function Layout() {
  return (
    <>
      <header className="site-header no-print">
        <div className="site-header-inner">
          <Link to="/" className="site-title">
            <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
              <defs>
                <radialGradient id="hdrbead" cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="#f6d27a" />
                  <stop offset="60%" stopColor="#d4a017" />
                  <stop offset="100%" stopColor="#9c7410" />
                </radialGradient>
              </defs>
              <circle cx="16" cy="16" r="13" fill="url(#hdrbead)" />
            </svg>
            Montessori Math
          </Link>
          <nav className="site-nav" aria-label="Main">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="site-main">
        <Outlet />
      </main>
      <footer className="site-footer no-print">
        <div className="site-footer-inner">
          <p>
            A free Montessori mathematics resource for families — ages 4–12. No accounts, no tracking: just lessons to
            read, materials to explore, and worksheets to print.
          </p>
          <p>
            Virtual materials are a substitute for when the real thing isn't available — hands on real beads is always
            best. All child practice beyond the materials themselves is designed for pencil and paper.
          </p>
        </div>
      </footer>
      <ScrollToTop />
    </>
  )
}
