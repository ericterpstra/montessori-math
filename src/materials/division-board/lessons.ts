import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'unit-division-board',
    name: 'The Unit Division Board',
    strand: 'memorization',
    sequence: 5,
    ages: [6, 9],
    grades: '1–3',
    overview:
      'Division becomes a game of sharing fairly: your child deals a pile of green beads out to little skittle "people" one round at a time, then reads the answer straight off the board. Repeated over weeks, this is how the division facts up to 81 ÷ 9 are discovered and gradually memorized.',
    materialsNeeded: [
      'Unit division board — or draw a 9×9 grid of dots on paper with 9 spots marked along the top edge, numbered 1–9 across the top and 1–9 down the left side',
      '81 small green beads (dried beans, buttons, or cereal pieces work fine)',
      '9 green skittles — small game pawns, clothespins, or LEGO figures stand in well',
      'A small cup or dish to hold the bead supply',
      'Slips of paper with division problems written on them (e.g. 27 ÷ 4, 36 ÷ 6, 15 ÷ 2)',
      'Pencil and paper for recording answers',
    ],
    virtualMaterials: ['division-board'],
    prerequisites: ['multiplication-bead-board'],
    directAims: [
      'To experience division as equal sharing: dealing a quantity out fairly, one round at a time',
      'To practice and begin memorizing the division facts with dividends up to 81',
      'To understand the remainder as what is left when no more full rounds can be dealt',
    ],
    indirectAims: [
      'Preparation for long division with the stamp game and, later, racks and tubes',
      'Seeing division as the inverse of multiplication (the same board geometry as the multiplication bead board)',
      'Building the habit of checking an answer against the material itself',
    ],
    presentation: [
      {
        text: 'Sit beside your child with the board, the cup of beads, the skittles, and a problem slip. Show the board first: run a finger along the 9 slots across the top, then over the 81 holes below. Point out the small numerals printed 1–9 above the slots and 1–9 down the left side — they will read the answer from these later.',
        say: 'This is the division board. The skittles stand up here at the top, the beads go in the holes underneath them, and these little numbers help us read the board.',
      },
      {
        text: 'Read the problem slip together — say 27 ÷ 4 — and count 27 beads from the box into the cup. Have your child count them out loud with you.',
        say: 'Our problem is twenty-seven divided by four. Here are our twenty-seven beads.',
      },
      {
        text: 'Stand 4 skittles in the first 4 slots across the top.',
        say: 'The four means four sharers. Each skittle is one person who gets a fair share.',
      },
      {
        text: 'Deal one round: place one bead in the hole under each skittle, moving left to right. Then pause with your hand over the cup.',
        say: 'Everyone gets one bead. In division, everyone always gets the same — it has to be fair.',
      },
      {
        text: 'Invite your child to deal the next rounds the same way, always a complete row before starting the next. Watch that they go left to right, one bead per skittle.',
        say: 'Deal another round — one for you, one for you, one for you, one for you.',
      },
      {
        text: 'When only 3 beads are left in the cup, let your child try to deal again and discover there are not enough for everyone.',
        say: 'Can everyone get another bead? No — so we stop. Division stops when we can no longer share fairly.',
      },
      {
        text: 'Show your child that the board tells the answer two ways. Slide a finger along the last full row of beads to the numeral at its left edge — it reads 6. Then have them count the beads under one skittle: six again. Point out that every skittle has the same number.',
        say: 'The answer in division is what one person gets. Read the number beside the last full row — six. Count the beads under one skittle — six again. Twenty-seven divided by four is six.',
      },
      {
        text: 'Point to the 3 beads left in the cup.',
        say: 'Three beads are left over — not enough to give everyone another. We call that the remainder.',
      },
      {
        text: 'Record the whole equation on paper together, and read it aloud: 27 ÷ 4 = 6 r 3. Then clear the board and let your child work the next problem slip on their own.',
        say: 'Twenty-seven divided by four is six, remainder three.',
      },
    ],
    pointsOfInterest: [
      'Dealing the beads out like cards — the fairness of one-for-everyone is deeply satisfying to children',
      'Discovering the moment when the supply cannot finish a round and dealing must stop',
      'Every skittle always ends up with exactly the same number of beads',
      '81 ÷ 9 fills every hole on the board perfectly — children love to see it',
    ],
    controlOfError: [
      'If any skittle could still receive a bead in a full round, the child has stopped too soon — the leftover pile shows it',
      'The remainder must always be smaller than the number of skittles; if it is not, another round can be dealt',
      'Every skittle column has the same height of beads — an uneven board means a dealing mistake',
      'The numeral beside the last full row must match the count of beads under any one skittle — the board gives the quotient two ways',
      'Counting the dealt beads plus the leftovers must give back the starting number',
    ],
    vocabulary: ['dividend', 'divisor', 'quotient', 'remainder', 'share', 'deal', 'fair'],
    variations: [
      'Start with problems that come out evenly (no remainder), such as 12 ÷ 3 or 20 ÷ 5, before introducing remainders',
      'Give the same dividend with different divisors — 12 ÷ 2, 12 ÷ 3, 12 ÷ 4, 12 ÷ 6 — and compare the answers',
      'Let your child write their own problem slips for a sibling or for you to solve',
    ],
    extensions: [
      'Make a division booklet: one page per divisor, with your child recording every fact they have proved on the board',
      'Hunt for all the problems with remainder zero — these are the essential division facts to memorize',
      'Check each answer with multiplication: for 27 ÷ 4 = 6 r 3, build 6 × 4 on the multiplication bead board and add the 3 back to reach 27',
    ],
    whatComesNext:
      'The unit division board completes the memorization boards. When your child deals confidently and knows many facts by heart, move into the Passage to Abstraction strand: the Stamp Game lessons carry all four operations — including division with larger numbers — onto place-value tiles, and much later Racks and Tubes presents true long division.',
    followUpWork: [
      {
        description:
          'Print a page of division facts and have your child solve them in pencil at the table, using the board only to check answers they are unsure of.',
        worksheetSlug: 'math-facts',
      },
      {
        description:
          'Fact-family cards: on an index card, your child writes a fact family in pencil (3 × 4 = 12, 4 × 3 = 12, 12 ÷ 3 = 4, 12 ÷ 4 = 3) — one card per family, kept in an envelope for review.',
      },
      {
        description:
          'Division stories: your child writes and illustrates a short sharing story on paper ("I had 27 strawberries and 4 friends…"), then writes the matching equation with its remainder underneath.',
      },
    ],
  },
]
