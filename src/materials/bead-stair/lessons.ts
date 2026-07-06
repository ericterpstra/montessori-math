import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'bead-stair-intro',
    name: 'The Colored Bead Stair',
    strand: 'numbers-to-10',
    sequence: 1,
    ages: [4, 6],
    grades: 'PK–K',
    overview:
      'Your child builds a triangle-shaped "stair" from nine colored bead bars, counting each one from 1 to 9. It is one of the very first math works: each quantity gets its own color and length, so numbers become something you can see and hold.',
    materialsNeeded: [
      'Colored bead stair: nine bead bars, 1 through 9 beads, each in its own color (traditional colors: 1 red, 2 green, 3 pink, 4 yellow, 5 light blue, 6 lavender, 7 white, 8 brown, 9 dark blue)',
      'Household substitute: pony beads threaded on pipe cleaners, one color per bar — or rows of dot stickers on cardboard strips cut to length',
      'A small mat, tray, or solid-color placemat to work on',
      'Numeral cards 1–9 for the matching extension (write them on index cards)',
    ],
    virtualMaterials: ['bead-stair'],
    prerequisites: [],
    directAims: [
      'Count 1 to 9 with one-to-one correspondence, touching one bead for each number said',
      'Associate each quantity 1–9 with a fixed color and length',
      'Put the quantities 1–9 in order',
    ],
    indirectAims: [
      'Learn the color code used by later bead materials (snake game, teen board, bead chains, multiplication board)',
      'Prepare for pairing quantities with written numerals',
      'Build the habit of careful, ordered work from left to right and top to bottom',
    ],
    presentation: [
      {
        text: 'Invite your child to bring the box of bead bars to the mat with you. Sit beside them, on the side of their writing hand if you can, and pour the bars gently onto the mat so they land scattered.',
        say: 'These are the colored bead bars. Let’s find out how many beads are on each one.',
      },
      {
        text: 'Pick up the single red bead. Touch it as you count aloud, then lay it near the top of the mat.',
        say: 'One. This is one.',
      },
      {
        text: 'Find the green bar. Count each bead slowly, touching one bead per number, and place it directly under the one-bar, lining up the left ends.',
        say: 'One, two. This is two.',
      },
      {
        text: 'Continue the same way with each bar: find it, count every bead out loud with a touch, and lay it under the last one. Invite your child to take over the counting and placing as soon as they reach for it.',
        say: 'Which bar shall we count next?',
      },
      {
        text: 'When all nine bars are placed, sit back and look at the shape together. Run a finger down the stair’s diagonal edge.',
        say: 'Look — the bars make a stair. Each step is one bead longer.',
      },
      {
        text: 'Play a quick game with three bars your child knows (a three-period lesson). First name them, then ask your child to find them, then point and ask what each one is.',
        say: 'This is three. Can you show me three? … Now, which one is this?',
      },
      {
        text: 'Show your child how to mix the bars back up and build the stair again on their own, then how to return the bars to their box. Leave it where they can choose it again tomorrow.',
        say: 'You can build the stair whenever you like.',
      },
    ],
    pointsOfInterest: [
      'Every bar has its own color — the five-bar is always light blue, the nine-bar always dark blue',
      'The finished stair makes a neat triangle with a smooth diagonal edge',
      'Touching each bead exactly once while counting',
      'Finding the one bar that is "next" when building in order',
    ],
    controlOfError: [
      'A bar in the wrong row breaks the triangle: it sticks out past the stair’s edge or falls short of it',
      'There is only one bar of each color and length, so a mistake leaves an impossible leftover',
      'Recounting the beads on any bar settles a disagreement without an adult’s verdict',
    ],
    vocabulary: ['one through nine (the number names)', 'bead', 'bar', 'stair', 'longer', 'shorter'],
    variations: [
      'Build the stair from nine up to one instead of one down to nine',
      'Hide one bar behind your back and ask which step of the stair is missing',
      'Place the bars in a bag and have your child find a named bar by feel (by length)',
    ],
    extensions: [
      'Match numeral cards 1–9 to the finished stair, counting each bar to check (the virtual material’s "Match the numerals" activity does this on screen)',
      'A distance game: leave the numeral cards across the room so your child must remember the quantity while walking to fetch the right card',
      'Draw the stair on paper with crayons close to the bead colors and write the numeral beside each row',
    ],
    whatComesNext:
      'When your child can build the stair confidently and name the bars, move on to Cards & Counters, where they lay out loose counters under numeral cards 1–10 and discover odd and even. The bead stair colors return soon after in the Teen Board lesson and later in the Snake Game, so time spent here pays off for years.',
    followUpWork: [
      {
        description:
          'Print a numeral-tracing page and let your child trace and then write the numerals 1–9, saying each number’s name aloud. Keep sessions short — a line or two of careful numerals beats a full page of tired ones.',
        worksheetSlug: 'numeral-tracing',
      },
      {
        description:
          'Once the stair is easy, print a page of the very simplest addition facts (sums within 9). Your child builds each problem with two bead bars, counts the total, and writes the answer in pencil.',
        worksheetSlug: 'math-facts',
      },
      {
        description:
          'Have your child draw their own bead stair on paper: rows of circles, one more in each row, colored to match the real bars, with the numeral written beside each row.',
      },
    ],
  },
]
