import { Link } from 'react-router-dom'
import type { GuideMeta } from '../types'

export const meta: GuideMeta = {
  slug: 'glossary',
  title: 'Glossary',
  summary: 'Every Montessori term on this site, in plain words.',
}

export default function Glossary() {
  return (
    <article className="guide">
      <h1>Glossary</h1>
      <p className="guide-lede">
        Montessori has its own vocabulary, and the lessons on this site use it without apology — because the words
        are precise, and because you'll meet them everywhere else Montessori is discussed. Here is every term we
        use, defined the way we actually use it. Skim it once now, then come back whenever a lesson says something
        like "this is the control of error" and you want the fuller story.
      </p>

      <dl>
        <dt>Absorbent mind</dt>
        <dd>
          Maria Montessori's name for how a young child (roughly birth to six) soaks up the world — language,
          order, number — without effort or drilling. It's why a four-year-old can take in the whole decimal
          system through beads, joyfully, while the same content taught later takes real work.
        </dd>

        <dt>Abstraction, passage to</dt>
        <dd>
          The long bridge from doing math with objects to doing it with written symbols alone. On this site it's
          an entire strand: <Link to="/materials/stamp-game">stamp game</Link>, then{' '}
          <Link to="/materials/bead-frame">bead frames</Link>, then{' '}
          <Link to="/materials/checkerboard">checkerboard</Link> and{' '}
          <Link to="/materials/racks-and-tubes">racks &amp; tubes</Link> — each material a little less concrete
          than the last, until pencil and paper is all the child needs.
        </dd>

        <dt>Album</dt>
        <dd>
          A Montessori teacher's handbook: every lesson written out step by step, in sequence, with its aims and
          the exact words to say. The <Link to="/lessons">lessons here</Link> are album pages rewritten for
          parents.
        </dd>

        <dt>Bead bar</dt>
        <dd>
          Beads strung on a stiff wire in a fixed quantity from 1 to 10, colored by quantity (see{' '}
          <em>colored bead stair</em>). A bar of six is one object <em>and</em> six units at the same time — which
          is exactly the idea multiplication will need.
        </dd>

        <dt>Bead cabinet / bead chains</dt>
        <dd>
          Long chains of bead bars used for skip counting: the short chain of 5 folds up into five 5-bars — a
          square of 25 — and the long chains do the same for cubes. In a classroom they hang in a tall glass
          "bead cabinet"; here they live at <Link to="/materials/bead-chains">bead chains</Link>.
        </dd>

        <dt>Bird's-eye view</dt>
        <dd>
          A layout that lets the child take in a whole system at a glance — most famously the{' '}
          <Link to="/materials/number-cards">number cards</Link> from 1 to 9,000 laid out in columns by place,
          which shows in one look that after nine of anything you must move to the next place.
        </dd>

        <dt>Colored bead stair</dt>
        <dd>
          The bead bars 1 through 9 in their fixed colors: 1 red, 2 green, 3 pink, 4 yellow, 5 light blue, 6
          lavender, 7 white, 8 brown, 9 dark blue (and 10 is always golden). Once the colors are learned, a child
          reads "eight" off a brown bar without counting — see the{' '}
          <Link to="/lessons/bead-stair-intro">bead stair introduction</Link>.
        </dd>

        <dt>Control of error</dt>
        <dd>
          The way a material lets the child check their own work with no adult verdict needed: leftover beads at
          the end of the <Link to="/materials/snake-game">snake game</Link>, a skittle that came up short, number
          cards that don't stack flush. Correction stays impersonal, and the child stays in charge. Every lesson
          on this site names its control of error.
        </dd>

        <dt>Decimal system</dt>
        <dd>
          Our base-ten place value system: ten of anything makes one of the next thing up. Montessori gives it
          concretely, thousands and all, with the <Link to="/materials/golden-beads">golden beads</Link> at age
          four or five — years before written arithmetic depends on it.
        </dd>

        <dt>Direct aim / indirect aim</dt>
        <dd>
          Every lesson has both. The direct aim is what the child is visibly learning now — say, adding four-digit
          numbers. The indirect aim is the seed planted for later: the logic of carrying, met in the hands years
          before it shows up in a written algorithm.
        </dd>

        <dt>Dynamic vs. static</dt>
        <dd>
          Montessori's words for operations with or without exchanging. Static addition never needs a carry
          (3,241 + 1,325); dynamic addition does. Every operation is presented static first, so the operation
          itself is the only new thing — see <em>isolation of difficulty</em>.
        </dd>

        <dt>Exchange</dt>
        <dd>
          The ten-for-one trade at the heart of the decimal system: ten unit beads back to the bank for one
          ten-bar, ten ten-bars for a hundred-square. Carrying and borrowing are simply exchanges written down —
          watch it happen in <Link to="/lessons/golden-beads-addition">golden bead addition</Link>.
        </dd>

        <dt>Extension</dt>
        <dd>
          A follow-up that stretches a material past its first presentation — bigger numbers, a memory game, a
          new question asked of the same beads. Lessons here list their extensions so the material keeps earning
          its shelf space.
        </dd>

        <dt>Golden beads</dt>
        <dd>
          The flagship material of the decimal system: single golden beads for units, ten-bars, hundred-squares,
          and thousand-cubes. A thousand is a cube you need two hands to carry — the child <em>feels</em> how big
          numbers are before ever writing them. Start with the{' '}
          <Link to="/lessons/golden-beads-intro">golden beads introduction</Link>.
        </dd>

        <dt>Isolation of difficulty</dt>
        <dd>
          The design rule that each new lesson adds exactly one new hard thing. Quantity is taught before symbol;
          static operations before dynamic ones. If a child struggles, the fix is usually a step back to isolate
          the piece that's actually new.
        </dd>

        <dt>Materialized abstraction</dt>
        <dd>
          Montessori's own description of her math materials: an abstract idea given a body. Place value is an
          abstraction; a thousand-cube is place value you can hold.
        </dd>

        <dt>Planes of development</dt>
        <dd>
          Montessori's four six-year stages of childhood. For math, the first plane (0–6) wants to touch and
          count; the second plane (6–12) wants reasons, patterns, and enormous numbers — which is why the same
          beads keep returning with bigger questions.
        </dd>

        <dt>Point of interest</dt>
        <dd>
          The detail in a presentation that catches and holds the child's attention — a bead clicking into its
          hole, cards stacking to reveal a number. Lessons here list their points of interest so you know exactly
          where to slow down.
        </dd>

        <dt>Practical life</dt>
        <dd>
          The pouring, spooning, and buttoning work of early childhood. It looks like housekeeping, but it is
          math preparation: exact sequences, left-to-right and top-to-bottom order, sustained concentration, and
          a hand under fine control.
        </dd>

        <dt>Presentation</dt>
        <dd>
          A Montessori lesson: the adult shows the material slowly, with few words, then hands it over. Each
          lesson on this site scripts one presentation step by step — our{' '}
          <Link to="/parents/how-to-present">how to present a lesson</Link> guide covers the general craft.
        </dd>

        <dt>Quantity vs. symbol</dt>
        <dd>
          The deliberate split between an amount itself (six beads on a wire) and its written sign ("6").
          Montessori teaches each separately, then joins them —{' '}
          <Link to="/lessons/cards-and-counters">cards and counters</Link> is the classic union for the numbers 1
          to 10.
        </dd>

        <dt>Seguin boards (teen board &amp; ten board)</dt>
        <dd>
          Two board sets named for Édouard Séguin. The <Link to="/materials/teen-board">teen board</Link> builds
          11–19 by sliding a digit card over a printed 10, showing that "fourteen" is ten-and-four; the{' '}
          <Link to="/materials/ten-board">ten board</Link> does the same for 10 through 99.
        </dd>

        <dt>Sensitive period</dt>
        <dd>
          A window when a child is spontaneously hungry for one kind of learning — order, counting, huge numbers
          — and absorbs it with unusual ease. This is why the <Link to="/ages">ages on this site</Link> are
          readiness ranges, not deadlines.
        </dd>

        <dt>Skittle</dt>
        <dd>
          A small pawn-shaped figure that stands for a person in division work. Twelve beads dealt fairly to
          three skittles, one round at a time — each skittle's share is the answer. See the{' '}
          <Link to="/materials/division-board">division board</Link>.
        </dd>

        <dt>Snake game</dt>
        <dd>
          Colored bead bars laid end to end in a winding "snake," then counted and traded, ten by ten, into
          golden bars. It's addition facts and making-ten disguised as a game — the{' '}
          <Link to="/lessons/snake-game">snake game lesson</Link> shows the whole ritual.
        </dd>

        <dt>Stamp game</dt>
        <dd>
          Place value shrunk down to small tiles the child moves alone: green 1s, blue 10s, red 100s, green
          1,000s — the same colors as everywhere else in the sequence. It's the first step of the passage to
          abstraction, covering all four operations; start at the{' '}
          <Link to="/lessons/stamp-game-intro">stamp game introduction</Link>.
        </dd>

        <dt>Three-period lesson</dt>
        <dd>
          The Montessori way to teach any new name, in three steps: "This is nine." (naming), "Show me nine."
          (recognizing — where most of the time is spent), and only last, "What is this?" (recalling). If period
          three wobbles, you simply return to period two another day. Details in{' '}
          <Link to="/parents/how-to-present">how to present a lesson</Link>.
        </dd>

        <dt>Variation</dt>
        <dd>
          A different way to do the same work at the same level of difficulty — new numbers, swapped roles, a
          changed layout. Variations keep repetition fresh, and repetition is where the learning actually
          happens.
        </dd>

        <dt>Work cycle</dt>
        <dd>
          The full arc of one work session: the child chooses the work, carries it to the table or rug, works and
          repeats as long as interest lasts, then returns everything to order. Protecting that cycle — above all,
          not interrupting it — matters more than the math on any particular day.
        </dd>
      </dl>

      <p>
        Two more good starting points: the{' '}
        <Link to="/parents/montessori-math-overview">Montessori math overview</Link> for the big picture, and the{' '}
        <Link to="/parents/scope-and-sequence">scope &amp; sequence</Link> for where every lesson fits.
      </p>
    </article>
  )
}
