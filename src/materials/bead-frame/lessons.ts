import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'small-bead-frame-intro',
    name: 'Introduction to the Small Bead Frame',
    strand: 'abstraction',
    sequence: 6,
    ages: [6, 8],
    grades: '1–2',
    overview:
      'The small bead frame is a beautiful abacus with four wires: ten green unit beads, ten blue tens, ten red hundreds, and ten green thousands. It is a big step toward abstraction — with the golden beads a thousand was a heavy cube of a thousand beads, but here one single bead stands for a thousand because of the wire it sits on.',
    materialsNeeded: [
      'Small bead frame (or the virtual bead frame on this site, set to Small)',
      'Paper and pencil for writing the numbers you build',
      'Homemade notation paper: turn a sheet sideways and draw four columns labeled 1, 10, 100, and 1,000',
      'Household substitute: string 4 rows of 10 beads (green, blue, red, green) on pipe cleaners stretched across a shoebox lid',
    ],
    virtualMaterials: ['bead-frame'],
    prerequisites: ['stamp-game-addition'],
    directAims: [
      'Understand that a bead’s value comes from the wire it sits on: one bead can be worth one, ten, one hundred, or one thousand',
      'Build and read any number up to 9,999 on the frame',
      'Exchange ten beads on one wire for one bead on the wire below, in both directions',
    ],
    indirectAims: [
      'Prepare for column addition and subtraction on paper, where a digit’s value also comes from its position',
      'Move the child from counting quantities to reading positions — the heart of abstraction',
    ],
    presentation: [
      {
        text: 'Sit beside your child with the frame flat on the table, all beads resting on the left. Run a finger down the labels on the frame’s edge.',
        say: 'This is the small bead frame.',
      },
      {
        text: 'Point to the top wire and its green beads. Slide one bead to the right with one finger.',
        say: 'This wire holds units. One bead here is one.',
      },
      {
        text: 'Slide unit beads across one at a time, counting together, until all ten are on the right.',
        say: 'One, two, three … ten. Ten units!',
      },
      {
        text: 'Show the exchange: slide all ten unit beads back to the left, then slide one blue bead on the second wire to the right.',
        say: 'Ten units are the same as one ten. We trade them.',
      },
      {
        text: 'Repeat down the frame: count ten tens, trade them for one red hundred; count ten hundreds, trade them for one green thousand. Pause at the gray band.',
        say: 'Ten hundreds are one thousand. See how the thousand sits on the gray band? It starts a new family.',
      },
      {
        text: 'Build a number together, for example 2,536: slide 2 thousands, 5 hundreds, 3 tens, 6 units. Read it from the bottom wire up, then all together.',
        say: 'Two thousands, five hundreds, three tens, six units — two thousand five hundred thirty-six.',
      },
      {
        text: 'Say a few numbers and let your child build them. Then trade roles: your child builds a secret number and you read it aloud.',
      },
      {
        text: 'Show how to write a built number on the notation paper, one digit under each column heading, and read it back while touching each wire.',
        say: 'The paper says the same thing the frame does.',
      },
    ],
    pointsOfInterest: [
      'One small bead "worth a thousand" feels astonishing after carrying the heavy golden thousand-cube',
      'The soft click of beads sliding along the wire',
      'The gray band marking where the thousands family begins',
      'Numbers with a zero in them — a wire that stays completely still',
    ],
    controlOfError: [
      'A finished number can never keep ten beads on one wire — a full wire must be exchanged before the number can be read',
      'Reading the number back aloud, wire by wire, reveals any wire built wrong',
      'On the virtual frame, Make-a-number mode checks each wire and marks it right or wrong — just like comparing against written figures',
    ],
    vocabulary: ['bead frame', 'abacus', 'wire', 'units', 'tens', 'hundreds', 'thousands', 'exchange', 'place value'],
    variations: [
      'Dictate numbers for your child to build, starting with two wires and working up to all four',
      'Build a number and have your child write it; then reverse — you write, they build',
      'Include numbers with zeros (3,052 or 4,007) — the silent wire is the interesting part',
    ],
    extensions: [
      'Count from 1 up to 100 on the frame, performing the exchange every time the units wire fills',
      'Ask for the largest number the frame can show (9,999) and the smallest (1), and talk about why',
    ],
    whatComesNext:
      'Once your child can build and read four-digit numbers with ease, move on to Small Bead Frame Addition, where the frame adds big numbers and every carry becomes a bead exchange you can watch.',
    followUpWork: [
      {
        description:
          'Print a place-value worksheet and have your child write each number’s digits in labeled columns, then build two or three of them on the frame to check their own work.',
        worksheetSlug: 'place-value',
      },
      {
        description:
          'Number dictation: say four or five numbers between 1,000 and 9,999 at the kitchen table. Your child writes each one, builds it on the frame, and reads it back to you.',
      },
    ],
  },
  {
    slug: 'small-bead-frame-addition',
    name: 'Small Bead Frame Addition',
    strand: 'abstraction',
    sequence: 7,
    ages: [6, 8],
    grades: '1–2',
    overview:
      'The frame now earns its keep: four-digit addition where every carry is a real event — a wire fills up, ten beads slide back, and one bead comes forward on the wire below. This is the bridge between the stamp game and column addition done entirely on paper.',
    materialsNeeded: [
      'Small bead frame (or the virtual bead frame on this site, set to Small, Addition mode)',
      'Paper and pencil, with problems written in columns',
      'Homemade notation paper with columns labeled 1, 10, 100, 1,000',
    ],
    virtualMaterials: ['bead-frame'],
    prerequisites: ['small-bead-frame-intro'],
    directAims: [
      'Add four-digit numbers on the frame, including sums that require carrying',
      'Perform the exchange ceremony: when a wire fills with ten beads, slide all ten back and bring one bead forward on the wire below',
      'Connect each exchange on the frame to the little carried "1" written in column addition',
    ],
    indirectAims: [
      'Prepare for fully abstract column addition with no material at all',
      'Build the habit of working one place at a time, units first',
    ],
    presentation: [
      {
        text: 'Write a problem in columns on paper, for example 2,647 + 1,585. Choose one that needs several carries.',
        say: 'Let’s add these on the frame.',
      },
      {
        text: 'Build the first number on the frame: 2 thousands, 6 hundreds, 4 tens, 7 units slid to the right.',
        say: 'The frame says two thousand six hundred forty-seven.',
      },
      {
        text: 'Point to the units digit of the second number on the paper. Begin sliding 5 more units to the right — but the wire runs out after 3.',
        say: 'We need five more units, but the wire is full. Ten units are one ten!',
      },
      {
        text: 'Do the exchange: slide all ten unit beads back to the left and bring one blue ten forward. Then slide the last 2 units across.',
        say: 'We traded ten units for one ten. Now the last two units.',
      },
      {
        text: 'Continue with the tens: add 8 tens, exchanging again when the wire fills. Then the hundreds, then the thousands, exchanging whenever a wire fills.',
      },
      {
        text: 'Read the answer off the frame, bottom wire up, and write it under the line on the paper: 4,232.',
        say: 'Four thousand two hundred thirty-two.',
      },
      {
        text: 'Look back at the written problem together and point to a carried 1.',
        say: 'This little one we write when we carry — that was our exchange. It is one ten we sent to the next wire.',
      },
    ],
    pointsOfInterest: [
      'The moment a wire runs out of beads mid-count — the problem simply cannot go on without an exchange',
      'Watching ten beads collapse into a single bead on the wire below',
      'Discovering that the carried "1" on paper and the exchanged bead are the same thing',
    ],
    controlOfError: [
      'A wire physically holds only ten beads, so a needed carry can never be skipped',
      'Working the same problem on paper gives a number to check against the frame — if they disagree, redo one wire at a time',
      'The virtual frame refuses slides that are too big and enables each wire’s Exchange button only when that wire is truly full',
    ],
    vocabulary: ['addend', 'sum', 'carry', 'exchange', 'column', 'place'],
    variations: [
      'Start with static addition (no carries), such as 2,341 + 1,423, before introducing exchanges',
      'Subtraction on the frame: build the larger number and slide beads back to the left, trading one bead from the wire below for ten beads when a wire runs empty — borrowing made visible',
      'Let your child write the problem, you work the frame, and they catch your (deliberate) mistakes',
    ],
    extensions: [
      'Add three four-digit numbers in a row, carrying as needed',
      'Have your child write their own problems, predict which wires will need an exchange, then prove it on the frame',
    ],
    whatComesNext:
      'When carries feel routine, present The Large Bead Frame, which extends the same idea across seven wires to the millions — and after that, the checkerboard takes on long multiplication.',
    followUpWork: [
      {
        description:
          'Print a sheet of multi-digit addition problems. Your child solves them in pencil first, then checks two or three answers by working the same problems on the frame.',
        worksheetSlug: 'multi-digit-ops',
      },
      {
        description:
          'Carry hunt: on a finished worksheet page, have your child circle every carried "1" and say aloud which exchange it stands for ("ten units became one ten").',
      },
    ],
  },
  {
    slug: 'large-bead-frame',
    name: 'The Large Bead Frame',
    strand: 'abstraction',
    sequence: 8,
    ages: [7, 10],
    grades: '2–4',
    overview:
      'The large bead frame stretches the small frame’s idea across seven wires, from units all the way to one million. Children who have added on the small frame get to read, build, and calculate with truly big numbers — and discover that the same rules simply repeat, family after family.',
    materialsNeeded: [
      'Large bead frame (or the virtual bead frame on this site, set to Large)',
      'Paper and pencil',
      'Homemade notation paper: seven columns labeled 1, 10, 100, 1,000, 10,000, 100,000, 1,000,000',
      'The small bead frame for a side-by-side comparison, if you have one',
    ],
    virtualMaterials: ['bead-frame'],
    prerequisites: ['small-bead-frame-addition'],
    directAims: [
      'Read, build, and write numbers up to 9,999,999 on the frame',
      'Recognize the families of the decimal system: units, tens, hundreds repeat as thousands and again at the millions',
      'Add and subtract large numbers, exchanging across any of the seven wires',
    ],
    indirectAims: [
      'Prepare for long multiplication on the checkerboard and for fully abstract work with large numbers',
      'Give a felt sense of magnitude — how much bigger a million is than a thousand',
    ],
    presentation: [
      {
        text: 'Set the large frame beside the small one (or switch the virtual frame to Large) and compare them top to bottom.',
        say: 'Same frame, more wires. Everything you know still works here.',
      },
      {
        text: 'Point out the bands along the edge: white behind units, tens, hundreds; gray behind the thousands wires; black behind the millions wire.',
        say: 'White is the units family, gray is the thousands family, and black begins the millions family. Green, blue, red — then green, blue, red again.',
      },
      {
        text: 'Slide one bead on each wire from top to bottom, reading each value: one, ten, one hundred, one thousand, ten thousand, one hundred thousand …',
        say: 'One bead here is one million.',
      },
      {
        text: 'Reset, then build 1,000,000 with a single bead. Ask how long it would take to count a million by ones — this single quiet bead holds all of that.',
      },
      {
        text: 'Build a large number such as 2,435,061 wire by wire and read it together. Point out that the empty hundreds wire is the zero.',
        say: 'Two million, four hundred thirty-five thousand, sixty-one.',
      },
      {
        text: 'Write the number on paper and show that the commas fall exactly where the bands change — after the millions family and after the thousands family.',
        say: 'The commas on paper are the bands on the frame.',
      },
      {
        text: 'Work an addition with exchanges reaching into the new wires, for example 456,789 + 543,211, exchanging wire by wire and reading the sum: 1,000,000.',
      },
    ],
    pointsOfInterest: [
      'A single bead standing for one million',
      'The bands showing exactly where the commas belong in a written number',
      'Carries that ripple all the way up the frame, wire after wire, from one small addition',
      'Zeros inside big numbers — wires that never move',
    ],
    controlOfError: [
      'Each wire still holds only ten beads, so every needed exchange announces itself',
      'Reading a number aloud family by family exposes a wire built wrong',
      'The written problem on paper and the frame must agree; the virtual frame’s Make-a-number check marks each wire',
    ],
    vocabulary: ['ten-thousands', 'hundred-thousands', 'million', 'family', 'period', 'comma', 'magnitude'],
    variations: [
      'Dictate seven-digit numbers, including ones with several zeros, for your child to build and write',
      'Subtraction with borrowing across empty wires — watch a borrow travel down through a zero',
      'Build 25, then 250, then 2,500, then 25,000: watch the same two beads step down the frame as the number grows tenfold',
    ],
    extensions: [
      'Multiply on the frame by repeated addition: 3 × 2,314 is 2,314 added three times, exchanges and all',
      'Find numbers in the newspaper or an atlas (city populations, distances in miles) and build them on the frame',
    ],
    whatComesNext:
      'With big numbers tamed, your child is ready for the checkerboard: Introduction to the Checkerboard presents long multiplication, where these same place-value families become rows and columns of bead bars.',
    followUpWork: [
      {
        description:
          'Print a place-value worksheet with large numbers. Your child writes each number in expanded form (2,435,061 = 2,000,000 + 400,000 + …), then builds a few on the frame to verify.',
        worksheetSlug: 'place-value',
      },
      {
        description:
          'Print multi-digit addition and subtraction problems with five- and six-digit numbers. Your child computes in pencil, then proves one or two answers on the large frame.',
        worksheetSlug: 'multi-digit-ops',
      },
      {
        description:
          'Million hunt: together, list five real quantities near a thousand, a hundred thousand, and a million (people, miles, dollars), write them with commas, and read them aloud family by family.',
      },
    ],
  },
]
