import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'racks-and-tubes',
    name: 'Long Division with Racks & Tubes',
    strand: 'abstraction',
    sequence: 11,
    ages: [8, 11],
    grades: '3–5',
    overview:
      'The crowning division material: tubes of colored beads carry your child through true long division — dividends into the thousands, divisors of one or two digits — while the written record grows on paper beside the beads. Every line of the paper algorithm is something the hands just did, so when the beads are finally put away, the written method makes complete sense.',
    materialsNeeded: [
      'Racks and tubes set — or four labeled cups of small counters in place colors: green for units, blue for tens, red for hundreds, green for thousands (about 40 of each; sorted beans, buttons, or beads work well)',
      '9 green skittles and 9 blue skittles — clothespins or game pawns marked with green and blue stickers stand in fine',
      'A division board with 9 columns and a spot at the top of each for a skittle — a sheet of paper ruled into 9 columns works (make two if you will try two-digit divisors)',
      'Small cups or dishes for exchanging beads at the "racks"',
      'Squared paper and a sharp pencil for the written record',
      'Problem slips, e.g. 9,764 ÷ 4; 3,459 ÷ 3; 5,715 ÷ 5; later 7,644 ÷ 84',
    ],
    virtualMaterials: ['racks-and-tubes'],
    prerequisites: ['unit-division-board', 'stamp-game-division'],
    directAims: [
      'To perform long division with dividends up to four digits and divisors of one or two digits',
      'To connect every move of the beads to a line of the written long-division algorithm',
      'To understand why the algorithm works: each quotient digit is the number of fair rounds that place can give every skittle',
    ],
    indirectAims: [
      'Full passage to abstraction — after enough runs, the written record alone carries the child and the beads are no longer needed',
      'Reinforcing exchange (regrouping) downward through every place of the decimal system',
      'Preparation for divisibility work, fractions as division, and decimal quotients in later years',
    ],
    presentation: [
      {
        text: 'Sit beside your child with the cups of beads, the skittles, the board, and paper. Write the problem 9,764 ÷ 4 at the top of the squared paper, then lay out the dividend together: count 9 beads into the thousands cup, 7 into the hundreds, 6 into the tens, 4 into the units.',
        say: 'Nine thousand, seven hundred sixty-four. There it is — the whole number, laid out in beads.',
      },
      {
        text: 'Stand 4 green skittles across the top of the board.',
        say: 'We are dividing by four, so four skittles — four equal shares. Whatever one skittle receives, that is our answer.',
      },
      {
        text: 'Begin with the largest place. Bring the 9 thousand beads to the board and deal one bead under each skittle, then another round, until fewer than 4 beads remain in your hand.',
        say: 'In division we always start with the biggest. One for you, one for you… everyone must get the same.',
      },
      {
        text: 'Count the beads under one skittle — two — and write 2 in the thousands place of the quotient on the paper. Point out that 2 fours are 8, so write 8 under the 9 and subtract.',
        say: 'Each skittle got two thousands. Two — I write it above the thousands. Two fours are eight; nine take away eight leaves one.',
      },
      {
        text: 'Take the 1 leftover thousand bead to the racks and exchange it for 10 hundred beads. Drop them into the hundreds cup so it now holds 17. On paper, show how this is the "bring down": the leftover 1 stands beside the 7 to make 17.',
        say: 'One thousand cannot be shared among four — so we trade it for ten hundreds. Now we have seventeen hundreds.',
      },
      {
        text: 'Bring all 17 hundred beads to the board and let your child deal the rounds: four full rounds, one bead left over. Write 4 in the hundreds place, subtract 16 from 17 on the paper.',
        say: 'Four rounds — each skittle has four hundreds. Seventeen take away sixteen leaves one.',
      },
      {
        text: 'Exchange the leftover hundred for 10 tens (now 16 tens), bring them to the board, and deal: four full rounds exactly. Write 4 in the tens place.',
        say: 'Sixteen tens, four rounds, nothing left. The tens come out even.',
      },
      {
        text: 'Bring the 4 unit beads and deal one final round. Write 1 in the units place, then read the whole answer together off the paper and off the board.',
        say: 'Nine thousand seven hundred sixty-four divided by four is two thousand, four hundred forty-one.',
      },
      {
        text: 'Check the work: have your child multiply 2,441 × 4 in pencil (or with materials) and watch it land back on 9,764. Then clear everything and let them work the next slip while you only keep them company.',
        say: 'If we give every skittle its share back, we must return to the number we started with. That is how division checks itself.',
      },
    ],
    pointsOfInterest: [
      'Trading one leftover thousand bead for ten hundred beads at the racks — the moment "bringing down the next digit" suddenly makes sense',
      'Whatever one skittle receives is the answer: the quotient is literally one person’s fair share',
      'The written record grows line by line, matching the beads move for move',
      'With a two-digit divisor, the blue skittles receive beads worth ten times the green ones — and one round still deals out exactly the divisor',
      'The remainder at the very end is exactly the beads no full round could share',
    ],
    controlOfError: [
      'If a full round can still be dealt, the child has stopped too soon — the beads in front of the skittles show it',
      'Every skittle column must hold the same number of beads; an uneven board reveals a dealing slip',
      'The remainder must always be smaller than the divisor — if it is not, another round was possible',
      'The final check never lies: quotient × divisor + remainder must land exactly back on the dividend',
    ],
    vocabulary: ['dividend', 'divisor', 'quotient', 'remainder', 'exchange', 'long division', 'place value', 'round'],
    variations: [
      'Start with problems that come out even (5,715 ÷ 5, 9,764 ÷ 4) before introducing remainders (9,765 ÷ 4)',
      'Two-digit divisors: stand blue skittles on a second board to the left. For 7,644 ÷ 84, eight blue skittles each receive a bead of the next place up while four green skittles receive the current place — one round still shares out exactly 84',
      'Problems with a zero in the quotient (4,236 ÷ 7): a place that cannot deal a single round records 0 and exchanges everything down',
      'Let your child build a problem for you to solve while they keep the written record and check your work',
    ],
    extensions: [
      'Estimate first: before dealing a place, guess its digit out loud — then let the beads confirm or quietly correct it',
      'After several confident runs, work the same slip on paper first and use the beads only to prove the answer',
      'Hunt for remainders that repeat: divide 100, 200, 300 … by 7 and watch what the remainders do',
    ],
    whatComesNext:
      'Racks and tubes is the last material of the Passage to Abstraction strand: when your child can predict every move of the beads, long division lives comfortably on paper and the tubes go back on the shelf. From here the path opens into the Fractions strand with the Introduction to Fractions lesson, and for older children the Decimal Fractions strand extends place value past the unit with the Introduction to the Decimal Board.',
    followUpWork: [
      {
        description:
          'Print a page of long-division problems and have your child work them in pencil at the table, returning to the beads (real or virtual) only for a problem that resists.',
        worksheetSlug: 'long-division',
      },
      {
        description:
          'One problem a day in a division notebook: your child copies a long-division problem, works it in pencil showing every subtraction and bring-down, and rules a box around the answer.',
      },
      {
        description:
          'Checking by multiplication: for each finished problem, your child multiplies quotient × divisor, adds the remainder, and writes the little proof underneath — it must land back on the dividend.',
      },
      {
        description:
          'Real-life sharing problems on paper: "1,248 stickers shared among 6 classrooms" — your child writes the story, the equation, and the answer in a full sentence.',
      },
    ],
  },
]
