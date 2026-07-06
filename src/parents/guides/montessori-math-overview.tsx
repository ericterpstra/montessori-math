import { Link } from 'react-router-dom'
import type { GuideMeta } from '../types'

export const meta: GuideMeta = {
  slug: 'montessori-math-overview',
  title: 'Why Montessori Math Works',
  summary:
    'Children learn math by holding quantities in their hands first, then letting go of the material one step at a time until only the numbers remain.',
}

export default function MontessoriMathOverview() {
  return (
    <article className="guide">
      <h1>Why Montessori Math Works</h1>
      <p className="guide-lede">
        Montessori math rests on one big idea: a child should hold a quantity in her hands before she is ever asked to
        push its symbol around on paper. Everything else — the beads, the cards, the boards, the careful order of
        lessons — exists to walk that road from concrete to abstract, one honest step at a time.
      </p>

      <h2>Your child already has a mathematical mind</h2>
      <p>
        Watch a four-year-old for an afternoon and you'll see it: she lines up her toy animals from biggest to
        smallest, insists that her brother got more crackers, counts the stairs on the way up. Maria Montessori
        called this the <em>mathematical mind</em> — a natural drive to count, sort, compare, and put things in
        order. Children don't need to be talked into math. They need math served in a form their hands can grab.
      </p>
      <p>
        That's why nothing here starts with worksheets or flash cards. It starts with objects.
      </p>

      <h2>From the hand to the head</h2>
      <p>
        The central move in Montessori math is the <em>passage from concrete to abstract</em>. It's not a slogan —
        it's a physical ladder your child climbs, and you can see every rung:
      </p>
      <dl>
        <dt>
          Quantity in the hand — the <Link to="/materials/golden-beads">golden beads</Link>
        </dt>
        <dd>
          A thousand is a cube you need two hands to carry. A hundred is a flat square; ten is a bar; a unit is a
          single bead. When a child builds 2,345 out of beads, "thousands are bigger than hundreds" isn't a rule —
          it's a fact her arms already know.
        </dd>
        <dt>
          Symbols attached to quantity — the <Link to="/materials/number-cards">number cards</Link>
        </dt>
        <dd>
          Printed cards (units green, tens blue, hundreds red) get laid next to the beads. Stack them and 2,000 +
          300 + 40 + 5 collapses into "2345." The symbol earns its meaning by sitting right beside the real thing.
        </dd>
        <dt>
          Tokens that only differ by label — the <Link to="/materials/stamp-game">stamp game</Link>
        </dt>
        <dd>
          Now every piece is the same size: little colored tiles marked 1, 10, 100, 1,000. Size no longer carries the
          information — the child has to hold place value in her head. The first quiet step toward abstraction.
        </dd>
        <dt>
          Beads on wires — the <Link to="/materials/bead-frame">bead frame</Link>
        </dt>
        <dd>
          An abacus-like frame where each wire is a place. Carrying and borrowing become a flick of the fingers, and
          the child starts recording her work on paper as she goes.
        </dd>
        <dt>Paper alone</dt>
        <dd>
          One day the child solves the problem before the material does. The beads have become unnecessary — and
          that's the point. The material is scaffolding, built to be outgrown.
        </dd>
      </dl>
      <p>
        A child who climbs this ladder doesn't just know <em>that</em> you "carry the one" — she knows it's ten
        units being traded for a ten-bar, because she made that trade with her own hands a hundred times.
      </p>

      <h2>Materials before memorization</h2>
      <p>
        Montessori children do memorize their math facts — there's a whole strand of{' '}
        <Link to="/materials">boards and games</Link> for exactly that. But memorization comes <em>after</em>{' '}
        understanding, never instead of it. A child who has built 4 + 3 out of bead bars in the{' '}
        <Link to="/lessons/snake-game">snake game</Link> is memorizing something she already understands. A child
        drilled on naked facts is memorizing noise. The order matters more than the speed.
      </p>

      <h2>Movement and repetition are the method</h2>
      <p>
        Montessori wrote that the hand is the instrument of the intelligence, and math is where you see it most
        plainly. Fetching a thousand-cube from across the room, exchanging ten units for a ten-bar, laying out
        counters in tidy pairs — the movement isn't a break from the learning. It <em>is</em> the learning.
      </p>
      <p>
        The same goes for repetition. A child who wants to build the same number three days in a row isn't stuck;
        she's practicing, the way she practiced walking. Let her repeat until she's done. She'll tell you she's done
        by losing interest — and not before.
      </p>

      <h2>The material corrects, not you</h2>
      <p>
        Good Montessori materials have <em>control of error</em> built in: if the work is wrong, the material itself
        shows it. Run out of counters in <Link to="/lessons/cards-and-counters">cards and counters</Link> and
        something was miscounted — no adult verdict required. This keeps you out of the referee's chair and lets your
        child check her own work, which is where real confidence comes from. The virtual materials on this site keep
        that same honesty: they show, they don't score. (And there are no points, badges, or accounts anywhere here —
        the reward is the work.)
      </p>

      <h2>How a lesson is given</h2>
      <p>
        Montessori lessons are short, quiet, and mostly wordless — you show, slowly, and then hand the material over.
        New vocabulary is taught with a simple routine called the <em>three-period lesson</em>: name it, ask the
        child to find it, ask the child to name it. It takes two minutes to learn and it's the backbone of every
        presentation on this site. The full how-to lives in{' '}
        <Link to="/parents/how-to-present">How to Present a Lesson</Link>.
      </p>

      <h2>Two different children, two different approaches</h2>
      <p>
        Montessori observed that children pass through <em>planes of development</em>, and math looks different in
        each. From about 4 to 6, a child absorbs through the senses — she wants to touch, carry, count, and repeat,
        and the golden beads meet her exactly there. From about 6 to 12, a child reasons and imagines — she wants to
        know <em>why</em> the checkerboard works, hunt for patterns, and take on problems that look impressively
        huge. The <Link to="/ages">ages page</Link> sorts everything on this site by that readiness, not by
        deadlines.
      </p>

      <h2>What a week at home actually looks like</h2>
      <p>
        Modest and a little uneven, honestly. Two or three sessions of fifteen to twenty minutes beats one heroic
        Saturday. A realistic week: one short <Link to="/lessons">presentation</Link> of something new, a day or two
        of your child repeating it on her own while you stay nearby and resist narrating, and one or two printed{' '}
        <Link to="/worksheets">worksheets</Link> as pencil-and-paper follow-up. Some weeks nothing lands and you just
        try again later. That's not failure; that's the pace.
      </p>
      <blockquote>
        One honest note: real, physical materials beat screens. If you own golden beads or a stamp game, use those —
        the weight in the hand is part of the lesson. The virtual materials here are faithful stand-ins for the
        pieces you don't own, and everything your child practices beyond the materials goes on paper. Every
        printable comes in authentic Montessori color or ink-friendly black and white, on ordinary US Letter paper.
      </blockquote>

      <h2>Where to go next</h2>
      <p>
        Read <Link to="/parents/how-to-present">How to Present a Lesson</Link> — it's short, and it will make every
        lesson page make sense. Then skim the <Link to="/parents/scope-and-sequence">Scope &amp; Sequence</Link> to
        see the whole path from counting to long division, and find the rung where your child is standing right now.
      </p>
    </article>
  )
}
