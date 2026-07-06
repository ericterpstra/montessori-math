import type { Lesson } from '../../lessons/types'

/**
 * Album lessons for the Golden Beads & Mat — the heart of the decimal-system
 * strand. Written for an untrained parent working at a kitchen table.
 */
export const lessons: Lesson[] = [
  {
    slug: 'golden-beads-intro',
    name: 'Introduction to the Golden Beads',
    strand: 'decimal-system',
    sequence: 1,
    ages: [4, 6],
    grades: 'PK–K',
    overview:
      'Your child meets the four sizes of the decimal system — a unit bead, a ten-bar, a hundred-square, and a thousand-cube — and learns their names by holding, counting, and comparing them. This one short lesson is the doorway to all later work with big numbers.',
    materialsNeeded: [
      'One golden unit bead, one ten-bar, one hundred-square, and one thousand-cube (a base-ten block set works: a small cube, a rod, a flat, and a big cube)',
      'Household substitute: one dried bean, a craft stick with ten beans glued on, a card with one hundred beans (10 rows of 10), and a small box labeled as the thousand',
      'A small tray for carrying',
      'A work mat: a green felt rectangle, a placemat, or a folded towel',
    ],
    virtualMaterials: ['golden-beads'],
    prerequisites: ['cards-and-counters'],
    directAims: [
      'To give the child the names unit, ten, hundred, and thousand attached to real quantities',
      'To let the child feel that ten of one size makes exactly one of the next size',
    ],
    indirectAims: [
      'Preparation for reading and writing numbers to 9,999',
      'Preparation for the four operations with golden beads',
      'A first sensory impression of the base-ten structure of our number system',
    ],
    presentation: [
      {
        text: 'Invite your child to carry the tray to the mat with you. Take out only the unit bead and place it near the bottom-right of the mat. Let your child hold it.',
        say: 'This is one unit.',
      },
      {
        text: 'Place the ten-bar beside it. Have your child touch each bead on the bar while you count aloud together, one through ten.',
        say: 'This is one ten. It is made of ten units.',
      },
      {
        text: 'Place the hundred-square next. Let your child lay ten-bars on top of it to discover that ten ten-bars cover it exactly.',
        say: 'This is one hundred. It is made of ten tens.',
      },
      {
        text: 'Place the thousand-cube last. Let your child stack hundred-squares against it to see that ten hundreds make the cube.',
        say: 'This is one thousand. It is made of ten hundreds.',
      },
      {
        text: 'Give a three-period lesson. First name each piece again while pointing. Then ask your child to act: hand me the hundred, put the ten on my palm, point to the thousand. Mix the requests and keep it playful.',
        say: 'Show me the ten. Now hide the unit in your hand.',
      },
      {
        text: 'Only when your child confidently finds each piece, ask the third-period question while pointing to one piece at a time.',
        say: 'What is this?',
      },
      {
        text: 'Let your child carry each piece back to the tray, heaviest first, and return the tray. Weight is part of the lesson — a thousand should feel like a thousand.',
      },
    ],
    pointsOfInterest: [
      'The surprise that the thousand-cube is heavy and the unit almost weightless',
      'Counting the beads on the ten-bar one by one',
      'Laying ten-bars on the hundred-square and seeing them fit exactly',
      'The sparkle of the golden beads — they are treated as treasure, carried carefully on a tray',
    ],
    controlOfError: [
      'The material itself: ten units laid along a ten-bar match it exactly, ten-bars cover the hundred-square exactly, and hundred-squares stack to the height of the cube',
      'In the virtual material, tapping a piece shows its true bead count — a hundred really has 100 beads to see',
    ],
    vocabulary: ['unit', 'ten', 'hundred', 'thousand', 'golden beads'],
    variations: [
      'Distance game: put the mat across the room and ask your child to walk over and bring back "one hundred" from memory',
      'Feel game: with eyes closed, identify the unit, ten, hundred, or thousand by touch alone',
    ],
    extensions: [
      'Count the beads on the hundred-square by tens: 10, 20, 30 … 100',
      'Ask "how many units are hiding inside the thousand?" and count a few rows to convince yourselves it is truly 1,000',
    ],
    whatComesNext:
      'Next your child meets the printed symbols in Introduction to the Number Cards, then puts symbol and quantity together in Building Big Numbers (Formation) — reading and building numbers like 3,251 with cards and beads.',
    followUpWork: [
      {
        description:
          'Color-and-count pages: your child colors pictured golden beads and writes how many units, tens, hundreds, and thousands they see.',
        worksheetSlug: 'golden-bead-pictures',
      },
      {
        description:
          'Draw the family: on blank paper, your child draws a dot for a unit, a line of ten dots for a ten, a big square for a hundred, and a cube for a thousand, labeling each.',
      },
    ],
  },
  {
    slug: 'golden-beads-formation',
    name: 'Building Big Numbers (Formation)',
    strand: 'decimal-system',
    sequence: 3,
    ages: [4, 6],
    grades: 'PK–K',
    overview:
      'Quantity and symbol come together: you name a number such as 2,436, and your child fetches that many thousands, hundreds, tens, and units from the "bank," then matches the number cards to the beads. This is where a four-year-old starts reading four-digit numbers.',
    materialsNeeded: [
      'Golden bead material or base-ten blocks: at least 9 units, 9 tens, 9 hundreds, and a few thousands',
      'A set of large number cards 1–9,000 (printable card stock works well; color the numerals: units green, tens blue, hundreds red, thousands green)',
      'A tray and a work mat (felt rectangle, placemat, or towel)',
      'Household substitute for beads: beans, bean sticks of ten, hundred-cards of glued beans',
    ],
    virtualMaterials: ['golden-beads', 'number-cards'],
    prerequisites: ['golden-beads-intro', 'number-cards-intro'],
    directAims: [
      'To associate quantities of the decimal system with their written symbols',
      'To build and read numbers up to 9,999',
    ],
    indirectAims: [
      'Understanding that the same digit means different amounts in different places',
      'Preparation for the four operations and for column arithmetic on paper',
    ],
    presentation: [
      {
        text: 'Set up a "bank" of beads at one edge of the table and the mat in the middle. Start small: place one number card, such as 3, and ask your child to fetch that many units on the tray.',
        say: 'The card says three. Bring me three units from the bank, please.',
      },
      {
        text: 'Repeat with a tens card, such as 40. Your child brings four ten-bars and lays them in a neat column to the left of the units.',
        say: 'Forty — that is four tens.',
      },
      {
        text: 'Do the same for a hundreds card and a thousands card, always placing beads in columns: thousands on the left, then hundreds, tens, and units.',
      },
      {
        text: 'Now combine: lay out cards for a full number, such as 2,436, one card per place. Your child fetches each quantity in turn and places the matching card above each column.',
        say: 'Two thousand, four hundred, thirty… and six.',
      },
      {
        text: 'Stack the cards: place the 6 on top of the 30, the 30 on top of the 400, the 400 on top of the 2,000, so the zeros hide and the number reads 2,436. Slide the stack next to the beads.',
        say: 'Look — two thousand four hundred thirty-six. You built it!',
      },
      {
        text: 'Reverse the game: build a quantity of beads yourself and ask your child to find and stack the cards that say what is on the mat.',
      },
      {
        text: 'In the virtual material, choose the "Build a number" mode. It shows a numeral with stacked cards; your child taps pieces from the bank and presses Check, and each column is marked right or not yet.',
      },
    ],
    pointsOfInterest: [
      'The magic moment the stacked cards hide the zeros and the number "appears"',
      'Fetching beads across the room and trying to hold the whole order in mind',
      'Numbers with a zero in the middle, like 2,046 — an empty column with no beads at all',
    ],
    controlOfError: [
      'Each card must match its bead column; a column of four ten-bars under a card reading 50 looks and counts wrong',
      'Counting the beads back place by place reveals any error',
      'The virtual material marks each place ✓ or ✗ when your child presses Check — it never just gives the answer',
    ],
    vocabulary: ['place', 'units', 'tens', 'hundreds', 'thousands', 'zero as a place holder'],
    variations: [
      'Bring me game: say a number aloud with no cards showing and let your child build it from memory',
      'Silly banker: ask for 14 units so your child discovers the column overflows — and trade ten of them for a ten-bar',
      'Hide the running total in the virtual material and let your child name the number on the mat before showing it',
    ],
    extensions: [
      'Build two numbers side by side and ask which is larger, and how you can tell by looking at the thousands first',
      'Write the built number on paper in four colors: green units, blue tens, red hundreds, green thousands',
    ],
    whatComesNext:
      'When building and reading feel easy, play the Bird’s-Eye View with the full set of number cards, and then begin Golden Bead Addition — two families of beads pushed together into one big sum.',
    followUpWork: [
      {
        description:
          'Place-value practice pages: your child writes the number shown by pictured beads, and draws beads for a written number.',
        worksheetSlug: 'place-value',
      },
      {
        description:
          'Golden bead picture pages for counting and coloring quantities up to the thousands.',
        worksheetSlug: 'golden-bead-pictures',
      },
      {
        description:
          'Expanded-form writing: your child writes 2,436 = 2,000 + 400 + 30 + 6 for numbers you dictate at the table.',
      },
    ],
  },
  {
    slug: 'golden-beads-addition',
    name: 'Golden Bead Addition',
    strand: 'decimal-system',
    sequence: 5,
    ages: [5, 7],
    grades: 'K–1',
    overview:
      'Two quantities are laid out on the mat, pushed together, and counted — and when a column overflows past nine, ten beads are traded at the bank for one of the next size. Your child physically performs the "carrying" that written addition only hints at.',
    materialsNeeded: [
      'Golden bead material or base-ten blocks with plenty of each size (two children’s worth: up to 18 of each piece)',
      'Large number cards, ideally two sets (one for each addend) plus one for the answer',
      'A work mat and a tray; a second small mat or dish to act as the "bank"',
      'Paper and pencil to record the finished sum',
    ],
    virtualMaterials: ['golden-beads'],
    prerequisites: ['golden-beads-formation', 'number-cards-birds-eye'],
    directAims: [
      'To experience addition as putting two quantities together into one',
      'To perform dynamic addition — exchanging ten of one place for one of the next — with real objects',
    ],
    indirectAims: [
      'Preparation for the written addition algorithm and the meaning of "carrying"',
      'The impression that the same simple rule (ten trades for one) works in every column',
    ],
    presentation: [
      {
        text: 'Write or choose a problem such as 1,568 + 1,679. Have your child build the first number on the mat, beads in columns, and check it against the cards.',
        say: 'First we lay out one thousand five hundred sixty-eight.',
      },
      {
        text: 'Build the second number below or beside the first, keeping each place in its own column.',
        say: 'Now the second number. We are going to put them together — that is what addition means.',
      },
      {
        text: 'Push the two quantities together column by column, starting with the units. Count the units aloud.',
        say: 'Seventeen units! Can a column keep more than nine? No — we exchange.',
      },
      {
        text: 'Count out ten units, carry them to the bank on the tray, and bring back one ten-bar. Place it with the tens. Seven units remain.',
        say: 'Ten units make one ten. We have seven units left.',
      },
      {
        text: 'Repeat in the tens column (now fourteen tens: exchange ten of them for a hundred-square), and again in the hundreds. Work one column at a time, always saying the trade aloud.',
      },
      {
        text: 'Read the answer from the mat, place by place, and stack the answer cards: 3,247. Record the whole sum on paper.',
        say: 'One thousand five hundred sixty-eight plus one thousand six hundred seventy-nine makes three thousand two hundred forty-seven.',
      },
      {
        text: 'In the virtual material, choose Addition. It walks the same path: lay out the first number, check; lay out the second, check; exchange with the column buttons; then Check the answer — each place is marked, and it will say so if a column still holds ten or more.',
      },
    ],
    pointsOfInterest: [
      'The drama of a column holding "too many" and the trip to the bank to trade',
      'Watching a big answer appear from two smaller numbers',
      'That the units are always counted first — the opposite of how we read numbers',
    ],
    controlOfError: [
      'A column with ten or more beads visibly will not "read" as a digit — the material forces the exchange',
      'Counting the answer back or re-adding on another day gives the same result',
      'The virtual Check marks each place ✓ or ✗ and refuses to grade until every column holds nine or fewer',
    ],
    vocabulary: ['addition', 'addend', 'sum', 'exchange', 'carrying'],
    variations: [
      'Static addition first (no exchanges needed, e.g. 1,234 + 2,345) if the exchange step overwhelms',
      'Three addends for a confident child — the exchanging becomes even more satisfying',
      'Let your child invent the problem and you do the fetching, while they act as the banker who approves every trade',
    ],
    extensions: [
      'After the bead answer is found, write the same problem in columns on paper and find the little "carried 1" in what you did at the bank',
      'Estimate first: "Will the answer be more or less than 3,000?" Then check with the beads',
    ],
    whatComesNext:
      'Golden Bead Subtraction comes next — instead of putting quantities together, your child takes an amount away and discovers borrowing as the same bank trade run in reverse.',
    followUpWork: [
      {
        description:
          'Multi-digit addition sheets to solve with beads first and pencil second; choose problems with carrying to match this lesson.',
        worksheetSlug: 'multi-digit-ops',
      },
      {
        description:
          'Place-value warm-ups: writing numbers from bead pictures keeps the columns fresh between addition sessions.',
        worksheetSlug: 'place-value',
      },
      {
        description:
          'Bank record book: your child writes each trade made during a bead addition ("10 units → 1 ten") in a little notebook, like a real banker.',
      },
    ],
  },
  {
    slug: 'golden-beads-subtraction',
    name: 'Golden Bead Subtraction',
    strand: 'decimal-system',
    sequence: 6,
    ages: [5, 7],
    grades: 'K–1',
    overview:
      'Your child builds a large quantity, then gives an amount of it away — and when a column runs short, a bigger piece is traded at the bank for ten smaller ones. Borrowing stops being a trick and becomes something your child’s hands understand.',
    materialsNeeded: [
      'Golden bead material or base-ten blocks (9 or more of each smaller piece so exchanges are possible)',
      'Large number cards for the starting number, the amount taken away, and the answer',
      'A work mat, a tray, and a dish or second mat as the "bank"',
      'Paper and pencil to record the finished problem',
    ],
    virtualMaterials: ['golden-beads'],
    prerequisites: ['golden-beads-addition'],
    directAims: [
      'To experience subtraction as taking away part of a quantity and seeing what remains',
      'To perform dynamic subtraction — exchanging one piece for ten of the next place down when a column runs short',
    ],
    indirectAims: [
      'Preparation for the written subtraction algorithm and the meaning of "borrowing"',
      'Reinforcement that exchanges preserve the amount: the mat is worth the same before and after a trade',
    ],
    presentation: [
      {
        text: 'Choose a problem that forces borrowing, such as 4,053 − 1,278. Have your child build 4,053 on the mat and check it with the cards. Point out the empty hundreds column.',
        say: 'Four thousand fifty-three. Look — no hundreds at all in this number.',
      },
      {
        text: 'Show the amount to take away with the small cards: 1,278. Begin with the units.',
        say: 'We must give away eight units, but we only have three. What can we do?',
      },
      {
        text: 'Exchange one ten-bar at the bank for ten units. Now there are thirteen units; count out eight and set them aside off the mat. Five remain.',
        say: 'One ten makes ten units. Now we can give eight away.',
      },
      {
        text: 'Move to the tens: four remain but seven must go. There are no hundreds to trade — so first exchange one thousand-cube for ten hundred-squares, then one hundred-square for ten ten-bars.',
        say: 'The hundreds column is empty, so we ask the thousands for help first.',
      },
      {
        text: 'Continue taking away column by column, counting the beads rather than reciting: remove seven ten-bars, then two hundred-squares, then one thousand-cube, exchanging first whenever a column runs short. Let the beads do the arithmetic.',
        say: 'Count what is left in each column.',
      },
      {
        text: 'Read the remainder from the mat — 2,775 — stack the answer cards, and record the problem on paper.',
        say: 'Four thousand fifty-three take away one thousand two hundred seventy-eight leaves two thousand seven hundred seventy-five.',
      },
      {
        text: 'In the virtual material, choose Subtraction. Your child lays out the starting number, checks it, then taps pieces to return them to the bank, using the exchange buttons whenever a column runs short. Check marks every place honestly.',
      },
    ],
    pointsOfInterest: [
      'The empty hundreds column that sends your child "up the street" to the thousands for help',
      'Trading one big piece for ten smaller ones — the reverse of the addition trade',
      'The pile of taken-away beads growing while the mat shrinks',
    ],
    controlOfError: [
      'A column that runs short simply cannot give more beads — the material stops the child until an exchange is made',
      'Adding the answer back to the amount taken away should rebuild the starting number exactly',
      'The virtual Check marks each place ✓ or ✗ and points out when a column still holds ten or more',
    ],
    vocabulary: ['subtraction', 'minuend', 'subtrahend', 'difference', 'borrowing', 'exchange'],
    variations: [
      'Static subtraction first (no borrowing, e.g. 4,567 − 1,234) to settle the routine',
      'Story problems: "The bakery had 4,053 raisins and used 1,278 in the bread…"',
      'Play banker and customer: your child must ask the banker (you) for each trade and explain why it is fair',
    ],
    extensions: [
      'Write the same problem in columns on paper and find where each bead trade appears as a crossed-out digit',
      'Check by addition: add the answer and the subtrahend with beads and watch 4,053 reappear',
    ],
    whatComesNext:
      'Golden Bead Multiplication follows — your child discovers it is simply adding the same number several times, and the exchanges feel like old friends.',
    followUpWork: [
      {
        description:
          'Multi-digit subtraction sheets with borrowing — solve with beads first, then pencil, including problems with a zero in the middle.',
        worksheetSlug: 'multi-digit-ops',
      },
      {
        description:
          'Golden bead picture pages where your child crosses out pictured beads to show an amount taken away and writes what remains.',
        worksheetSlug: 'golden-bead-pictures',
      },
      {
        description:
          'Fair-trade journal: after each session your child records every exchange made ("1 thousand → 10 hundreds") and why it was needed.',
      },
    ],
  },
  {
    slug: 'golden-beads-multiplication',
    name: 'Golden Bead Multiplication',
    strand: 'decimal-system',
    sequence: 7,
    ages: [5, 7],
    grades: 'K–1',
    overview:
      'Your child lays out the very same number two, three, or four times, pushes the layouts together, and exchanges — and discovers that multiplication is just addition with a beautiful secret: every addend is the same. The answer to 1,568 × 3 is found entirely by hand.',
    materialsNeeded: [
      'Golden bead material or base-ten blocks — plenty of pieces, since the same number is laid out several times',
      'Large number cards (several small sets if you have them, one per layout, plus cards for the answer)',
      'A work mat, a tray, and a "bank" dish',
      'Paper and pencil to record the finished problem',
    ],
    virtualMaterials: ['golden-beads'],
    prerequisites: ['golden-beads-addition'],
    directAims: [
      'To experience multiplication as taking the same quantity several times',
      'To find products up to 9,999 concretely, exchanging wherever a column passes nine',
    ],
    indirectAims: [
      'Preparation for the memorization of multiplication facts and for written long multiplication',
      'Preparation for the stamp game and checkerboard, where the same idea goes abstract',
    ],
    presentation: [
      {
        text: 'Choose a problem such as 1,568 × 3. Tell your child the plan before you start.',
        say: 'We are going to take one thousand five hundred sixty-eight — three times!',
      },
      {
        text: 'Have your child build 1,568 on the mat and check it. Then build it again below, and check. Then a third time.',
        say: 'That is once… twice… three times. The same number every time.',
      },
      {
        text: 'Pause and look. Ask what your child notices about the three layouts.',
        say: 'Every row is exactly the same. When we add the same number again and again, we call it multiplication.',
      },
      {
        text: 'Push all three layouts together column by column, starting with the units, and count each column aloud.',
        say: 'Twenty-four units! Too many for one column — off to the bank.',
      },
      {
        text: 'Exchange at the bank: twenty-four units become two ten-bars and four units. Continue up the columns, exchanging wherever a column holds ten or more.',
      },
      {
        text: 'Read the product from the mat — 4,704 — stack the answer cards, and record the problem on paper.',
        say: 'One thousand five hundred sixty-eight taken three times makes four thousand seven hundred four.',
      },
      {
        text: 'In the virtual material, choose Multiplication. It asks for the same layout once per count — checking each time — then lets your child exchange and check the product place by place.',
      },
    ],
    pointsOfInterest: [
      'Seeing three identical layouts side by side before the push-together',
      'Columns overflowing much more dramatically than in addition — sometimes two trades in one column',
      'The word "times" suddenly meaning something you can see',
    ],
    controlOfError: [
      'Each layout is checked against the cards before the next is built — a miscount shows up early',
      'A column holding ten or more cannot be read as a digit; the material demands the exchange',
      'The virtual Check confirms every place and the running total can be hidden until the child has an answer',
    ],
    vocabulary: ['multiplication', 'times', 'multiplicand', 'multiplier', 'product'],
    variations: [
      'Start with 2 as the multiplier and a small number like 234 taken twice',
      'Skip-count the layouts before combining: 1,568… 3,136… 4,704 (with your help)',
      'Group multiplication: each family member builds one copy of the number, then all copies are combined',
    ],
    extensions: [
      'Write the problem vertically on paper and match each carried digit to a bank trade you actually made',
      'Compare with addition: work 1,568 + 1,568 + 1,568 on paper and ask which notation is quicker',
    ],
    whatComesNext:
      'Golden Bead Division completes the four operations: the child deals a large quantity fairly to skittles and meets sharing, remainders, and the reverse of multiplication.',
    followUpWork: [
      {
        description:
          'Multiplication sheets with a one-digit multiplier — lay out the beads first, then solve the same problems in pencil.',
        worksheetSlug: 'multi-digit-ops',
      },
      {
        description:
          'Place-value refreshers between sessions: reading and writing four-digit numbers keeps the columns automatic.',
        worksheetSlug: 'place-value',
      },
      {
        description:
          'Same-addend hunt: your child writes each multiplication worked with beads as a long addition (1,568 + 1,568 + 1,568) and circles what repeats.',
      },
    ],
  },
  {
    slug: 'golden-beads-division',
    name: 'Golden Bead Division',
    strand: 'decimal-system',
    sequence: 8,
    ages: [5, 7],
    grades: 'K–1',
    overview:
      'A big quantity is shared fairly among little wooden skittles — one thousand for you, one for you, one for you — with the bank standing by to break big pieces into small ones. Whatever cannot be shared stays on the mat: your child has met the remainder.',
    materialsNeeded: [
      'Golden bead material or base-ten blocks',
      'Skittles or stand-ins: small figurines, clothespins, cups, or family photos — one per "person" sharing',
      'A work mat, a tray, and a "bank" dish',
      'Paper and pencil to record the finished problem',
    ],
    virtualMaterials: ['golden-beads'],
    prerequisites: ['golden-beads-multiplication'],
    directAims: [
      'To experience division as sharing a quantity equally among a number of receivers',
      'To exchange downward — one hundred for ten tens — so that sharing can continue, and to meet the remainder',
    ],
    indirectAims: [
      'Preparation for the division boards, for long division, and for fractions',
      'The impression that division and multiplication undo each other',
    ],
    presentation: [
      {
        text: 'Choose a problem such as 9,764 ÷ 4. Stand four skittles in a row, with space below each for its share. Have your child build 9,764 on the mat and check it.',
        say: 'Four friends are going to share nine thousand seven hundred sixty-four — exactly fairly.',
      },
      {
        text: 'Begin with the thousands, the biggest pieces. Deal them out one at a time, one to each skittle in turn, until fewer than four remain.',
        say: 'One thousand for you, one for you, one for you, one for you… and again.',
      },
      {
        text: 'One thousand-cube is left and cannot be shared among four. Take it to the bank and exchange it for ten hundred-squares.',
        say: 'One thousand makes ten hundreds. Now we can keep sharing.',
      },
      {
        text: 'Deal the hundreds (seventeen now), then exchange the leftover hundred for ten tens, deal the tens, and finally deal the units the same way.',
      },
      {
        text: 'Look at one skittle’s share and read it: 2 thousands, 4 hundreds, 4 tens, 1 unit — 2,441. Point out that every skittle has exactly the same.',
        say: 'Each friend receives two thousand four hundred forty-one. The answer in division is what one person gets.',
      },
      {
        text: 'Try 9,765 ÷ 4 next. Everything repeats, but at the very end one unit cannot be shared. It stays on the mat.',
        say: 'One unit is left over. We call it the remainder.',
      },
      {
        text: 'In the virtual material, choose Division. Your child lays out the dividend, checks it, then uses "Deal 1 to each skittle" on each column and the exchange buttons for leftovers; Check confirms each place of the share and the remainder.',
      },
    ],
    pointsOfInterest: [
      'The rhythmic fairness of dealing: one for you, one for you, one for you',
      'Trading a leftover thousand for ten hundreds so the sharing can go on',
      'The lonely leftover unit that belongs to nobody — the remainder',
      'Checking fairness by comparing two skittles’ shares side by side',
    ],
    controlOfError: [
      'Fair sharing is visible: if two skittle rows differ, something went wrong and the child can see where',
      'Multiplying back — one share taken four times — rebuilds the dividend, remainder included',
      'The virtual Check tells the child when a column can still be dealt or exchanged, and only then marks each place of the share',
    ],
    vocabulary: ['division', 'share', 'dividend', 'divisor', 'quotient', 'remainder', 'skittle'],
    variations: [
      'Share among 2 or 3 first — fewer skittles means quicker rounds',
      'Use snacks-for-toys pretend play: crackers shared among stuffed animals, then beads shared among skittles',
      'Choose problems with remainder zero at first, then spring a remainder and talk about it',
    ],
    extensions: [
      'Record division on paper as 9,764 ÷ 4 = 2,441 and, later, with the remainder written as "r 1"',
      'Reverse it: take one skittle’s share and multiply it by the number of skittles with beads — does the original amount return?',
    ],
    whatComesNext:
      'With all four operations experienced in golden beads, your child is ready for the memorization strand (starting with the Snake Game and the Addition Strip Board) and, in the abstraction strand, the Stamp Game — the same four operations with tidy symbolic tiles.',
    followUpWork: [
      {
        description:
          'Division practice sheets with one-digit divisors — deal with beads first, then record the quotient and remainder in pencil.',
        worksheetSlug: 'multi-digit-ops',
      },
      {
        description:
          'Golden bead picture pages: circle equal groups of pictured beads and write what each group receives and what is left over.',
        worksheetSlug: 'golden-bead-pictures',
      },
      {
        description:
          'Sharing stories: your child writes or dictates a one-sentence story for a division worked with beads ("4 friends shared 9,764 marbles…") and illustrates the remainder.',
      },
    ],
  },
]
