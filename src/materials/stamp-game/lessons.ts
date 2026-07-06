import type { Lesson } from '../../lessons/types'

/**
 * Album lessons for the stamp game — the child's first step from the golden
 * beads toward abstraction. Written for an untrained parent at a kitchen table.
 */
export const lessons: Lesson[] = [
  {
    slug: 'stamp-game-intro',
    name: 'Introduction to the Stamp Game',
    strand: 'abstraction',
    sequence: 1,
    ages: [5, 7],
    grades: 'K–1',
    overview:
      'The stamp game carries everything your child knows from the golden beads onto identical little tiles that differ only in color and printed number. It is the first deliberate step away from bulky quantity toward symbols — a tile the size of a fingernail now stands for a whole thousand.',
    materialsNeeded: [
      'A stamp game box — or make your own: cut about 40 one-inch cardstock squares in each of green, blue, and red; write 1 on the greens, 10 on the blues, 100 on the reds, and 1000 on a second set of greens',
      'Your golden bead material for the opening comparison: one unit bead, one ten-bar, one hundred-square, one thousand-cube (the virtual golden beads work too)',
      'Pencil and paper for writing numbers',
    ],
    virtualMaterials: ['stamp-game', 'golden-beads'],
    prerequisites: ['golden-beads-formation', 'number-cards-birds-eye'],
    directAims: [
      'To carry the child’s place-value knowledge from quantities (beads) onto symbolic tiles',
      'To build, read, and write four-digit numbers using the stamps',
      'To exchange ten of one stamp for one of the next size up — and back again',
    ],
    indirectAims: [
      'Preparation for doing all four operations with the stamps, and later on paper',
      'Growing independence from bulky material — trusting that a symbol holds its value',
    ],
    presentation: [
      {
        text: 'Set out one of each golden bead piece in a row: a unit bead, a ten-bar, a hundred-square, a thousand-cube. Let your child name each one.',
        say: 'You know all of these. Show me the hundred. Show me the thousand.',
      },
      {
        text: 'Open the stamp box. Place one green 1 stamp directly beside the unit bead.',
        say: 'This is a stamp. It says 1 — this little tile is worth one unit, the same as this bead.',
      },
      {
        text: 'Match the blue 10 stamp to the ten-bar, the red 100 stamp to the hundred-square, and the green 1000 stamp to the thousand-cube, pausing at each.',
        say: 'The stamps are all the same size. Only the color and the number tell you what each one is worth.',
      },
      {
        text: 'Put the beads away. From now on the stamps do all the work.',
      },
      {
        text: 'Show how stamps are laid out on the table: in tidy vertical columns, thousands on the left, units on the right, each kind in its own straight line.',
      },
      {
        text: 'Build a number such as 2,536 — two green 1000s, five red 100s, three blue 10s, six green 1s — and ask your child to read it.',
      },
      {
        text: 'Write a four-digit number on paper and invite your child to build it with stamps. Then trade roles: they write, you build (make an occasional mistake for them to catch).',
      },
      {
        text: 'Show exchanging: count out ten unit stamps, then trade them at the box for one 10 stamp. Trade it back the other way too.',
        say: 'Ten of these is worth exactly one of these. Watch — nothing is lost when we trade.',
      },
    ],
    pointsOfInterest: [
      'The tiles are all the same size, yet one is worth a thousand times another — only the color and the printed number say so',
      'Trading ten stamps for one and getting to decide which way to trade',
      'The 1000 stamp is green like the 1 — the color pattern starts over for each family',
      'Building a number with an empty column, like 4,053, and leaving the hundreds space truly empty',
    ],
    controlOfError: [
      'Matching each stamp to its golden bead quantity at the start shows exactly what each tile is worth',
      'The printed value on every stamp lets the child re-check any column by counting',
      'On the virtual material, each column shows its count, and ten-for-one trades are only possible when ten are really there',
    ],
    vocabulary: ['stamp', 'unit', 'ten', 'hundred', 'thousand', 'exchange (trade)', 'column'],
    variations: [
      'Dictate numbers aloud instead of writing them, and have your child build what they hear',
      'Build numbers with a zero in the middle (4,053, 7,209) and talk about what the empty column means',
    ],
    extensions: [
      'Play bank: ask for 2,300 paid in the fewest possible stamps, then in all 10s and 100s',
      'Ask how many tens live inside 340, and prove it by trading',
    ],
    whatComesNext:
      'Once your child can build and read four-digit numbers with stamps and trade confidently in both directions, move on to Stamp Game Addition — the first operation done entirely in symbols.',
    followUpWork: [
      {
        description:
          'Write six four-digit numbers on paper (include at least one with a zero inside). Your child builds each with stamps, reads it aloud, then puts the stamps away.',
      },
      {
        description:
          'Your child writes a secret four-digit number, you build it with stamps, and they check your work against what they wrote — being the checker is powerful practice.',
      },
    ],
  },
  {
    slug: 'stamp-game-addition',
    name: 'Stamp Game Addition',
    strand: 'abstraction',
    sequence: 2,
    ages: [5, 8],
    grades: 'K–2',
    overview:
      'Adding with the stamp game tells the same story as golden bead addition — build both numbers, slide them together, trade tens — but now in symbols. Start with sums that need no trading, then move to the exciting ones that do.',
    materialsNeeded: [
      'The stamp game (or your homemade cardstock stamps)',
      'Small slips of paper with addition problems written vertically, one per slip',
      'Pencil and paper for recording answers',
    ],
    virtualMaterials: ['stamp-game'],
    prerequisites: ['stamp-game-intro', 'golden-beads-addition'],
    directAims: [
      'To add four-digit numbers with symbolic material, first without exchanging, then with',
      'To connect the traded stamp to the little carried 1 in written addition',
    ],
    indirectAims: [
      'Preparation for adding entirely on paper',
      'Reinforcing that a column can never show ten or more — ten of a kind always becomes one of the next',
    ],
    presentation: [
      {
        text: 'Write a no-trading problem such as 1,325 + 2,143 vertically on a slip. Read it together.',
        say: 'We are going to put these two numbers together.',
      },
      {
        text: 'Your child builds 1,325 in stamp columns near the top of the table.',
      },
      {
        text: 'Below it, with a clear gap, they build 2,143 — two separate numbers, visible at once.',
      },
      {
        text: 'Slide each column together, always starting with the units.',
        say: 'Now they become one number. Units first.',
      },
      {
        text: 'Count each column and write the digit under the problem: 8 units, 6 tens, 4 hundreds, 3 thousands. Read the sum: 3,468.',
      },
      {
        text: 'Another day, present a dynamic problem: 1,568 + 1,679. Build both, slide together, and count the units — seventeen!',
        say: 'Seventeen units — can one column say seventeen? No. Ten of them can become one ten.',
      },
      {
        text: 'Trade ten units for a 10 stamp and place it with the tens. Carry on up the columns, trading wherever a column reaches ten, until every column reads nine or less. Read the answer: 3,247.',
      },
      {
        text: 'Show the same problem worked on paper and point to the small carried 1s.',
        say: 'This little one on paper is the stamp we traded. It was never magic — you have done it with your hands.',
      },
    ],
    pointsOfInterest: [
      'Two numbers visibly becoming one when the rows slide together',
      'A column briefly holding seventeen stamps — clearly too many — and the trade that fixes it',
      'Discovering before combining which columns will need a trade',
    ],
    controlOfError: [
      'A finished column may never hold ten or more stamps — if it does, the work is not finished',
      'Recounting each column checks the written answer against the material',
      'On the virtual material, the Check button recounts every column with you, marking each ✓ or ✗',
    ],
    vocabulary: ['addend', 'sum', 'combine', 'exchange (carry)', 'column'],
    variations: [
      'Add three numbers at once — the columns get satisfyingly crowded before trading',
      'Dress problems in stories: two jars of pennies, two towns’ populations',
    ],
    extensions: [
      'Before sliding rows together, predict which columns will need a trade, then combine and see',
      'Circle the carried 1s on the written problem and match each to a trade made with the stamps',
    ],
    whatComesNext:
      'When trading up feels easy, Stamp Game Subtraction turns the trade around — breaking a ten into units in order to take away. Stamp Game Multiplication also builds directly on this lesson.',
    followUpWork: [
      {
        description:
          'Print a sheet of multi-digit addition problems. Your child solves each with the stamps and writes only the answer on the page.',
        worksheetSlug: 'multi-digit-ops',
      },
      {
        description:
          'Once confident, reverse it: solve a printed problem on paper first, then prove the answer with stamps.',
        worksheetSlug: 'multi-digit-ops',
      },
      {
        description:
          'Have your child write their own addition problems for you to solve with stamps — they check your work column by column.',
      },
    ],
  },
  {
    slug: 'stamp-game-subtraction',
    name: 'Stamp Game Subtraction',
    strand: 'abstraction',
    sequence: 3,
    ages: [6, 8],
    grades: '1–2',
    overview:
      'Subtraction with stamps means building only the starting number and taking stamps away — trading a bigger stamp down into ten smaller ones whenever a column runs short. This is where borrowing, even across a zero, becomes something the hands understand.',
    materialsNeeded: [
      'The stamp game (or homemade cardstock stamps)',
      'Slips of paper with subtraction problems written vertically',
      'Pencil and paper',
      'A small dish or tray for the stamps that are taken away',
    ],
    virtualMaterials: ['stamp-game'],
    prerequisites: ['stamp-game-addition', 'golden-beads-subtraction'],
    directAims: [
      'To subtract four-digit numbers with the stamps, exchanging down whenever a column runs short',
      'To handle borrowing across a zero — the double trade — concretely',
    ],
    indirectAims: [
      'Preparation for written subtraction with regrouping',
      'Understanding that exchanging changes how a number looks but never what it is worth',
    ],
    presentation: [
      {
        text: 'Write 4,053 − 1,278 vertically on a slip.',
        say: 'The top number is what we have. The bottom number is what we must give away. We only build what we have.',
      },
      {
        text: 'Your child builds 4,053 in stamps: four 1000s, no 100s, five 10s, three 1s. Point to the empty hundreds column together.',
      },
      {
        text: 'Start at the units: give away 8. There are only 3.',
        say: 'I need to take away eight units, but there are only three. Where can we get more units?',
      },
      {
        text: 'Trade one 10 stamp for ten 1 stamps. Now there are 13 units — take away 8, leaving 5. Put the taken stamps in the dish.',
      },
      {
        text: 'Move to the tens: take away 7, but only 4 remain — and the hundreds column is empty.',
        say: 'We need more tens, but there are no hundreds to trade. We must go all the way to the thousands.',
      },
      {
        text: 'Trade one 1000 for ten 100s, then one of those 100s for ten 10s. Now take away the 7 tens.',
      },
      {
        text: 'Finish: take 2 hundreds from the 9 remaining, then 1 thousand from the 3. Read what is left on the table.',
        say: 'What is left is the answer: two thousand, seven hundred seventy-five.',
      },
      {
        text: 'Show the same problem on paper with its crossed-out digits, matching every crossing-out to a trade your child just made.',
      },
    ],
    pointsOfInterest: [
      'You cannot take a stamp that is not there — the empty column forces the trade',
      'The double trade across the empty hundreds column: thousand to hundreds, hundred to tens',
      'The dish of taken-away stamps grows into exactly the bottom number',
    ],
    controlOfError: [
      'The material refuses an impossible take — there is simply nothing to pick up, which prompts the exchange',
      'The taken-away pile can be counted and must read the bottom number exactly',
      'On the virtual material, Check recounts both what remains and what was taken, column by column',
    ],
    vocabulary: [
      'minuend (the number you start with)',
      'subtrahend (the number you take away)',
      'difference',
      'borrow (exchange down)',
      'remainder of a column',
    ],
    variations: [
      'Start with static problems that need no trading (4,875 − 2,341) before dynamic ones',
      'Zero-trap problems like 3,004 − 1,236, where the trade must travel across two empty columns',
    ],
    extensions: [
      'Check a subtraction by adding the answer back: does 2,775 + 1,278 rebuild 4,053?',
      'Story problems about giving away, spending, or distances still to travel',
    ],
    whatComesNext:
      'Stamp Game Multiplication comes next — the same combining as addition, but with the same number built again and again. Together these prepare written column arithmetic.',
    followUpWork: [
      {
        description:
          'Print a sheet of multi-digit subtraction problems with regrouping. Your child solves each with stamps first and records the answers.',
        worksheetSlug: 'multi-digit-ops',
      },
      {
        description:
          'Write three zero-trap problems by hand (a zero in the top number, like 5,046 − 2,381). Your child solves them with stamps, then explains to you where the trades happened.',
      },
    ],
  },
  {
    slug: 'stamp-game-multiplication',
    name: 'Stamp Game Multiplication',
    strand: 'abstraction',
    sequence: 4,
    ages: [6, 8],
    grades: '1–2',
    overview:
      'With stamps, multiplying means building the very same number several times and sliding the rows together. The child discovers that multiplication is just addition in a hurry — the same addend over and over.',
    materialsNeeded: [
      'The stamp game (or homemade cardstock stamps)',
      'Slips of paper with problems like 1,234 × 3 (keep answers under 10,000)',
      'Pencil and paper',
    ],
    virtualMaterials: ['stamp-game'],
    prerequisites: ['stamp-game-addition', 'golden-beads-multiplication'],
    directAims: [
      'To multiply a multi-digit number by a single digit using repeated rows of stamps',
      'To see multiplication as repeated addition of the same number',
    ],
    indirectAims: [
      'Preparation for written multiplication and, later, the checkerboard',
      'Motivation for memorizing the multiplication facts — counting nine rows of stamps is slow!',
    ],
    presentation: [
      {
        text: 'Write 1,234 × 3 on a slip and read it together.',
        say: 'This says one thousand, two hundred thirty-four — taken three times.',
      },
      {
        text: 'Your child builds 1,234 in stamp columns. Then builds it again in a row below. Then a third time.',
      },
      {
        text: 'Pause and look at the three rows together.',
        say: 'Three rows, and every row is exactly the same. That is what multiplication means.',
      },
      {
        text: 'Slide the columns together starting from the units, exactly as in addition. The units column now holds twelve.',
      },
      {
        text: 'Trade ten units for a 10 stamp. The tens column reaches ten — trade again. Continue until every column reads nine or less.',
        say: 'Whenever a column reaches ten, we trade — just like in addition.',
      },
      {
        text: 'Read the product: 3,702. Write it under the problem.',
      },
      {
        text: 'On paper, write 1,234 + 1,234 + 1,234 next to 1,234 × 3 and work both. Same answer.',
        say: 'Multiplication is adding the same number again and again — the × just says it faster.',
      },
    ],
    pointsOfInterest: [
      'Rows that must match exactly — a wrong row jumps out at the eye',
      'How quickly the table fills when the number is taken 4 times',
      'The moment a trade in one column tips the next column over ten as well',
    ],
    controlOfError: [
      'The rows can be compared before combining — every row must look identical',
      'A finished column may never hold ten or more stamps',
      'On the virtual material, Check recounts every column of the combined result',
    ],
    vocabulary: ['multiplicand (the number taken)', 'multiplier (how many times)', 'product', 'times', 'row'],
    variations: [
      'Multiply the same number by 2, then 3, then 4 on successive days and compare the growing products',
      'Let your child choose the multiplicand and roll a die (2–4) for the multiplier',
    ],
    extensions: [
      'Predict the units digit of the product before building — the multiplication facts start to matter',
      'Write the repeated-addition form beside each problem solved',
    ],
    whatComesNext:
      'Stamp Game Division completes the four operations: instead of building a number several times, one number is shared fairly among skittles. After division, the small bead frame carries abstraction further.',
    followUpWork: [
      {
        description:
          'Print multiplication problems (multi-digit times one digit). Your child solves each with stamps and records the product.',
        worksheetSlug: 'multi-digit-ops',
      },
      {
        description:
          'For each problem solved with stamps, your child writes the matching repeated addition (1,234 × 3 = 1,234 + 1,234 + 1,234) underneath in pencil.',
      },
    ],
  },
  {
    slug: 'stamp-game-division',
    name: 'Stamp Game Division',
    strand: 'abstraction',
    sequence: 5,
    ages: [6, 8],
    grades: '1–2',
    overview:
      'Division with the stamp game is fair sharing: the stamps are dealt out to skittles, one round at a time, biggest stamps first, trading down whenever a fair round is impossible. The answer is what one skittle receives — and whatever cannot be shared fairly is the remainder.',
    materialsNeeded: [
      'The stamp game (or homemade cardstock stamps)',
      'Two to nine skittles — green pegs if you have them, otherwise LEGO people, buttons, or coins to stand for the sharers',
      'Slips of paper with division problems',
      'Pencil and paper',
    ],
    virtualMaterials: ['stamp-game'],
    prerequisites: ['stamp-game-multiplication', 'golden-beads-division'],
    directAims: [
      'To divide a multi-digit number by a single digit through equal sharing',
      'To understand the quotient as one sharer’s portion and the remainder as what cannot be shared fairly',
    ],
    indirectAims: [
      'Preparation for long division and, later, racks and tubes',
      'Feeling why division starts with the largest place while the other operations start with the units',
    ],
    presentation: [
      {
        text: 'Write 725 ÷ 3 on a slip. Stand three skittles in a row, well spaced.',
        say: 'Seven hundred twenty-five, shared fairly among three. Fair means everyone gets exactly the same.',
      },
      {
        text: 'Your child builds 725 in stamps: seven 100s, two 10s, five 1s.',
      },
      {
        text: 'Begin with the biggest stamps. Give each skittle one 100 — a fair round. Do it again.',
        say: 'One for you, one for you, one for you. Everyone got the same.',
      },
      {
        text: 'One 100 is left — not enough to give every skittle one.',
        say: 'I cannot give this hundred to everyone fairly. So we change it for ten tens.',
      },
      {
        text: 'Trade the last 100 for ten 10s (now twelve tens) and deal them out in rounds: each skittle receives four.',
      },
      {
        text: 'Deal the five units: one round of one each, and two units are left over.',
        say: 'Two units left, and I cannot share two fairly among three. They are the remainder — they stay on the table.',
      },
      {
        text: 'Read one skittle’s share: 2 hundreds, 4 tens, 1 unit.',
        say: 'In division, the answer is what one person gets: 725 divided by 3 is 241, remainder 2.',
      },
      {
        text: 'For an older child, check on paper: 241 × 3 + 2 brings back 725.',
      },
    ],
    pointsOfInterest: [
      'Dealing starts with the thousands or hundreds — the opposite of addition and subtraction, which start with the units',
      'Every skittle’s row must look exactly the same — unfairness is visible at a glance',
      'The remainder: stamps that simply cannot be shared, always fewer than the number of skittles',
    ],
    controlOfError: [
      'A short round exposes itself — someone would be left out, so the round cannot be dealt',
      'The rows in front of the skittles must match exactly; any difference means a dealing mistake',
      'The remainder must always be smaller than the number of skittles — if not, another round is possible',
      'On the virtual material, Check confirms fair shares, the quotient, and the remainder column by column',
    ],
    vocabulary: [
      'divide (share fairly)',
      'dividend (what is shared)',
      'divisor (how many sharers)',
      'quotient (one sharer’s portion)',
      'remainder',
      'skittle',
    ],
    variations: [
      'Problems that come out even (no remainder) and problems that do not — sort which is which',
      'Share the same dividend among 2, then 4, then 8 skittles and compare the portions',
    ],
    extensions: [
      'Check every division by multiplying back and adding the remainder',
      'Story problems: 725 marbles shared among 3 cousins — how many each, and how many left in the bag?',
    ],
    whatComesNext:
      'With all four operations done in symbols, your child is ready for the Introduction to the Small Bead Frame, where place value climbs onto wires and written notation takes another step toward paper-only arithmetic.',
    followUpWork: [
      {
        description:
          'Print division problems (dividend up to four digits, single-digit divisor). Your child solves each with stamps and skittles, recording the quotient and the remainder.',
        worksheetSlug: 'multi-digit-ops',
      },
      {
        description:
          'Your child writes each finished problem as a checking sentence in pencil: quotient × divisor + remainder = dividend.',
      },
    ],
  },
]
