import { Link } from 'react-router-dom'
import { Bead, TenBar, HundredSquare, ThousandCube } from '../components/beads'

const BANDS = [
  {
    band: '4-6',
    title: 'Ages 4–6 · PK–K',
    blurb: 'Counting real things, the bead stair, teens and tens, and the first golden beads.',
  },
  {
    band: '6-9',
    title: 'Ages 6–9 · Grades 1–3',
    blurb: 'The four operations with beads and stamps, memorizing facts, first fractions.',
  },
  {
    band: '9-12',
    title: 'Ages 9–12 · Grades 4–6',
    blurb: 'Long multiplication and division, the checkerboard, racks & tubes, and decimals.',
  },
]

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div>
          <h1>Montessori Math at Home</h1>
          <p className="page-intro">
            A complete, free resource for teaching mathematics the Montessori way, ages 4–12: full lessons written for
            untrained parents, printable worksheets you can tune to your child, and faithful on-screen versions of the
            classic materials for when you don't own the real ones.
          </p>
          <p className="page-intro">No accounts. No tracking. Nothing to buy. Print freely.</p>
          <p className="home-cta">
            <Link className="btn primary" to="/parents/montessori-math-overview">
              New here? Start with the five-minute overview
            </Link>
            <Link className="btn" to="/parents/scope-and-sequence">
              See the full PK–6 path
            </Link>
          </p>
        </div>
        <div className="home-hero-beads" aria-hidden="true">
          <ThousandCube size={104} />
          <HundredSquare size={72} />
          <TenBar beadSize={13} vertical />
          <Bead size={16} />
        </div>
      </section>

      <p className="section-label">Three kinds of pages, one method</p>
      <ul className="card-grid">
        <li>
          <Link className="card" to="/lessons">
            <h3>📖 Lessons — you read, then show</h3>
            <p style={{ marginBottom: 0 }}>
              Album-style presentations: what to gather, exactly what to do and say, and how the child checks their own
              work. Print one, read it with coffee, present it in ten quiet minutes.
            </p>
          </Link>
        </li>
        <li>
          <Link className="card" to="/materials">
            <h3>🟡 Materials — the child's hands</h3>
            <p style={{ marginBottom: 0 }}>
              Golden beads, the stamp game, bead frames, the checkerboard and more — virtual stand-ins that behave like
              the real materials, exchanges and all. Real beads are better; these fill the gaps.
            </p>
          </Link>
        </li>
        <li>
          <Link className="card" to="/worksheets">
            <h3>✏️ Worksheets — practice on paper</h3>
            <p style={{ marginBottom: 0 }}>
              Generate exactly the sheet your child needs — operation, ranges, regrouping or not, how many problems —
              with an answer key, in Montessori color or ink-friendly B&amp;W.
            </p>
          </Link>
        </li>
      </ul>

      <p className="section-label">Find your child's starting point</p>
      <ul className="card-grid">
        {BANDS.map((b) => (
          <li key={b.band}>
            <Link className="card" to={`/ages?band=${b.band}`}>
              <h3>{b.title}</h3>
              <p style={{ marginBottom: 0 }}>{b.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="card" style={{ maxWidth: '46rem', marginTop: '2rem' }}>
        <h2>A note on screens</h2>
        <p style={{ marginBottom: 0 }}>
          Montessori math lives in the hands. The on-screen materials here exist for one reason: most families don't
          own a bank of golden beads or a set of racks and tubes. Use them the way you'd use the real thing — briefly,
          purposefully, sitting beside your child — and put everything else on paper. Every lesson's follow-up work is
          printable or pencil-and-paper by design. See{' '}
          <Link to="/parents/using-this-site">using this site</Link> for inexpensive ways to make the physical
          materials yourself.
        </p>
      </section>
    </>
  )
}
