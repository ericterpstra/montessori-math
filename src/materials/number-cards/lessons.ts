import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'number-cards-intro',
    name: 'Introduction to the Number Cards',
    strand: 'decimal-system',
    sequence: 2,
    ages: [4, 6],
    grades: 'PK–K',
    overview:
      'Your child has already held one golden bead and hefted a cube of one thousand; now they meet the written symbols 1, 10, 100, and 1000. This short naming lesson attaches numerals to the quantities they already know with their hands.',
    materialsNeeded: [
      'The four large number cards: 1, 10, 100, and 1000. No special set needed — cut four cards from an index card or cereal box, each one digit wider than the last, and write 1 in green marker, 10 in blue, 100 in red, and 1000 in green.',
      'A small mat, tray, or dish towel to lay the cards on.',
      'The golden bead quantities for pairing if you have them — one bead, a ten-bar, a hundred-square, and a thousand-cube (the virtual Golden Beads on this site can stand in).',
    ],
    virtualMaterials: ['number-cards', 'golden-beads'],
    prerequisites: ['golden-beads-intro'],
    directAims: [
      'Learn the written symbols for 1, 10, 100, and 1000 and their names.',
      'Meet the color code of the decimal system: green for units, blue for tens, red for hundreds, and green again for thousands.',
      'Notice that each place adds one more zero.',
    ],
    indirectAims: [
      'Prepare for pairing symbol with quantity in the formation of numbers.',
      'Prepare for composing large numbers by stacking cards.',
      'Build the habit of reading a number by looking at its places, which underlies all later written arithmetic.',
    ],
    presentation: [
      {
        text: 'Invite your child to the table and lay the four cards in a row, 1 on the right and 1000 on the left, just as places sit in a written number.',
        say: 'I have some new cards to show you today.',
      },
      {
        text: 'Point to the 1 card and name it. Let your child trace the numeral with a finger.',
        say: 'This is one.',
      },
      {
        text: 'Point to the 10 card. Trace the 1 and then the 0, counting the zeros aloud.',
        say: 'This is ten. Ten has one zero.',
      },
      {
        text: 'Point to the 100 card and trace it the same way.',
        say: 'This is one hundred. One hundred has two zeros.',
      },
      {
        text: 'Point to the 1000 card and trace it.',
        say: 'This is one thousand. One thousand has three zeros — see how long the card is?',
      },
      {
        text: 'Second period — play with the names. Mix the cards up on the mat and give little commands, one at a time, many times over: show me, point to, hand me, put it by the window. This game is where the learning happens, so stay here as long as it is fun.',
        say: 'Show me ten. Now put one hundred on my hand.',
      },
      {
        text: 'Third period — only if the second period went easily. Point to one card at a time and let your child name it. If they hesitate, cheerfully go back to the show-me game another day.',
        say: 'What is this?',
      },
      {
        text: 'If you have golden beads, lay the matching quantity under each card: one bead under 1, a ten-bar under 10, a hundred-square under 100, a thousand-cube under 1000.',
        say: 'One bead — and this card says one.',
      },
    ],
    pointsOfInterest: [
      'Each card is one digit longer than the last — they make a little staircase when lined up.',
      'The colors change with the place: green, blue, red, then green again.',
      'Counting the zeros to tell the cards apart.',
    ],
    controlOfError: [
      'The number of zeros on each card tells your child which is which.',
      'The colors of the numerals confirm the place.',
      'When paired with the golden beads, a mismatch is obvious — a single bead under the 1000 card looks plainly wrong.',
    ],
    vocabulary: ['unit', 'ten', 'hundred', 'thousand'],
    variations: [
      'For a younger child, present only 1 and 10 the first day and add 100 and 1000 later in the week.',
      'Play the fetching game at a distance: place the cards across the room and ask your child to walk over and bring back the one you name.',
      'Trade roles — your child gives the commands and you point (and occasionally get it charmingly wrong for them to correct).',
    ],
    extensions: [
      'Zero hunt: write 1, 10, 100, and 1000 on paper and have your child circle and count the zeros in each.',
      'Card-and-quantity memory: lay the four cards face down next to the four bead quantities and let your child match them from memory.',
    ],
    whatComesNext:
      'When your child can name all four cards easily, move to the Formation of Numbers with the golden beads (lesson 3 in this strand), where quantities and cards finally come together — and after that, the full bird’s-eye layout of every card from 1 to 9,000.',
    followUpWork: [
      {
        description:
          'Have your child copy the numerals 1, 10, 100, and 1000 with crayons in the Montessori colors — green, blue, red, green — saying each name aloud as they write.',
      },
      {
        description:
          'Print a place-value practice page and have your child match numerals to place names with a pencil.',
        worksheetSlug: 'place-value',
      },
    ],
  },
  {
    slug: 'number-cards-birds-eye',
    name: "The Bird's-Eye View: 1 to 9,000",
    strand: 'decimal-system',
    sequence: 4,
    ages: [4, 7],
    grades: 'PK–1',
    overview:
      'All thirty-six number cards are laid out in one grand grid so your child sees the whole decimal system at a glance — then learns the trick at its heart: stacking cards so 3000, 200, 50, and 1 read as 3,251.',
    materialsNeeded: [
      'A full set of large number cards, 1–9 in green, 10–90 in blue, 100–900 in red, and 1000–9000 in green. Make your own from index cards or card stock: units one digit wide, tens two, hundreds three, thousands four, so the widths nest when stacked.',
      'A large clear workspace — a rug or the kitchen floor works better than a table for the full layout.',
      'Pencil and paper for the follow-up writing games.',
    ],
    virtualMaterials: ['number-cards'],
    prerequisites: ['number-cards-intro', 'golden-beads-formation'],
    directAims: [
      'Read and compose numbers up to 9,999 from place-value cards.',
      'Move fluently between expanded form (3000 + 200 + 50 + 1) and standard form (3,251).',
      'Discover the role of zero as a placeholder — in 4,053 no hundreds card is used, and the zero of the 4000 card shows through.',
    ],
    indirectAims: [
      'Prepare for the four operations with golden beads, where these cards label every quantity.',
      'Prepare for writing numbers in expanded form with pencil and paper.',
      'Give a first felt sense that our whole number system is built from just nine digits and the places they sit in.',
    ],
    presentation: [
      {
        text: 'Build the layout together, one column at a time. Start at the right: lay the unit cards 1 through 9 in a column, reading each as you place it. Then the tens to their left, then the hundreds, then the thousands.',
        say: 'Let’s lay out every card we have. One, two, three… ten, twenty, thirty…',
      },
      {
        text: 'Step back and admire the whole grid — this is the bird’s-eye view. Read a column top to bottom while your child points; notice the colors and the growing widths.',
        say: 'Look — here is every number card there is, from one all the way to nine thousand.',
      },
      {
        text: 'Ask your child to fetch four cards, naming them one at a time: three thousand, two hundred, fifty, one. Lay them side by side in a row.',
        say: 'Bring me three thousand. Now two hundred. Now fifty. Now one.',
      },
      {
        text: 'Stack the cards with the largest on the bottom, tapping the right edges so they line up. Turn the stack to face your child and read it.',
        say: 'Watch this. Three thousand, two hundred, fifty, one… three thousand two hundred fifty-one!',
      },
      {
        text: 'Slide the cards apart into a row again, then restack them. Do it slowly a few times — apart, together, apart, together. This is the magic of the lesson; let your child do the sliding.',
        say: 'We can take the number apart… and put it back together.',
      },
      {
        text: 'Now your child builds. Say a number in parts and let them fetch and stack: for example six thousand, three hundred, twenty, five. Later, say it as one number — six thousand three hundred twenty-five — and see if they can find the parts themselves.',
        say: 'Can you build six thousand, three hundred, twenty, and five?',
      },
      {
        text: 'Show a number with a zero in it. Build 4,053: four thousand, fifty, three — no hundreds card at all. Stack it and point to the zero that peeks through from the 4000 card.',
        say: 'There is no hundreds card here — so the zero holds that place for us.',
      },
    ],
    pointsOfInterest: [
      'Sliding the stack apart and snapping it back together feels like a magic trick.',
      'The zeros of the big cards peeking through wherever no smaller card sits.',
      'The full layout itself — children love seeing every card at once and often want to rebuild it alone.',
    ],
    controlOfError: [
      'If the right edges are not lined up, the stacked number plainly reads wrong.',
      'Taking the stack apart shows exactly which cards were used — the expanded and stacked views must agree.',
      'The place colors: a blue digit appearing where the red hundreds digit belongs signals a misplaced card.',
    ],
    vocabulary: ['thousands', 'hundreds', 'tens', 'units', 'place', 'zero', 'expanded form'],
    variations: [
      'Fetch across the room: keep the layout on the rug and the building spot on the table so your child carries each card, holding the number in mind as they walk.',
      'Greatest and smallest: give four cards, one from each column, and ask for the biggest number they can build, then the smallest.',
      'Quiet solo work: let your child rebuild the whole bird’s-eye layout alone — placing all 36 cards in order is a complete work in itself.',
    ],
    extensions: [
      'Write it down: after stacking a number, your child copies both forms on paper — 3000 + 200 + 50 + 1 = 3251.',
      'Pair with the golden beads: build the quantity on a tray, then build the matching card stack, and check that beads and cards tell the same story.',
      'Zero detective: build 4,053, 4,503, and 4,530 in turn and talk about how the same cards land in different places.',
    ],
    whatComesNext:
      'Your child is ready for the great work of the decimal system: addition with the golden beads (lesson 5 in this strand), where two families each build a number with cards and beads and combine them into one grand total.',
    followUpWork: [
      {
        description:
          'Print a place-value worksheet and have your child write numbers in expanded form and rebuild expanded forms into standard numbers with a pencil.',
        worksheetSlug: 'place-value',
      },
      {
        description:
          'Secret-number notes: write a number such as 6,208 on a slip of paper; your child writes its parts (6000 + 200 + 8) underneath. Then swap — they write the secret number and you expand it, with mistakes for them to catch.',
      },
      {
        description:
          'Colored-pencil numbers: your child writes a four-digit number with each digit in its place color — green thousands, red hundreds, blue tens, green units — and reads it aloud.',
      },
    ],
  },
]
