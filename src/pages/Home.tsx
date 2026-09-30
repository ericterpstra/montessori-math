import { Link } from 'react-router-dom'
import { Bead, TenBar, HundredSquare, ThousandCube } from '../components/beads'
import { ContentsRow } from '../components/Contents'
import { Icon } from '../components/Icon'
import { MaterialThumb } from '../components/MaterialThumb'
import { AGE_BANDS } from './ageBands'

/** The three kinds of pages, numbered like the parts of a book. */
const PARTS = [
  {
    numeral: 'I.',
    to: '/lessons',
    thumb: 'album',
    kind: 'Lessons',
    sub: 'you read, then show',
    text: 'Album-style presentations: what to gather, exactly what to do and say, and how the child checks their own work. Print one, read it with coffee, present it in ten quiet minutes.',
    go: 'Open the lessons',
  },
  {
    numeral: 'II.',
    to: '/materials',
    thumb: 'golden-beads',
    kind: 'Materials',
    sub: "the child's hands",
    text: 'Golden beads, the stamp game, bead frames, the checkerboard and more — virtual stand-ins that behave like the real materials, exchanges and all. Real beads are better; these fill the gaps.',
    go: 'Open the materials',
  },
  {
    numeral: 'III.',
    to: '/worksheets',
    thumb: 'sheet',
    kind: 'Worksheets',
    sub: 'practice on paper',
    text: 'Generate exactly the sheet your child needs — operation, ranges, regrouping or not, how many problems — with an answer key, in Montessori color or ink-friendly B&W.',
    go: 'Make a worksheet',
  },
]

/* Plate I: one bead unit (11px) sets every piece, so the bar, the square's
   side and the cube's face are all ten beads long, as in the real material. */
const BEAD = 11

export default function Home() {
  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <div className="hero-title">
          <p className="page-kicker">A free Montessori album for families · Ages 4–12</p>
          <h1 id="home-title">Montessori Math at Home</h1>
        </div>
        <figure className="plate-hero">
          <div className="plate-hero-art">
            <ThousandCube size={Math.round(BEAD * 12.4)} />
            <HundredSquare size={BEAD * 10} />
            <TenBar beadSize={BEAD} vertical />
            <Bead size={BEAD} />
          </div>
          <figcaption className="plate-caption">
            <span className="plate-no">Plate I.</span> A thousand, a hundred, a ten and a unit.
          </figcaption>
        </figure>
        <div className="hero-body">
          <p className="page-lede">
            A complete, free resource for teaching mathematics the Montessori way, ages 4–12: full lessons written for
            untrained parents, printable worksheets you can tune to your child, and faithful on-screen versions of the
            classic materials for when you don't own the real ones.
          </p>
          <p className="promise">No accounts. No tracking. Nothing to buy. Print freely.</p>
          <div className="home-cta">
            <Link className="btn primary" to="/parents/montessori-math-overview">
              New here? Start with the five-minute overview
            </Link>
            <p className="home-links">
              <Link className="text-link" to="/parents/scope-and-sequence">
                See the full PK–6 path <Icon name="arrow" />
              </Link>
              <Link className="text-link" to="/planner">
                Plan a week of work <Icon name="arrow" />
              </Link>
            </p>
          </div>
        </div>
      </section>

      <h2 className="section-head">Three kinds of pages, one method</h2>
      <ul className="parts" role="list">
        {PARTS.map((part) => (
          <li key={part.to}>
            <Link className="part-entry" to={part.to}>
              <span className="part-head">
                <span className="part-num">{part.numeral}</span>
                <MaterialThumb slug={part.thumb} />
              </span>
              <h3>
                <span className="part-kind">{part.kind}</span>
                <span className="part-sub">{part.sub}</span>
              </h3>
              <span className="part-text">{part.text}</span>
              <span className="part-go">
                {part.go} <Icon name="arrow" />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="section-head">Find your child's starting point</h2>
      <ul className="contents bands" role="list">
        {AGE_BANDS.map((b) => (
          <li key={b.id}>
            <ContentsRow to={`/ages?band=${b.id}`} thumb={b.thumb} title={b.ages} titleMeta={b.grades} summary={b.blurb} />
          </li>
        ))}
      </ul>

      <section className="note" aria-labelledby="note-screens">
        <span className="fleuron" aria-hidden="true" />
        <h2 id="note-screens">A note on screens</h2>
        <p>
          Montessori math lives in the hands. The on-screen materials here exist for one reason: most families don't
          own a bank of golden beads or a set of racks and tubes. Use them the way you'd use the real thing — briefly,
          purposefully, sitting beside your child — and put everything else on paper. Every lesson's follow-up work is
          printable or pencil-and-paper by design. See <Link to="/parents/using-this-site">using this site</Link> for
          inexpensive ways to make the physical materials yourself.
        </p>
      </section>
    </>
  )
}
