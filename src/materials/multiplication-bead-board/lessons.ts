import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'multiplication-bead-board',
    name: 'The Multiplication Bead Board',
    strand: 'memorization',
    sequence: 4,
    ages: [6, 9],
    grades: '1–3',
    overview:
      'Your child builds each multiplication table bead by bead on a 10 × 10 board, counting the total after every column and writing the fact down. All that placing, counting, and writing is exactly how the times tables move from understanding into memory.',
    materialsNeeded: [
      'A multiplication bead board — or make one: draw a 10 × 10 grid of dots on stiff cardboard and write the numbers 1–10 across the top',
      'About 100 small red beads (pony beads, dried beans, or buttons work fine)',
      'Number cards 1–10 for the slot on the left (cut small squares from an index card)',
      'A small red disc to mark the multiple — a red button, milk-cap, or coin',
      'Pencil and paper so your child can write each fact as it is built',
    ],
    virtualMaterials: ['multiplication-bead-board'],
    prerequisites: ['golden-beads-multiplication', 'addition-strip-board'],
    directAims: [
      'Practice the multiplication tables from 1 × 1 through 10 × 10',
      'Commit the multiplication facts to memory through repeated building, counting, and writing',
    ],
    indirectAims: [
      'Reinforce the meaning of multiplication as taking the same quantity so many times',
      'Strengthen skip counting: each new product is exactly one more column of the same number',
      'Preparation for the unit division board, the checkerboard, and eventually multiplying entirely on paper',
    ],
    presentation: [
      {
        text: 'Set the board on the table with the box of red beads beside it and paper and pencil nearby. Ask your child to choose a table to work on — four is a friendly place to start. Slide the 4 card into the slot on the left edge of the board.',
        say: 'Today we are going to build the whole table of four.',
      },
      {
        text: 'Place the red disc above the 1 printed at the top of the board.',
        say: 'This disc shows how many times we are taking four. Right now we are taking four one time.',
      },
      {
        text: 'Count four beads one at a time into the first column, top to bottom.',
        say: 'Four, taken one time.',
      },
      {
        text: 'Ask your child to count every bead on the board, touching each one as they count.',
        say: 'Four times one is four. Write it down: 4 × 1 = 4.',
      },
      {
        text: 'Move the disc above the 2 and count four more beads into the second column.',
        say: 'Now we are taking four two times.',
      },
      {
        text: 'Have your child count all the beads again from the very first one — down the first column, then down the second.',
        say: 'Four times two is eight. Write 4 × 2 = 8.',
      },
      {
        text: 'Continue the same way: move the disc, place a column of four, count everything, write the fact. Hand the work over to your child as soon as they reach for it — the child placing and counting is the lesson.',
        say: 'What do you think four times three will be? Let us count and see.',
      },
      {
        text: 'Stop after 4 × 10 = 40, when the band of beads stretches all the way across the board. Read the finished list on the paper aloud together, top to bottom.',
        say: 'You have built the whole table of four.',
      },
    ],
    pointsOfInterest: [
      'The red disc creeping across the top of the board as the table grows',
      'The band of beads reaching the far edge of the board exactly at × 10',
      'Discovering that each new answer is exactly four more than the last — many children stop recounting and start counting on',
      'The written table growing down the page like a list of discoveries',
    ],
    controlOfError: [
      'The beads themselves: recounting always gives the same answer, and a column with too many or too few beads looks visibly ragged next to its neighbors',
      'Each product must be exactly one multiplicand more than the one before it — if the written list does not step evenly, a column was miscounted',
      'The board holds exactly 100 beads, so a table that will not fit means something was placed wrong',
      'On the virtual board, Practice mode checks the card and the columns with a plain ✓ or ✗ and leaves the answer for your child to count',
    ],
    vocabulary: ['multiplicand', 'multiplier', 'product', 'times', 'multiple', 'table'],
    variations: [
      'Build the table backward: start with all ten columns of four on the board and take one column away at a time, reading 4 × 10, 4 × 9, and so on',
      'Have your child say the fact before counting, then count to confirm the guess',
      'Work the tables out of order — let your child pick any single fact, such as 6 × 7, build it, and count it (Practice mode on the virtual board deals these out one at a time)',
    ],
    extensions: [
      'After building a table, skip count the columns aloud — four, eight, twelve, up to forty — touching the bottom of each column as you go',
      'Build 3 × 4, count it, then build 4 × 3 and count that: the products match, and your child has discovered that the order of the factors does not change the answer',
      'Write the table of 2 and the table of 4 side by side on paper and hunt for the doubling pattern',
    ],
    whatComesNext:
      'When your child can build any table smoothly and starts answering before the count is finished, the facts are taking hold. The next lesson in the memorization sequence is the Unit Division Board, which turns the same facts around: instead of building 4 × 3, the child deals 12 beads out fairly to 3 skittles. Later, the tables practiced here reappear at full size in Checkerboard Multiplication in the passage to abstraction.',
    followUpWork: [
      {
        description:
          'Print a multiplication facts sheet for the table your child just built. They answer in pencil at the table; any fact they miss goes back to the board to be rebuilt and counted.',
        worksheetSlug: 'math-facts',
      },
      {
        description:
          'Have your child copy the finished table (4 × 1 = 4 through 4 × 10 = 40) in their neatest handwriting and read it aloud once through — the writing and saying is part of the memorizing.',
      },
      {
        description:
          'Make a table booklet: staple ten half-sheets of paper together and let your child write one table per page as each one is mastered on the board, decorating the cover when the booklet is full.',
      },
    ],
  },
]
