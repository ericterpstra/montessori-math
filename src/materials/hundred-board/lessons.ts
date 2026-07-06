import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'hundred-board-intro',
    name: 'The Hundred Board',
    strand: 'linear-counting',
    sequence: 5,
    ages: [5, 7],
    grades: 'K–1',
    overview:
      'The child places number tiles 1 to 100, in order, on a ten-by-ten board. It pulls together everything learned about counting past ten and lets the child see the whole landscape of numbers to one hundred laid out in rows of ten.',
    materialsNeeded: [
      'A hundred board: a 10×10 grid with squares about 1 inch across (a purchased board, or draw one on poster board with a ruler)',
      'Number tiles 1–100 (wooden tiles, or cut 100 small squares of cardstock and write the numbers with a marker)',
      'A control chart: a completed hundred chart the child can uncover to check their work (print one or write one out)',
      'A small tray, bowl, or box lid to hold the loose tiles',
    ],
    virtualMaterials: ['hundred-board'],
    prerequisites: ['ten-board-counting'],
    directAims: [
      'To reinforce the sequence of numbers from 1 to 100',
      'To connect counting aloud with reading and ordering the written numerals',
      'To show the structure of the numbers to 100: ten rows of ten',
    ],
    indirectAims: [
      'Preparation for skip counting and, later, multiplication',
      'Discovery of place-value patterns (every number in a column ends in the same digit)',
      'Development of concentration, order, and independent work over a long task',
    ],
    presentation: [
      {
        text: 'Bring the empty board and the tray of tiles to the table. Sit beside the child, with the board square in front of them.',
        say: 'Today we are going to build every number from one to one hundred.',
      },
      {
        text: 'Find the tile 1 and place it in the top-left square. Trace along the top row with your finger to show which way the numbers will go.',
        say: 'One. The numbers march this way, across the row.',
      },
      {
        text: 'Hand the child the tile 2 and let them place it next to the 1. Continue handing tiles in order — 3, 4, 5 — saying each number together as it is placed.',
        say: 'Two. Three. Four. What comes next?',
      },
      {
        text: 'When the child reaches 10 at the end of the row, pause and slide your finger down to the start of the next row.',
        say: 'The row is full. Eleven starts a brand-new row, right under the one.',
      },
      {
        text: 'Let the child carry on placing tiles in order at their own pace. Stay nearby but resist correcting — a misplaced tile will announce itself when the pattern stops working.',
      },
      {
        text: 'If the child tires, it is fine to stop at the end of a row and finish another day. The full board can take several sittings at first.',
        say: 'We finished the forties today. Next time we can start at fifty-one.',
      },
      {
        text: 'When the last tile is placed, read some rows and columns together. Run a finger down the right-hand column: 10, 20, 30 …',
        say: 'Look — every number in this column ends in zero. You built all one hundred numbers.',
      },
    ],
    pointsOfInterest: [
      'The moment a row fills up and a new one begins',
      'Watching the columns emerge: 3, 13, 23, 33 all lined up',
      'The very last tile — 100 — completing the square',
      'Finding a stray tile because the pattern suddenly looks wrong',
    ],
    controlOfError: [
      'The number pattern itself: a tile out of place breaks the visible order of the row and column',
      'Exactly 100 tiles and 100 squares — leftover tiles or empty squares reveal a mistake',
      'The control chart, which the child can compare against square by square',
    ],
    vocabulary: ['row', 'column', 'hundred', 'before', 'after', 'the decade names: twenty, thirty, forty … one hundred'],
    variations: [
      'Build just one decade at a time (all the fifties) for a shorter work session',
      'Once the board is familiar, mix the tiles in a bowl and place them wherever they belong — the authentic, harder version (the Shuffled mode in the virtual board)',
      'Place the tiles counting backward from 100 to 1',
    ],
    extensions: [
      'Remove five tiles from a finished board while the child covers their eyes; they name and replace the missing numbers',
      'Ask the child to find a spoken number — "Can you put your finger on sixty-three?" — before any tiles are placed',
      'Cover a row with a strip of paper and ask what is hidden underneath',
    ],
    whatComesNext:
      'When the child can build the whole board from mixed tiles, they are ready for Skip Counting on the Hundred Board, where the same board reveals the patterns of counting by twos, fives, and tens. The bead chains follow, giving those same patterns a shape the hands can hold.',
    followUpWork: [
      {
        description:
          'Print a hundred chart with some numbers missing and have the child fill in the blanks with a pencil.',
        worksheetSlug: 'hundred-chart',
      },
      {
        description:
          'Write the numbers 1 to 100 in a notebook, ten to a row, so the written page mirrors the board. Spread this over several days.',
      },
      {
        description:
          'Number hunt on paper: write a decade (for example 41–50) with two numbers swapped, and have the child find and correct the swap in pencil.',
      },
    ],
  },
  {
    slug: 'hundred-board-skip-counting',
    name: 'Skip Counting on the Hundred Board',
    strand: 'linear-counting',
    sequence: 6,
    ages: [5, 7],
    grades: 'K–1',
    overview:
      'Using a completed hundred board, the child counts by twos, fives, tens — eventually by every number from 2 to 10 — and marks each number they land on. The marked squares form striking visual patterns, planting the seeds of the multiplication tables.',
    materialsNeeded: [
      'A completed hundred board or a printed hundred chart',
      'About 50 small markers: glass gems, buttons, dried beans, or pennies',
      'A crayon or colored pencil, if working on a printed chart instead of a board',
      'Paper and pencil for recording the numbers counted',
    ],
    virtualMaterials: ['hundred-board'],
    prerequisites: ['hundred-board-intro'],
    directAims: [
      'To count fluently by 2s, 5s, 10s, and eventually every number from 2 to 10',
      'To see each skip-count as a pattern of positions on the board, not just a chant',
    ],
    indirectAims: [
      'Direct preparation for the multiplication tables and the bead chains',
      'Early experience of multiples, which later becomes factors and divisibility',
      'Pattern recognition: columns for 2, 5, and 10; diagonals for 9 and 11',
    ],
    presentation: [
      {
        text: 'Sit with the child in front of the completed board with a bowl of markers. Start with counting by 10 — the easiest and most striking pattern.',
        say: 'We already know how to count every number. Today we will count and skip.',
      },
      {
        text: 'Count ten squares aloud together, tapping each one, and place a marker on the 10.',
        say: 'One, two, three, four, five, six, seven, eight, nine — ten! We mark where we land.',
      },
      {
        text: 'Count ten more from 11, and mark 20. Continue until 100 is marked. Then step back and look.',
        say: 'Ten, twenty, thirty… look, they all wait in one line at the edge.',
      },
      {
        text: 'Read the marked numbers together from top to bottom, pointing at each. This chant — ten, twenty, thirty — is the skip count.',
      },
      {
        text: 'Another day, repeat with 5, then with 2. Let the child predict where the next marker will land before counting to confirm it.',
        say: 'Where do you think the next one will be? Count and see if you were right.',
      },
      {
        text: 'To check the work, count the plain squares between two markers — there should always be the same number in every gap. Recounting, not the adult, decides what is right.',
      },
    ],
    pointsOfInterest: [
      'The patterns themselves: full columns for 10 and 5, stripes for 2, a diagonal for 9',
      'Predicting where the next marker lands and confirming it by counting',
      'Numbers that collect many markers across different days — 20, 30, 60 keep getting chosen',
      'Chanting the marked numbers rhythmically like a song',
    ],
    controlOfError: [
      'The gap between markers: every gap must hold the same count of unmarked squares, so a mistake shows as an uneven gap',
      'The broken pattern — a marker off the column or diagonal is visible at a glance',
      'In the virtual board, the Check button marks any missed multiple and any wrongly tapped square exactly',
    ],
    vocabulary: ['skip counting', 'counting by twos (fives, tens…)', 'multiple', 'pattern', 'diagonal'],
    variations: [
      'Say the in-between numbers in a whisper and the landing number in a strong voice before marking it',
      'Skip count starting from a marker in the middle of the board and continue to 100',
      'Use two colors of markers for two different counts (2s and 5s) and find the numbers wearing both',
    ],
    extensions: [
      'Record each skip count in a notebook as a number line: 4, 8, 12, 16 …',
      'Count backward down the marked squares: 100, 90, 80 …',
      'Ask which numbers between 1 and 20 never get a marker for 2s — the child rediscovers the odd numbers',
    ],
    whatComesNext:
      'The bead chains take up these same skip counts next, in Bead Chains and Skip Counting: the child counts physical chains of bead bars and labels every multiple with an arrow, walking the path that leads straight to the multiplication tables in the memorization work.',
    followUpWork: [
      {
        description:
          'Print skip-counting practice sheets where the child fills in missing numbers in sequences like 5, 10, __, 20, __.',
        worksheetSlug: 'skip-counting',
      },
      {
        description:
          'Print a blank hundred chart and have the child color every multiple of one number with a crayon, making a pattern poster for the wall.',
        worksheetSlug: 'hundred-chart',
      },
      {
        description:
          'Write one skip count per day from memory in a notebook — twos on Monday, fives on Tuesday — then check it against the board by recounting.',
      },
    ],
  },
]
