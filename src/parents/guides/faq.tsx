import { Link } from 'react-router-dom'
import type { GuideMeta } from '../types'

export const meta: GuideMeta = {
  slug: 'faq',
  title: 'Frequently Asked Questions',
  summary: 'Honest answers to the questions parents actually ask.',
}

export default function Faq() {
  return (
    <article className="guide">
      <h1>Frequently Asked Questions</h1>
      <p className="guide-lede">
        Real questions from real kitchen tables, answered plainly. If yours isn't here, the{' '}
        <Link to="/parents/montessori-math-overview">overview</Link> and{' '}
        <Link to="/parents/how-to-present">how to present</Link> guides cover the bigger picture.
      </p>

      <h2>Is my child ready to start?</h2>
      <p>
        Readiness is something you observe, not a birthday you wait for. A child who is ready for the first math work
        can count a handful of objects out loud (even imperfectly), sits with an activity for five or ten minutes, and
        shows interest in "how many" — how many crackers, how many stairs, who has more. If that sounds like your
        child, start with <Link to="/lessons/bead-stair-intro">the bead stair</Link> or{' '}
        <Link to="/lessons/cards-and-counters">cards and counters</Link> and see what happens.
      </p>
      <p>
        If it doesn't sound like your child yet, wait a few weeks and watch. Nothing is lost by starting late;
        plenty is lost by starting with a child who isn't interested. The <Link to="/ages">ages page</Link> can help
        you find a reasonable entry point.
      </p>

      <h2>Do I have to follow the exact order?</h2>
      <p>
        Yes and no. The seven strands of the curriculum run <em>in parallel</em> — a five-year-old might be doing
        golden bead work, teen boards, and early addition facts in the same week, and that's exactly how it's meant
        to go. You do not finish one strand before opening the next.
      </p>
      <p>
        Within a strand, though, the order matters. Each lesson quietly builds the hand skills and ideas the next one
        assumes, so skipping ahead usually means backing up later. The{' '}
        <Link to="/parents/scope-and-sequence">scope and sequence chart</Link> shows the order inside each strand;
        trust it more than your sense of what "should" come next.
      </p>

      <h2>How long should a session be?</h2>
      <p>
        Ten to twenty minutes is typical, and shorter is fine. The real answer is: as long as the child is genuinely
        engaged, and not one minute longer. The best time to stop is while it's still going well — end on the child
        wanting more, not on you dragging them to a finish line. A session that ends early and happily earns you the
        next one.
      </p>

      <h2>My child just plays with the beads — is that okay?</h2>
      <p>
        Yes. Truly. Stacking the ten-bars into a wall, sorting the bead stair by favorite color, building a tower of
        hundred squares — this is a child getting acquainted with the material, and exploration always comes before
        work. A child who has handled a thousand cube for the fun of it has already learned something about a
        thousand.
      </p>
      <p>
        Redirect gently when play crowds out everything else for weeks, or when beads start flying. A quiet "these
        are for counting — would you like me to show you?" is usually enough. If the answer is no, put the material
        away and offer again another day. The material staying slightly special is part of its pull.
      </p>

      <h2>My child keeps making the same mistake — should I correct it?</h2>
      <p>
        Resist the urge. Montessori materials are built with a <em>control of error</em> — the beads themselves
        reveal the mistake, if you give them time. A child who counts wrong ends up with a leftover counter, a bar
        that doesn't match, a column that's too tall. Discovering that is worth ten of your corrections, because it
        teaches the child to check rather than to look at your face for the verdict.
      </p>
      <p>
        If the same error persists across several sessions, don't lecture — just re-present the lesson on a fresh
        day, slowly, as if for the first time. Nine times out of ten the child simply missed a step, and the second
        showing lands. The <Link to="/parents/how-to-present">how to present</Link> guide walks through this.
      </p>

      <h2>How much should we do each week?</h2>
      <p>
        Two to four short sessions a week is plenty, and beats one long Saturday marathon every time. Little and
        often is how this material works — the child's mind keeps chewing on it between sessions. Mix in the paper
        follow-up work (<Link to="/worksheets">printable worksheets</Link>) on the in-between days if the child
        wants it. If a week gets eaten by life, nothing breaks; pick up where you left off.
      </p>

      <h2>Do I need to buy the materials?</h2>
      <p>
        No. Real materials are wonderful and worth it if you can, but a full set costs real money, and there are
        good substitutes for nearly everything — dried beans and cups for golden beads, index cards for number
        cards, a printed <Link to="/worksheets/hundred-chart">hundred chart</Link> instead of a wooden board. The{' '}
        <Link to="/parents/using-this-site">using this site</Link> guide lists substitutions material by material,
        and the virtual materials here fill the remaining gaps.
      </p>

      <h2>Is screen time with the virtual materials "real" Montessori?</h2>
      <p>
        Honestly? No — and we built the site. Montessori is about the hand: the weight of a thousand cube, the
        click of beads, the reach across the table. A screen can't give you that, and we won't pretend otherwise.
      </p>
      <p>
        What the <Link to="/materials">virtual materials</Link> are is a faithful stand-in when you don't own the
        real thing — the right colors, the right quantities, the same exchanges. Use them the way you'd use the
        physical material: short, purposeful sessions with you sitting alongside, not solo tablet time. And all the
        practice that follows a lesson goes to paper, where it belongs. Print the worksheets; hand the child a
        pencil.
      </p>

      <h2>My child is "behind" grade level — does it matter?</h2>
      <p>
        On this site, ages and grades are readiness ranges, not deadlines — you'll notice every range on the{' '}
        <Link to="/parents/scope-and-sequence">scope and sequence</Link> spans several years, because that's how
        actual children move. What matters is that your child is on the sequence and moving along it, not where a
        school's calendar says they should be. A seven-year-old doing{' '}
        <Link to="/lessons/golden-beads-addition">golden bead addition</Link> carefully and happily is not behind;
        they are exactly where the work is. Children who get the concrete foundations solidly tend to move fast
        later — the sequence is the path, and speed takes care of itself.
      </p>

      <h2>Can I skip the concrete materials if my child already knows the facts?</h2>
      <p>
        You can, but know what you're trading away. A child who can recite 6 + 8 = 14 knows a fact; a child who has
        built it from bead bars and watched ten units become a ten-bar knows what the fact <em>means</em> — and that
        understanding is what carries them through regrouping, long division, fractions, and algebra later. Facts
        without the picture underneath tend to crack under pressure around fourth grade.
      </p>
      <p>
        The good news: a child who already knows the facts moves through the materials quickly. Give them the{' '}
        <Link to="/lessons/golden-beads-intro">golden beads</Link> or the{' '}
        <Link to="/lessons/stamp-game-intro">stamp game</Link> anyway — for them it's a fast, satisfying
        confirmation of what they suspected, and it costs a session or two, not a year.
      </p>

      <h2>How do I know when to move on?</h2>
      <p>
        Look for three things together: the work is easy, the answers are right, and the child is getting a little
        bored. Ease without accuracy means more practice; accuracy without ease means more time; and ease plus
        accuracy plus lingering delight means enjoy it a while longer — boredom is the signal that the material has
        done its job. When all three show up, present the next lesson in the strand and watch the interest come
        back.
      </p>

      <h2>What if I make a mistake presenting?</h2>
      <p>
        You will, and it will be fine. You'll grab the wrong card, lose count at forty-seven, or realize halfway
        through that you skipped a step. Children are remarkably forgiving of imperfect presentations — what they
        actually absorb is your care with the material and your willingness to slow down. If a presentation goes
        sideways, smile, pack up the material neatly, and re-present it on another day as if nothing happened. The
        lesson plans at <Link to="/lessons">/lessons</Link> spell out each step, and there is no inspector coming.
        You're a parent showing a child something true about numbers, and that is enough.
      </p>
    </article>
  )
}
