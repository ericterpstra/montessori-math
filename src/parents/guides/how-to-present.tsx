import { Link } from 'react-router-dom'
import type { GuideMeta } from '../types'

export const meta: GuideMeta = {
  slug: 'how-to-present',
  title: 'How to Present a Lesson',
  summary: 'The simple mechanics of giving a Montessori presentation at home — slow hands, few words, and the three-period lesson.',
}

export default function HowToPresent() {
  return (
    <article className="guide">
      <h1>How to Present a Lesson</h1>
      <p className="guide-lede">
        In Montessori, a &ldquo;lesson&rdquo; is not a lecture. It's a short, quiet demonstration — you show your
        child how to do something with the material, using your hands more than your voice, and then you step back
        and let them do it. That's the whole trick, and anyone can learn it at the kitchen table.
      </p>

      <h2>What a presentation is</h2>
      <p>
        Picture two or three minutes, not thirty. You sit beside your child, lay out the material, and work through
        it once — slowly, deliberately, almost silently. The child watches your hands. Then the material is theirs.
        A good presentation feels less like teaching and more like showing a friend how to fold a paper crane: watch
        me, now you try.
      </p>
      <p>
        The reason for the quiet is practical. A young child can watch your hands or listen to your words, but not
        both at once. When you narrate every move, the movements blur. When your hands move alone, they're
        riveting.
      </p>

      <h2>Prepare yourself first</h2>
      <p>Three small habits make every presentation go better:</p>
      <dl>
        <dt>Do the lesson alone first.</dt>
        <dd>
          Run through it once by yourself the night before — with the{' '}
          <Link to="/materials">virtual material</Link> or the real thing. Your hands should already know the moves,
          because hesitation is contagious. Every lesson page on this site walks you through the exact steps.
        </dd>
        <dt>Gather everything before you begin.</dt>
        <dd>
          Hunting for the number cards mid-lesson breaks the spell. Have the material, a mat or clear table space,
          and anything printed ready before you invite your child over.
        </dd>
        <dt>Choose a calm moment.</dt>
        <dd>
          Not right before dinner, not when a sibling is melting down. Ten unhurried minutes beat thirty distracted
          ones. If today isn't the day, the beads will keep.
        </dd>
      </dl>

      <h2>The technique</h2>
      <p>
        Sit on the side of your child's dominant hand — the right side for a right-handed child — so they see the
        material the way they'll use it, and your arm never crosses their view. Then remember three things:
      </p>
      <p>
        <strong>Slow hands.</strong> Move about half as fast as feels natural. Pick up a bead bar the way you'd pick
        up something precious, because to the child it is.
      </p>
      <p>
        <strong>Few words.</strong> Say only what carries meaning: the names of things, the key question. Cut the
        &ldquo;okay, so now what we're going to do is&hellip;&rdquo;
      </p>
      <p>
        <strong>Don't talk and move at the same time.</strong> Move, then pause, then speak. Speak, then pause, then
        move. This one rule will improve your presentations more than anything else on this page.
      </p>
      <p>
        You don't have to invent the words, either. Every lesson on this site puts suggested spoken language in
        quotes right in the presentation steps — say those lines, or something close, and you're doing it right.
        Browse the <Link to="/lessons">lesson album</Link> to see what that looks like.
      </p>

      <h2>The three-period lesson</h2>
      <p>
        Whenever you're teaching new <em>names</em> — unit, ten, hundred; the numerals; fraction names — Montessori
        uses a simple three-step pattern called the three-period lesson. Here it is with the golden beads, teaching
        the words <em>unit</em>, <em>ten</em>, and <em>hundred</em> (see{' '}
        <Link to="/lessons/golden-beads-intro">the golden beads introduction</Link> for the full lesson):
      </p>
      <p>
        <strong>Period 1 — naming: &ldquo;This is&hellip;&rdquo;</strong> Place one golden bead in front of your
        child. Pause. &ldquo;This is a <em>unit</em>.&rdquo; Let them hold it. Place the ten-bar. &ldquo;This is a{' '}
        <em>ten</em>.&rdquo; Let them run their fingers along it. The hundred-square: &ldquo;This is a{' '}
        <em>hundred</em>.&rdquo; That's it — you give each name two or three times, calmly, and nothing more.
      </p>
      <p>
        <strong>Period 2 — recognizing: &ldquo;Show me&hellip;&rdquo;</strong> This is the longest period by far,
        and it should feel like a game, because it is one. &ldquo;Show me the ten.&rdquo; &ldquo;Put the unit on my
        hand.&rdquo; &ldquo;Hide the hundred behind your back.&rdquo; &ldquo;Put the ten on your head!&rdquo; The
        child hears the name and acts — handling the objects again and again while the words sink in. Stay here as
        long as it's fun. Most of the learning happens in period two, so don't rush past it.
      </p>
      <p>
        <strong>Period 3 — recalling: &ldquo;What is this?&rdquo;</strong> Only now do you point to the ten-bar and
        ask, &ldquo;What is this?&rdquo; — and only when you're all but certain the answer will be right. Period
        three is a small quiet triumph, not a quiz. If you're not sure they'll get it, stay in period two, or simply
        end the lesson happily and pick it up tomorrow. There is no prize for reaching period three today.
      </p>
      <blockquote>
        You place the ten-bar on the mat and let your hands rest. A breath. &ldquo;This is a <em>ten</em>.&rdquo;
        Another breath. You slide it toward her. She picks it up, counts the beads with one finger, and looks up at
        you. You smile and say nothing at all.
      </blockquote>

      <h2>Why you never say &ldquo;no, that's wrong&rdquo;</h2>
      <p>
        Montessori materials are built with a <em>control of error</em> — the material itself reveals mistakes. Count
        the beads on a ten-bar and there are exactly ten; run out of counters in{' '}
        <Link to="/lessons/cards-and-counters">cards and counters</Link> and something got miscounted. The child can
        discover the error and fix it without anyone's verdict, which is precisely how they learn to check their own
        work.
      </p>
      <p>
        So when your child says &ldquo;hundred&rdquo; while holding the ten-bar, don't correct them. Just say,
        &ldquo;That's a ten,&rdquo; warmly — or say nothing, note it to yourself, and re-present the lesson another
        day. A correction teaches a child to watch your face for approval. The material teaches them to look at the
        beads.
      </p>

      <h2>Then sit on your hands</h2>
      <p>
        After the presentation, the material belongs to the child — and your job becomes observation. This is the
        hard part for parents. The child works slowly, or inefficiently, or pauses forever between steps, and every
        fiber of you wants to reach in and straighten a bead. Don't. If the mistake matters, the material will show
        it; if it doesn't, it doesn't. Watch what they repeat, where they hesitate, what makes them light up. That's
        your data for choosing the next lesson from the{' '}
        <Link to="/parents/scope-and-sequence">scope &amp; sequence</Link>.
      </p>

      <h2>End at joy, not exhaustion</h2>
      <p>
        Stop while it's still fun. A lesson that ends with the child wanting more will be asked for again tomorrow; a
        lesson pushed past the child's attention ends the whole enterprise on a sour note. Ten good minutes, then
        put the material away together — the putting-away is part of the work — and follow up later with paper.
        Every lesson lists pencil-and-paper follow-up work, with{' '}
        <Link to="/worksheets">printable worksheets</Link> where they fit.
      </p>

      <h2>Repetition is the point</h2>
      <p>
        A child who builds the same number with golden beads five days running isn't stuck — they're practicing,
        exactly the way they once asked for the same bedtime story fifty times. Repetition is how the hand teaches
        the mind. You never need to hurry a child off a material they still love; they'll leave it on their own the
        moment it stops feeding them.
      </p>
      <p>
        And if your child ignores your presentation entirely and just stacks the hundred-squares into a tower?
        That's common, normal, and covered in the <Link to="/parents/faq">FAQ</Link> — short version: exploration
        comes first, and the lesson will land better next week. One more thing worth repeating: these virtual
        materials are stand-ins. If you own real golden beads, present with those, and use this site for the lesson
        scripts and the printables.
      </p>
    </article>
  )
}
