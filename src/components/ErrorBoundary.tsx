import { Component } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from './PageHeader'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  failed: boolean
}

/**
 * Catches a render error in the routed page, so the header, nav and footer stay
 * up instead of the whole site going blank. Layout keys it by pathname, so
 * navigating to another page starts a fresh boundary. React logs the error to
 * the console itself; nothing is reported anywhere.
 *
 * Children render with no wrapper element: the print-isolation CSS in the chart
 * and bead-chain materials relies on `main.site-main > *` direct children.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <>
        <PageHeader
          title="Something went wrong on this page"
          lede={
            <>
              This page ran into a problem and couldn't be shown. The rest of the site still works: choose another page
              from the menu above, go to the <Link to="/">home page</Link>, or try reloading this page.
            </>
          }
        />
        <p>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Reload this page
          </button>
        </p>
      </>
    )
  }
}
