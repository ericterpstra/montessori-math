import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'addition-strip-board',
    name: 'The Addition Strip Board',
    strand: 'memorization',
    sequence: 2,
    ages: [5, 7],
    grades: 'K–1',
    overview:
      'The addition strip board lets a child work every addition fact with addends 1 through 9, laying a blue strip and a red strip end-to-end and reading the sum from the numbers across the top. After the snake game has made adding small numbers familiar, this board gives fast, tidy repetition — the road to knowing the facts by heart.',
    materialsNeeded: [
      'An addition strip board: a board 18 squares wide with the numbers 1–18 across the top and a red line drawn after the 10',
      'Nine blue strips, 1–9 squares long, each numbered at its right end',
      'Nine red strips, 1–9 squares long, divided into unit squares and numbered at the right end',
      'Household substitute: rule an 18-column grid on poster board or large graph paper, number 1–18 across the top with a heavy red line after the 10, and cut numbered strips from blue and red construction paper (1–9 squares long, matched to your grid)',
      'A pencil and small slips of paper for writing the equations',
    ],
    virtualMaterials: ['addition-strip-board'],
    prerequisites: ['snake-game'],
    directAims: [
      'To practice all the addition combinations with addends 1 through 9',
      'To move the child toward memorizing the addition facts up to 9 + 9 = 18',
      'To show addition as lengths joined end-to-end, so the sum can be seen and counted',
    ],
    indirectAims: [
      'Discovering that the order of the addends does not change the sum (3 + 5 and 5 + 3 land on the same number)',
      'Becoming comfortable with sums that cross ten, marked by the red line on the board',
      'Preparation for the subtraction strip board, which uses the same layout in reverse',
    ],
    presentation: [
      {
        text: 'Sit beside your child with the board in front of you. Run a finger along the numbers across the top, reading a few aloud, and pause at the red line after the 10.',
        say: 'These numbers go from 1 all the way to 18. Here after the 10 there is a red line — the numbers past it are bigger than ten.',
      },
      {
        text: 'Show the two sets of strips. Lay out the blue strips in a stair from 1 to 9, then the red strips in their own stair. Point out the number printed at the end of each strip, and the little squares dividing the red strips.',
        say: 'The blue strips are for the first number. The red strips are for the second number — see how they are cut into little squares you can count.',
      },
      {
        text: 'Choose a problem, for example 4 + 3. Take the blue 4 strip and lay it on the top row of the board, starting at the very left edge under the 1.',
        say: 'Four…',
      },
      {
        text: 'Take the red 3 strip and lay it end-to-end, right against the blue strip so there is no gap.',
        say: '…plus three.',
      },
      {
        text: 'Slide a finger to the end of the red strip and up to the number above it.',
        say: 'The red strip ends under the 7. Four plus three equals seven.',
      },
      {
        text: 'Have your child write 4 + 3 = 7 on a slip of paper, then take the strips off and hand your child a new problem — or let them choose their own. Give only as much help as they need to lay the strips snugly and read the answer.',
        say: 'Now you choose two strips and tell me what they make.',
      },
      {
        text: 'When the child is confident, show a sum that crosses the red line, such as 8 + 6, and let them notice the answer lands past 10.',
        say: 'Look — eight plus six carries us past the red line. Fourteen.',
      },
    ],
    pointsOfInterest: [
      'The red line after 10 — children love watching a sum "cross the line" into the teens',
      'The red strips are divided into unit squares, so a doubtful answer can always be counted square by square',
      'Laying the strips snugly end-to-end so there is no gap',
      'Building the strips into a stair before starting, just to see the lengths grow',
    ],
    controlOfError: [
      'The red strip ends exactly under the answer — counting its squares from the end of the blue strip confirms the sum',
      'The strips have their lengths printed on them, so the child can check the right strips were taken',
      'The board is only 18 columns wide: the largest fact, 9 + 9, exactly fills it, and every correct pair of strips fits',
      'In the "ways to make a number" work, the written list itself shows whether a combination is missing or repeated',
    ],
    vocabulary: ['plus', 'equals', 'sum', 'combination', 'double', 'teen numbers'],
    variations: [
      'Do all the doubles first (1 + 1, 2 + 2, … 9 + 9) — they make a pleasing diagonal pattern of answers',
      'Work through one table at a time: all the +1 facts, then all the +2 facts, writing each equation',
      'Say the problem aloud before laying the strips, then again after reading the answer',
    ],
    extensions: [
      'Ways to make a number: choose a number such as 11 and find every blue-and-red pair that reaches it, recording each as an equation — then check the list is complete',
      'Swap the strips of a fact (5 + 3, then 3 + 5) and talk about why the answer stays the same',
      'Cover the numbers across the top with a strip of paper and have the child name the sum before uncovering it to check',
    ],
    whatComesNext:
      'When your child can lay any fact quickly and is starting to answer some without the strips, move on to the Subtraction Strip Board, which uses the same 1–18 layout to take amounts away. Later, the Multiplication Bead Board carries the same idea of building facts by hand into the multiplication tables.',
    followUpWork: [
      {
        description:
          'Print a page of addition facts with sums up to 18. Let your child answer in pencil, building any fact they are unsure of on the strip board before writing it.',
        worksheetSlug: 'math-facts',
      },
      {
        description:
          'Pick a number of the day (say 9). On paper, your child writes every way to make it as an equation — 1 + 8, 2 + 7, and so on — then checks each one on the board and counts whether the list is complete.',
      },
      {
        description:
          'Make a little book of doubles: one page per fact from 1 + 1 to 9 + 9, written in pencil with a small drawing of the two strips colored blue and red.',
      },
    ],
  },
]
