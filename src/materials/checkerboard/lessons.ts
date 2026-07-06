import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'checkerboard-intro',
    name: 'Introduction to the Checkerboard',
    strand: 'abstraction',
    sequence: 9,
    ages: [7, 9],
    grades: '2–4',
    overview:
      'The checkerboard is a mat of place-value colored squares that turns long multiplication into a geography lesson: where a bead bar sits tells you what it is worth. This first presentation is only about reading the board — no multiplying yet.',
    materialsNeeded: [
      'A checkerboard mat: 4 rows × 9 columns of squares colored green, blue, red in the repeating place-value pattern (draw one on poster board with markers, or use the virtual board as your reference)',
      'Colored bead bars 1–9 (pony beads threaded on pipe cleaners work well: red 1, green 2, pink 3, yellow 4, light blue 5, lavender 6, white 7, brown 8, dark blue 9)',
      'Two sets of small digit cards 0–9: one set in regular ink, one set written in gray',
      'Pencil and paper for the child to record what they discover',
    ],
    virtualMaterials: ['checkerboard'],
    prerequisites: ['multiplication-bead-board', 'large-bead-frame'],
    directAims: [
      'Learn the value of every square on the checkerboard: 1 through 100,000,000 along the bottom, growing tenfold with each step left or up',
      'Understand that a bead bar takes its value from the square it sits on — a 3-bar on the 10 square is 30',
      'Discover the diagonals: squares that touch corner-to-corner along the down-left/up-right diagonal all have the same value',
    ],
    indirectAims: [
      'Preparation for multiplying multi-digit numbers on the checkerboard',
      'A deeper feel for place value and powers of ten beyond the thousands',
      'Preparation for the written long-multiplication algorithm, where digit position carries value',
    ],
    presentation: [
      {
        text: 'Sit beside your child with the board in front of you. Point to the bottom-right square and trace along the bottom row, right to left, reading each value.',
        say: 'This square is worth one. This one is worth ten, this one one hundred, one thousand… all the way to one hundred million.',
      },
      {
        text: 'Point out the colors: green for units, blue for tens, red for hundreds, then green, blue, red again. Your child has seen these colors since the golden beads.',
        say: 'The colors are old friends — green, blue, red, just like the stamp game and the bead frame.',
      },
      {
        text: 'Now move up the right-hand edge and read the row values: 1, 10, 100, 1,000. Show that the square above the 1 square is worth 10, and the square above the 10 square is worth 100.',
        say: 'Every time we go up a row, the squares are worth ten times more.',
      },
      {
        text: 'Place a single bead bar — say a 3-bar — on the 1 square and ask what it is worth. Move the same bar to the 10 square, then the 100 square, asking each time.',
        say: 'The bar did not change. The square changed. Three on the tens square is thirty.',
      },
      {
        text: 'Point to any square not on the bottom row, for example the 10 square in the second row. Ask your child to find another square worth 10. Trace the diagonal between them with a finger.',
        say: 'Squares that touch at the corners, stepping down toward the bottom-left, are worth the same. We call that a diagonal.',
      },
      {
        text: 'Slide a bar diagonally down-left along its diagonal to the bottom row and ask whether its value changed. Let your child test this with several bars on several diagonals.',
        say: 'Sliding along the diagonal never changes what the beads are worth.',
      },
      {
        text: 'On the virtual board, tap "New problem" just to see the digit cards appear along the bottom and right edges, and name them: the number along the bottom is the multiplicand, the gray number up the side is the multiplier. Then put the board away — the multiplying comes next time.',
        say: 'Next time we will use the whole board to multiply big numbers.',
      },
    ],
    pointsOfInterest: [
      'The same bar is worth 3, then 30, then 300 as it moves — the child usually wants to march a bar all the way to 300,000,000',
      'Finding every square on a diagonal and proving they match by reading the edge labels',
      'The colors repeating green-blue-red exactly as they do in the stamp game and bead frames',
      'Reading the enormous values on the top row — a square worth one hundred billion delights most children',
    ],
    controlOfError: [
      'The value printed along the bottom and right edges lets the child check any square: multiply the row value by the column value read below',
      'The repeating color pattern exposes a misread square — a square called "ten" must be blue',
      'On the virtual board, each square shows its value in the corner, so a wrong reading is self-correcting',
    ],
    vocabulary: ['checkerboard', 'square', 'diagonal', 'place value', 'multiplicand', 'multiplier', 'worth'],
    variations: [
      'Play "find the square": name a value (say 10,000) and let the child find every square worth that amount',
      'Reverse roles: the child places a bar and quizzes you on its value — give a wrong answer occasionally and let them correct you',
      'Cover an edge label with a scrap of paper and ask the child to work out the hidden value from its neighbors',
    ],
    extensions: [
      'Have the child draw their own miniature checkerboard on grid paper and color the squares in the correct pattern',
      'Write value riddles on paper: "I am a 4-bar sitting on the 1,000 square. What am I worth?"',
      'Explore the top row: read and write the giant values (1,000,000,000 and beyond) with commas',
    ],
    whatComesNext:
      'Once your child can name any square and slide bars along diagonals without changing their value, move on to Checkerboard Multiplication, where the board computes real products like 4,357 × 23.',
    followUpWork: [
      {
        description:
          'Ask your child to draw a 4 × 9 checkerboard on paper, color the squares green, blue, and red in the correct repeating pattern, and label each square with its value.',
      },
      {
        description:
          'Write ten "bar riddles" on paper for pencil work, such as "a 6-bar on the 100 square = ____" — the child writes each answer as a numeral with commas.',
      },
      {
        description:
          'Have the child list all the squares that share one diagonal and write a sentence explaining why sliding along a diagonal never changes a bar’s value.',
      },
    ],
  },
  {
    slug: 'checkerboard-multiplication',
    name: 'Checkerboard Multiplication',
    strand: 'abstraction',
    sequence: 10,
    ages: [8, 11],
    grades: '3–5',
    overview:
      'The checkerboard multiplies numbers into the millions: each crossing of a multiplicand digit and a multiplier digit gets its own bead bars, the bars slide down their diagonals, and the bottom row is combined and read as the product. It is long multiplication made visible, one partial product at a time.',
    materialsNeeded: [
      'The checkerboard mat and colored bead bars 1–9 from the introduction (pony beads on pipe cleaners work fine)',
      'Two sets of small digit cards 0–9: one regular for the multiplicand, one gray for the multiplier',
      'Pencil and squared paper so the child can record the problem and the answer',
      'A basket or dish to hold the bead bars not in use',
    ],
    virtualMaterials: ['checkerboard'],
    prerequisites: ['checkerboard-intro'],
    directAims: [
      'Multiply a multi-digit number by a 1- to 4-digit multiplier using partial products',
      'Experience that each digit-times-digit product lands on the square whose value matches its place',
      'Carry out exchanges above 9 on a square by carrying one square to the left, then read the final product',
    ],
    indirectAims: [
      'Preparation for the written long-multiplication algorithm and estimation of large products',
      'Reinforcement of the multiplication facts in constant, purposeful use',
      'Preparation for the racks and tubes, where long division asks for the same place-value discipline',
    ],
    presentation: [
      {
        text: 'Begin with a single-digit multiplier so the whole problem lives on the bottom row: 4,357 × 3. Lay the multiplicand cards 4, 3, 5, 7 along the bottom edge, one under each column, and the single gray multiplier card 3 beside the bottom row on the right edge. (On the virtual board, type 4357 and 3 into the multiplicand and multiplier boxes and press Set.)',
        say: 'We are going to multiply four thousand three hundred fifty-seven by three.',
      },
      {
        text: 'Point to the square where the 7 column meets the 3 row — the units square — and place three 7-bars on it. On the virtual board, the child taps that square and the bars appear.',
        say: 'Seven taken three times. Three bars of seven.',
      },
      {
        text: 'Continue across the bottom row: three 5-bars on the tens square, three 3-bars on the hundreds, three 4-bars on the thousands. Say what each crossing means as you go.',
        say: 'Now fifty times three — three bars of five on the tens square.',
      },
      {
        text: 'Combine the bottom row starting at the right. Count the beads on the units square: 21. Twenty-one is one unit and two tens, so a 1-bar stays and 2 carries to the tens square. On the virtual board, tap the square and watch the exchange.',
        say: 'Twenty-one: the one stays here, the twenty moves one square to the left.',
      },
      {
        text: 'Work left square by square, combining and carrying, until every square holds a single bar or is empty. Read the bottom row right to left — 1, 3, 0, 7, 1 — and write the product on paper with commas: 13,071.',
        say: 'Four thousand three hundred fifty-seven times three is thirteen thousand, seventy-one.',
      },
      {
        text: 'Now the same multiplicand with a two-digit multiplier: 4,357 × 23 (the starting problem on the virtual board). Keep the multiplicand cards in place; set the gray 3 beside the bottom row and the gray 2 beside the tens row.',
        say: 'This time we multiply by twenty-three — three units and two tens.',
      },
      {
        text: 'Fill the units row exactly as before: three 7-bars, three 5-bars, three 3-bars, three 4-bars. Then move to the tens row for the multiplier digit 2: at each crossing place two bars of the multiplicand digit — two 7-bars, two 5-bars, two 3-bars, two 4-bars.',
        say: 'This whole row is "times twenty," so everything lands one place higher.',
      },
      {
        text: 'When every crossing is filled, slide the bars in the tens row down-left along their diagonals to the bottom row. Remind your child of the introduction: diagonal squares are worth the same.',
        say: 'Slide, don’t lift — along the diagonal nothing changes its value.',
      },
      {
        text: 'Combine the bottom row from the right just as before, carrying one square to the left whenever a square goes past nine. Then read the bottom row right to left — 1, 1, 2, 0, 0, 1 — and write the product on paper with commas: 100,211. Let the child read it aloud.',
        say: 'Four thousand three hundred fifty-seven times twenty-three is one hundred thousand, two hundred eleven.',
      },
      {
        text: 'Give the child a new problem — another 4-digit × 1-digit if they want the easier round, then 4-digit × 2-digit — and let them run the whole cycle themselves: place, slide, combine, read, and record the result on paper.',
        say: 'Your turn: place the bars, slide the diagonals, make the exchanges, and read me the answer.',
      },
    ],
    pointsOfInterest: [
      'Watching a big product assemble itself out of small, known facts like 7 × 3',
      'The satisfying diagonal slide — a whole row of beads glides down and the total does not budge',
      'Squares piling up past 9 and the carry moving left, just like the golden bead exchanges years earlier',
      'Reading a six-figure answer off the board and checking it against pencil-and-paper work',
    ],
    controlOfError: [
      'Every square must end with nine or fewer beads — a crowded square shows there is still exchanging to do',
      'Sliding along diagonals cannot change the total, so an answer that disagrees with a re-count means a bar was lifted off its diagonal',
      'The child can verify the product by re-running the same problem or by multiplying on paper; the guided virtual board only places the correct bars for each crossing, so a skipped square is visible as an empty crossing',
    ],
    vocabulary: ['multiplicand', 'multiplier', 'partial product', 'product', 'diagonal', 'carry', 'exchange'],
    variations: [
      'Include a zero in the multiplicand (for example 4,057 × 23) and notice the empty column',
      'Let the child slide one row at a time and re-count the board total after each slide to prove nothing changed',
      'Once two-digit multipliers feel easy, try a 3-digit multiplier — the hundreds row adds a second diagonal slide',
    ],
    extensions: [
      'After the board answer is read, write the same problem vertically on paper and match each written partial product to a row of the board',
      'Try a 4-digit × 4-digit problem and read a product in the tens of millions',
      'Estimate first: round 4,357 × 23 to 4,000 × 20 on paper, then compare the estimate with the board’s exact answer',
    ],
    whatComesNext:
      'When the checkerboard feels easy and your child starts writing partial products on paper without the beads, the passage to abstraction is nearly complete for multiplication. The next material in this strand is Racks & Tubes, which does for long division what the checkerboard does for long multiplication.',
    followUpWork: [
      {
        description:
          'Print a long-multiplication worksheet and let your child solve a few problems on the board, then the same problems with pencil only, comparing answers.',
        worksheetSlug: 'long-multiplication',
      },
      {
        description:
          'Have the child write one checkerboard problem vertically on squared paper, recording each row of the board as a written partial product before adding them up.',
      },
      {
        description:
          'Ask the child to make up a "story problem" for a large multiplication (boxes of beads, seats in stadiums), solve it on the board, and write the full sentence answer on paper.',
      },
    ],
  },
]
