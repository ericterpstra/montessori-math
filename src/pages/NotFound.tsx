import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <>
      <h1>Page not found</h1>
      <p className="page-intro">
        That page doesn't exist. Try the <Link to="/">home page</Link>.
      </p>
    </>
  )
}
