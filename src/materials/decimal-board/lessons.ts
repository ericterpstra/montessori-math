import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'decimal-board-intro',
    name: 'Introduction to Decimal Fractions',
    strand: 'decimals',
    sequence: 1,
    ages: [9, 12],
    grades: '4–6',
    overview:
      'Place value continues to the right of the unit: tenths, hundredths, and thousandths, each one tenth the size of the place before it. In this first presentation your child meets the decimal point, builds and reads decimal numbers on a columned board, and discovers that the old trading rule — ten of these make one of those — works on both sides of the point.',
    materialsNeeded: [
      'A decimal board: a sheet of paper turned sideways and ruled into four columns labeled UNITS, TENTHS, HUNDREDTHS, THOUSANDTHS, with a large bold dot drawn between units and tenths',
      'Small counters in four colors — dark green for units, pale blue for tenths, pink for hundredths, pale green for thousandths (buttons, beads, or colored paper squares work; if you cannot match the colors, four clearly labeled cups do the job)',
      'Four small cups or dishes to hold each supply of counters',
      'Slips of paper with decimal numbers written on them, such as 0.3, 2.47, and 1.359',
      'Pencil and paper for writing the numbers your child builds',
    ],
    virtualMaterials: ['decimal-board'],
    prerequisites: ['fractions-operations', 'large-bead-frame'],
    directAims: [
      'To introduce the places to the right of the unit — tenths, hundredths, thousandths — as a continuation of the place-value pattern',
      'To build, read, and write decimal numbers to three decimal places',
      'To experience that ten of any place trade for one of the place to its left, even across the decimal point',
    ],
    indirectAims: [
      'Preparation for comparing, adding, and subtracting decimal fractions',
      'Connecting fraction work (one tenth as 1/10 of a whole) with the place-value work of the golden beads and bead frames',
      'Remote preparation for measurement, money, percent, and scientific notation',
    ],
    presentation: [
      {
        text: 'Sit beside your child with the board and the four cups of counters. Point to the units column and recall the familiar pattern from the golden beads: ten units made a ten, ten tens made a hundred.',
        say: 'You know that ten of something always trades for one of the next bigger place. Today we go the other direction — smaller than one.',
      },
      {
        text: 'Place one dark green counter in the units column.',
        say: 'This is one whole unit.',
      },
      {
        text: 'Point to the big dot drawn between the units and tenths columns, tracing it with a finger.',
        say: 'This dot is the decimal point. Everything on the other side of it is smaller than one whole.',
      },
      {
        text: 'Place one pale blue counter in the tenths column.',
        say: 'If we cut one unit into ten equal pieces, each piece is one tenth. Ten tenths make one whole unit.',
      },
      {
        text: 'Count ten pale blue counters into the tenths column, one at a time, then trade them all for one green unit, sweeping your hand left across the decimal point as you do.',
        say: 'Ten tenths — trade! — one unit. The rule is the same as always.',
      },
      {
        text: 'Introduce the pink counter in the hundredths column the same way, and let your child do the ten-for-one trade into tenths themselves.',
        say: 'If we cut a tenth into ten pieces, each piece is one hundredth. Ten hundredths make one tenth.',
      },
      {
        text: 'Introduce the pale green thousandth last, and have your child say the trading rule before making the trade.',
        say: 'Ten thousandths make one hundredth. This is the smallest piece on our board.',
      },
      {
        text: 'Build a number together: place 2 units, 4 tenths, and 7 hundredths, then read the board from left to right while pointing at each column.',
        say: 'Two units, four tenths, seven hundredths — we read it “two point four seven,” or “two and forty-seven hundredths.”',
      },
      {
        text: 'Take turns with the problem slips: you read a number aloud and your child builds it, then your child builds a secret number and you read it. Include a number with an empty place, like 2.05.',
        say: 'Can you build one point three five nine?',
      },
      {
        text: 'Show how to record a built number: write one digit for each column in order, copying the decimal point between the units and tenths digits. Have your child write the last few themselves.',
        say: 'We write exactly what the board shows — one digit for every column, and the point right after the units.',
      },
    ],
    pointsOfInterest: [
      'The pattern never breaks: ten of anything, anywhere on the board, trade for one of the next place to the left',
      'The pale colors are a mirror of the strong ones — pale blue tenths echo the blue tens, pale rose hundredths echo the red hundreds, pale green thousandths echo the green thousands',
      'A number with a hole in it, like 2.05, needs a zero to hold the empty place',
      'Reading the same number two ways: “two point four seven” and “two and forty-seven hundredths”',
    ],
    controlOfError: [
      'Ten or more counters never stay in a column — a waiting trade means the number cannot be read yet',
      'The written number must match the board digit for digit; pointing at each column while reading aloud catches mismatches',
      'On the virtual board, the value readout and the Make-the-number check mark every column ✓ or ✗, so the child sees exactly which place to recount',
    ],
    vocabulary: ['decimal point', 'decimal fraction', 'tenth', 'hundredth', 'thousandth', 'place value', 'exchange'],
    variations: [
      'Build numbers with an empty middle place (2.05, 3.007) and talk about why the zero must be written',
      'Say quantities in fraction words first — “four tenths and seven hundredths” — and let your child work out the digits',
      'Connect to money: dimes are tenths of a dollar and pennies are hundredths, so $2.47 is a decimal your child already knows',
    ],
    extensions: [
      'Bring back the fraction circles and show that the 1/10 piece and one pale blue tenth counter name the very same idea',
      'Draw a long place-value chart from thousands to thousandths and let your child write numbers that stretch across the decimal point',
      'Play the mistake game: build a number with one deliberate error and have your child find and fix the wrong column',
    ],
    whatComesNext:
      'When your child builds and reads decimal numbers confidently — including trading ten tenths for a unit and breaking a unit back into tenths — move on to Decimal Operations, where the same board compares decimal quantities and carries addition and subtraction across the decimal point.',
    followUpWork: [
      {
        description:
          'Print a decimal place-value worksheet — reading, writing, and building numbers to thousandths — and have your child work it in pencil at the table, building only the ones they doubt on the board.',
        worksheetSlug: 'decimals',
      },
      {
        description:
          'Dictation: say six decimal numbers aloud (“three point zero five”) and have your child write each one in pencil; then trade roles and let them dictate numbers for you to write — with an occasional deliberate mistake for them to catch.',
      },
      {
        description:
          'Expanded form on paper: your child writes a handful of decimals the long way, one place per term — 2.47 = 2 + 0.4 + 0.07 — and reads each line aloud.',
      },
    ],
  },
  {
    slug: 'decimal-board-operations',
    name: 'Decimal Operations',
    strand: 'decimals',
    sequence: 2,
    ages: [9, 12],
    grades: '4–6',
    overview:
      'With the places to the right of the unit secure, the decimal board now compares, adds, and subtracts decimal quantities. The rules are the ones your child already knows from the golden beads — put together and trade ten up, take away and break one down — carried straight across the decimal point.',
    materialsNeeded: [
      'The decimal board and colored counters from the introduction lesson (paper columns and buttons or beads in four colors)',
      'A second paper board, or the same sheet folded in half, so two quantities can sit side by side for comparing',
      'Three small cards written <, =, and > for comparison work',
      'Slips of paper with problems: comparison pairs like 0.3 ? 0.25, sums like 1.23 + 0.45 and 1.4 + 0.75, and differences like 2.87 − 1.34 and 2.1 − 0.35',
      'Pencil and paper for recording each problem and its answer',
    ],
    virtualMaterials: ['decimal-board'],
    prerequisites: ['decimal-board-intro'],
    directAims: [
      'To compare decimal quantities place by place, starting from the largest place',
      'To add decimals concretely, trading ten of a place for one of the place to its left',
      'To subtract decimals concretely, breaking one of a place into ten of the place to its right — including one unit into ten tenths, across the decimal point',
    ],
    indirectAims: [
      'Preparation for the written algorithms for decimal addition and subtraction, with the decimal points lined up',
      'Guarding against the common misreading that 0.25 is more than 0.3 because twenty-five looks bigger than three',
      'Remote preparation for decimal multiplication and division, percent, and measurement work',
    ],
    presentation: [
      {
        text: 'Begin with a comparison. Have your child build 0.3 on one board and 0.25 on the other, checking each against its slip.',
        say: 'Which is bigger? Let us not guess — the board will show us.',
      },
      {
        text: 'Compare column by column from the left: units first (none on either side), then tenths — three against two.',
        say: 'Three tenths against two tenths. The tenths decide it: no matter what comes after, 0.3 is greater.',
      },
      {
        text: 'Let your child test the trap. If twenty-five still “looks bigger,” trade the 3 tenths for 30 hundredths and count 30 hundredths against 25.',
        say: 'Thirty hundredths against twenty-five hundredths — now you can see which is more.',
      },
      {
        text: 'Place the correct card between the boards and record the sentence: 0.3 > 0.25. Work two or three more comparison pairs the same way.',
        say: 'We always compare the biggest places first.',
      },
      {
        text: 'Move to addition. Write 1.23 + 0.45 on a slip. Have your child build 1.23 across the top of the board and 0.45 below it, then slide the two quantities together column by column and read the answer: 1.68.',
        say: 'Adding is just putting together — the same as it was with the golden beads.',
      },
      {
        text: 'Record 1.23 + 0.45 = 1.68 in pencil. Now write 1.4 + 0.75 and have your child build and combine the two quantities the same way.',
        say: 'This time, keep an eye on the tenths column.',
      },
      {
        text: 'Count the tenths column: eleven. Trade ten of them for one unit, carrying it left across the decimal point, and let your child read the answer.',
        say: 'Ten tenths — trade! — one unit crosses the point. Now read it: two point one five.',
      },
      {
        text: 'Record 1.4 + 0.75 = 2.15 in pencil. Now write 2.87 − 1.34 and have your child build only 2.87.',
        say: 'In taking away, we build just the starting number. The answer will be whatever is left on the board.',
      },
      {
        text: 'Take away 1.34 place by place — 4 hundredths, then 3 tenths, then 1 unit — with no trades needed. Read what remains and record 2.87 − 1.34 = 1.53.',
        say: 'Two point eight seven, take away one point three four — one point five three is left.',
      },
      {
        text: 'Now write 2.1 − 0.35 and have your child build only 2.1, then ask them to take away 5 hundredths. The hundredths column is empty — so trade 1 tenth for 10 hundredths, then take the 5.',
        say: 'Nothing to take! So we break one tenth into ten hundredths — and now we can.',
      },
      {
        text: 'Ask for 3 tenths next. No tenths remain — so break 1 unit into 10 tenths, straight across the decimal point, and take the 3.',
        say: 'Even a whole unit will break into ten tenths when we need it to.',
      },
      {
        text: 'Read what remains — 1 unit, 7 tenths, 5 hundredths — and record 2.1 − 0.35 = 1.75. Have your child check by putting the taken-away pieces back and confirming the board reads 2.1 again.',
        say: 'One point seven five. Put back what we took — do we land exactly on two point one?',
      },
    ],
    pointsOfInterest: [
      'The trap pairs — 0.3 versus 0.25, 0.4 versus 0.399 — where the shorter numeral wins',
      'Carries and borrows sail straight across the decimal point as if it were not there',
      'Eleven tenths sitting in one column, visibly waiting to be traded before the answer can be read',
      'Checking subtraction by adding back what was taken away',
    ],
    controlOfError: [
      'A column holding ten or more cannot be read — the material itself demands the trade before an answer can be written',
      'Taking from an empty column is impossible — the board forces the exchange at exactly the spot where a written algorithm would borrow',
      'Putting the taken-away pieces back must restore the starting number exactly',
      'On the virtual board, comparisons are judged exactly and the Check button marks every column ✓ or ✗ without giving the answer away',
    ],
    vocabulary: ['greater than', 'less than', 'equal to', 'sum', 'difference', 'exchange', 'carry', 'borrow'],
    variations: [
      'Comparison pairs where the shorter numeral is larger (0.4 vs 0.399, 0.5 vs 0.487) until place-by-place comparing is automatic',
      'Addition with a full cascade of trades, like 0.999 + 0.001, where every column trades up in turn',
      'Subtraction with a double borrow across the point, like 2.1 − 0.35 — then a full cascade of borrows, like 3 − 0.001',
    ],
    extensions: [
      'Estimate before building: for 1.4 + 0.75 ask, “Will it be more or less than 2?” — then let the board settle it',
      'Work each problem twice, on the board and in columns on paper with the decimal points lined up, until your child prefers the paper',
      'Money problems with real coins: $2.10 − $0.35 makes the same borrow with dimes and pennies',
    ],
    whatComesNext:
      'Fluent comparing, adding, and subtracting on the board lead naturally to the written algorithms: the same problems worked in pencil columns with the decimal points aligned. From there your child is ready for decimal multiplication and division, percent, and the measurement work of upper elementary.',
    followUpWork: [
      {
        description:
          'Print a mixed sheet of decimal comparison, addition, and subtraction problems and have your child work it in pencil at the table, building on the board only the problems they doubt.',
        worksheetSlug: 'decimals',
      },
      {
        description:
          'Trap-pair journal: your child writes five comparison pairs like 0.3 ? 0.25 in pencil, circles the greater number in each, and writes one sentence explaining which place decided it.',
      },
      {
        description:
          'Check by adding back: for every subtraction worked on paper, your child adds the answer to the number taken away and confirms in writing that it restores the starting number.',
      },
    ],
  },
]
