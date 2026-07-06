import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'cards-and-counters',
    name: 'Cards & Counters and Odd/Even',
    strand: 'numbers-to-10',
    sequence: 2,
    ages: [4, 5],
    grades: 'PK',
    overview:
      'Your child lays the numeral cards 1 through 10 in order and counts exactly 55 counters beneath them in pairs. It is the classic test of whether counting to ten is truly secure — and the doorway to odd and even numbers.',
    materialsNeeded: [
      'Numeral cards 1–10 (write them on index cards or squares of cardstock)',
      'Exactly 55 identical small counters — buttons, pennies, dried beans, or bottle caps all work; count them out together before you start',
      'A small bowl or dish to hold the counters',
      'A rug, tray, or cleared table space where the whole row of ten cards fits',
    ],
    virtualMaterials: ['cards-and-counters'],
    prerequisites: ['bead-stair-intro'],
    directAims: [
      'Confirm that the sequence and quantities 1 through 10 are secure',
      'Pair each written numeral with its exact quantity, counted out one object at a time',
      'Discover odd and even numbers through the pattern the counters make',
    ],
    indirectAims: [
      'Reinforce one-to-one correspondence and careful, exact counting',
      'Prepare for skip counting, multiples, and — much later — divisibility',
      'Build the habit of working left to right in order, as reading and arithmetic both demand',
    ],
    presentation: [
      {
        text: 'Before the lesson, count out exactly 55 counters into the bowl together. Shuffle the numeral cards into a loose pile beside the workspace.',
        say: 'We have one bowl of counters — just enough, if we count carefully.',
      },
      {
        text: 'Ask your child to find the card that comes first and lay it at the top left of the workspace.',
        say: 'Which card comes first? Yes — one. Lay it here at the top.',
      },
      {
        text: 'Continue card by card until all ten are laid in a row in order, 1 through 10, with space below each. Read the row together, pointing to each card.',
        say: 'One, two, three… let’s read them all the way to ten.',
      },
      {
        text: 'Return to the 1. Ask your child to read the card, then place that many counters below it, one at a time from the bowl.',
        say: 'This card says one. Put one counter under it.',
      },
      {
        text: 'Under the 2, show how the counters sit side by side as a pair. Under the 3, a pair with one counter alone below it, in the middle. From then on your child continues alone: pairs from the top down, any leftover counter centered at the bottom.',
        say: 'Two counters make a pair. Three is a pair — and one more, all by itself.',
      },
      {
        text: 'Let your child work down the whole row. When the 10 is finished, the bowl should be exactly empty. If counters are left over or run out early, simply invite a recount of each card — the material shows the error; you do not need to.',
        say: 'The bowl is empty and every card is full. We counted exactly right.',
      },
      {
        text: 'For odd and even, slide one finger slowly from below up between the counters under the 2 — it passes straight through the middle. Then try the 3 — the lone counter at the bottom blocks the way.',
        say: 'Under two, my finger glides right through. Two is even. Under three, this counter is in the way. Three is odd.',
      },
      {
        text: 'Walk the row together trying every card, sorting aloud as you go: 2, 4, 6, 8, 10 let the finger pass; 1, 3, 5, 7, 9 block it.',
        say: 'These numbers are even. These numbers are odd.',
      },
      {
        text: 'On another day, ask your child to show you an odd number, then an even one; later, point to a card and ask which it is.',
        say: 'Can you show me an even number? Which kind is seven?',
      },
    ],
    pointsOfInterest: [
      'The bowl coming out exactly empty on the very last counter',
      'The lone bottom counter that blocks a finger under every odd number',
      'The alternating pattern down the row: odd, even, odd, even…',
      'Reading the shuffled cards and hunting for the one that comes next',
    ],
    controlOfError: [
      'The supply of exactly 55 counters: one wrong count anywhere and the child runs out early or has counters left over at the end',
      'The visual pattern — a missing or extra counter breaks the tidy pairs',
      'The row of cards reads left to right; a card out of sequence looks and sounds wrong when read aloud',
    ],
    vocabulary: ['odd', 'even', 'pair', 'counter'],
    variations: [
      'Deal the cards out in random spots and have your child put them in order before any counters come out',
      'Use different counters each time — acorns in fall, buttons, shells — always counted to exactly 55',
      'Have your child close their eyes while you make one card wrong, then find the mistake by recounting',
    ],
    extensions: [
      'Odd-and-even hunt around the house: count shoes by the door, forks at dinner, chair legs — pair them up and say whether the count is odd or even',
      'Touch only the even cards and read them aloud — 2, 4, 6, 8, 10 — your child’s first skip counting',
      'Ask what happens when one more counter joins an even number, then check with the material',
    ],
    whatComesNext:
      'With counting to ten secure, your child is ready to cross into the teens: the Teen Board introduction (Seguin Board A) shows how ten and some more make eleven through nineteen. Around the same age, many children also begin the Golden Beads introduction, where they first hold a unit, a ten, a hundred, and a thousand.',
    followUpWork: [
      {
        description:
          'Print a numeral tracing sheet and let your child trace and then copy the figures 1 through 10 — writing the symbols is the natural partner to laying them out.',
        worksheetSlug: 'numeral-tracing',
      },
      {
        description:
          'Have your child write the numbers 1 to 10 down the edge of a sheet of paper and draw the counter pattern next to each — dots in pairs, odd dot centered at the bottom — then circle every odd number.',
      },
      {
        description:
          'Count small collections on paper: spoons, crayons, socks. Your child writes the number, draws the objects in pairs, and writes “odd” or “even” beside each count.',
      },
    ],
  },
]
