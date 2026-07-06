import { Link } from 'react-router-dom'
import type { GuideMeta } from '../types'

export const meta: GuideMeta = {
  slug: 'using-this-site',
  title: 'Using This Site',
  summary: 'Virtual vs. physical materials, printing in color or B&W, and how lessons, materials, and worksheets fit together.',
}

export default function UsingThisSite() {
  return (
    <article className="guide">
      <h1>Using This Site</h1>
      <p className="guide-lede">
        Everything here comes in three flavors: lessons you read, materials your child uses, and worksheets you
        print. This page explains how they fit together, when to reach for the screen versus the real thing, and how
        to get good prints without burning through an ink cartridge.
      </p>

      <h2>The three kinds of pages</h2>
      <dl>
        <dt>Lessons are for you to read</dt>
        <dd>
          Each <Link to="/lessons">lesson</Link> is a short album page written for a parent with no training: what to
          gather, what to say, what to do with your hands, and what to watch for. Read it before you sit down with
          your child — better yet, print it, so the screen stays out of the presentation entirely. A lesson is
          something you give at the table, not something your child clicks through.
        </dd>
        <dt>Materials are for your child to use</dt>
        <dd>
          The <Link to="/materials">virtual materials</Link> — golden beads, the stamp game, the hundred board, and
          the rest — are the only thing on this site meant for a child's hands on a screen. Each one works by
          tapping, has a Reset button, and checks itself the way the physical material does: a wrong exchange simply
          doesn't come out even. There are no points, no stars, no timers.
        </dd>
        <dt>Worksheets are for printing</dt>
        <dd>
          All practice beyond the materials happens with a pencil. The{' '}
          <Link to="/worksheets">worksheet generators</Link> make fresh, correctly-graded problem sheets on demand —
          you print them, your child works them on paper. Nothing on this site asks a child to type an answer.
        </dd>
      </dl>

      <h2>Virtual vs. physical — an honest word</h2>
      <p>
        Real materials beat screens. Montessori math works because the child's hand does the learning: a thousand
        cube is heavy, ten ten-bars laid side by side really do build a hundred square, and trading ten unit beads
        for a ten-bar is a physical event a five-year-old remembers in her fingers. A tablet can't give you weight,
        and it can't give you that satisfying click of beads in a bowl.
      </p>
      <p>
        So: if you can buy or make the real thing, do — especially the golden beads, which carry the whole decimal
        system. The virtual materials here are faithful stand-ins, with the correct colors, quantities, and
        exchanges, for the things you don't own. Almost nobody owns a checkerboard or racks and tubes at home; that's
        exactly what the virtual versions are for. Use the real material where you have it, the screen where you
        don't, and paper for everything else.
      </p>

      <h2>Making your own materials</h2>
      <p>
        A surprising amount of the shelf can come from a craft store and your printer. Every material page lists the
        exact colors; here are the substitutions that actually work at a kitchen table.
      </p>
      <dl>
        <dt>Bead bars and the bead stair</dt>
        <dd>
          Craft beads threaded on pipe cleaners, ends folded over. Match the traditional colors (they're on the{' '}
          <Link to="/materials/bead-stair">bead stair page</Link>): one red, two green, three pink, up through nine
          dark blue and ten golden. A full stair costs an afternoon and a few dollars.
        </dd>
        <dt>Golden beads</dt>
        <dd>
          Golden pony beads on pipe cleaners make honest ten-bars. For hundreds and thousands, print the quantity
          cards from the <Link to="/worksheets/golden-bead-pictures">golden bead pictures</Link> sheets. Dry beans in
          labeled cups will do for a quick exchange game, but use them as a stopgap — beans hide the best part, which
          is that a hundred visibly <em>is</em> ten tens.
        </dd>
        <dt>Hundred board</dt>
        <dd>
          Print the <Link to="/worksheets/hundred-chart">hundred chart</Link> twice: cut one copy into tiles, keep
          the other whole as the control your child checks against.
        </dd>
        <dt>Stamp game</dt>
        <dd>
          Small paper squares do the job: green squares marked 1, blue marked 10, red marked 100, green again for
          1,000. Cut a pile of each — the <Link to="/lessons/stamp-game-intro">stamp game lesson</Link> shows how
          they're laid out in columns.
        </dd>
        <dt>Fraction circles</dt>
        <dd>
          Paper plates. Leave one whole, cut the others into halves, thirds, quarters, and so on, and label each
          piece. The <Link to="/materials/fraction-circles">virtual fraction circles</Link> make a good reference
          while you cut.
        </dd>
        <dt>Number cards</dt>
        <dd>
          Index cards and four markers: units in green, tens in blue, hundreds in red, thousands in green again. See{' '}
          <Link to="/materials/number-cards">number cards</Link> for the sizing that lets them stack.
        </dd>
      </dl>

      <h2>Printing guide</h2>
      <p>
        Every printable on this site is laid out for US Letter paper and prints straight from your browser — click
        the Print button on the page, or press Ctrl+P (Cmd+P on a Mac). The same dialog doubles as a PDF maker:
        choose &ldquo;Save as PDF&rdquo; as the destination and you can keep a sheet, email it, or print it later at
        the library.
      </p>
      <p>A few switches worth knowing on the worksheet pages:</p>
      <dl>
        <dt>Color or black &amp; white</dt>
        <dd>
          Sheets print in authentic Montessori colors by default. If ink is precious, check{' '}
          <em>Ink-friendly black &amp; white</em> — nothing is lost, because no sheet encodes information in color
          alone.
        </dd>
        <dt>Answer keys</dt>
        <dd>
          The answer key prints as its own separate page, so you decide what to do with it: keep it in your folder,
          or hand it over when the work is done and let your child check herself — that's the Montessori way, and it
          spares you from being the judge. Uncheck <em>Include answer key page</em> to leave it out entirely.
        </dd>
        <dt>Seeds — reprinting the exact same sheet</dt>
        <dd>
          Every generated sheet comes from a seed number shown on the page and stored in the URL. The same URL always
          reproduces the identical sheet, so bookmark it if a page gets spilled on or you want a second copy for a
          sibling. Want different problems at the same difficulty? Click <em>New problems</em>.
        </dd>
      </dl>

      <h2>On a tablet</h2>
      <p>
        The virtual materials are built tap-first, with targets sized for small fingers — no dragging skill required.
        Landscape orientation is recommended; the wider layout keeps the whole material in view. A tablet propped
        flat on the table next to real paper and pencil is the best setup we know.
      </p>

      <h2>Nothing to sign up for</h2>
      <p>
        There are no accounts, no logins, and no tracking of any kind. The site doesn't know your child's name,
        doesn't keep score, and doesn't phone home — once a page has loaded, it works without an internet connection.
        Your child's progress lives where it belongs: in the growing stack of finished paper and in what you notice
        at the table.
      </p>

      <h2>Where to start</h2>
      <p>
        If Montessori math is new to you, start with the{' '}
        <Link to="/parents/montessori-math-overview">overview</Link> for the why, then{' '}
        <Link to="/parents/how-to-present">how to present a lesson</Link> for the how. To find your child's place in
        the sequence, use the <Link to="/parents/scope-and-sequence">scope &amp; sequence chart</Link> — or jump
        straight to <Link to="/ages">browse by age</Link> and pick the first lesson that looks like a comfortable
        fit.
      </p>
    </article>
  )
}
