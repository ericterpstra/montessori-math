import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'teen-board-intro',
    name: 'Teen Board: Names of the Teens',
    strand: 'linear-counting',
    sequence: 1,
    ages: [4, 6],
    grades: 'PK–K',
    overview:
      'Your child learns the names and numerals of eleven through nineteen by sliding unit cards over the printed tens of the Seguin board. This is where counting past ten begins, right after the colored bead stair.',
    materialsNeeded: [
      'Seguin Board A: a board or two card-stock strips with "10" written nine times in a column',
      'Nine unit cards numbered 1–9, each cut so it exactly covers the zero (index cards work well)',
      'A clear table or floor mat where the board can lie flat in front of the child',
    ],
    virtualMaterials: ['teen-board'],
    prerequisites: ['bead-stair-intro'],
    directAims: [
      'Learn the names of the numbers 11–19',
      'Connect each teen name to its written numeral',
      'See that every teen numeral is a ten with a unit written over the zero',
    ],
    indirectAims: [
      'First taste of place value: reading a numeral as "a ten and some more"',
      'Preparation for the Ten Board (Seguin B) and counting to 100',
      'Practice keeping a sequence in order from top to bottom',
    ],
    presentation: [
      {
        text: 'Sit beside your child with the board flat on the table and the unit cards stacked in order nearby. Point to the top slat and read it together.',
        say: 'This says ten.',
      },
      {
        text: 'Take the 1 card and slide it slowly over the zero of the top slat, so your child watches the 10 become 11.',
        say: 'Now it says eleven. Eleven is ten and one.',
      },
      {
        text: 'Slide the card off so the slat reads 10 again, then slide it back on. Invite your child to do the same — the transformation is the whole show.',
      },
      {
        text: 'Move to the second slat and place the 2 card over its zero.',
        say: 'This is twelve. Twelve is ten and two.',
      },
      {
        text: 'Do the same with the 3 card on the third slat.',
        say: 'This is thirteen. Thirteen is ten and three.',
      },
      {
        text: 'Now teach those three names in three periods. First name each number while pointing. Then mix the cards and ask your child to point: "Show me twelve." Only when pointing is quick and easy, point yourself and ask, "What is this?"',
        say: 'Show me twelve. Show me eleven. What is this?',
      },
      {
        text: 'Stop while it is still fun. On later days continue with 14 through 19, three at a time, always beginning with a quick review of the numbers already learned.',
      },
      {
        text: 'When all nine cards are familiar, invite your child to build the whole board from top to bottom and read it like a list.',
        say: 'Eleven, twelve, thirteen, fourteen…',
      },
    ],
    pointsOfInterest: [
      'The moment the zero disappears under the card and 10 turns into 14',
      'The 1 never moves — only the second digit changes down the whole board',
      'The strange names: "eleven" and "twelve" hide their ten, while "fourteen" nearly says it out loud',
    ],
    controlOfError: [
      'Reading down the board out loud: a card in the wrong slat breaks the counting sequence, and the child can hear it',
      'On the virtual board, a quiet check mark appears beside a row when its card sits in the right place — like a teacher\'s pencil mark, nothing more',
    ],
    vocabulary: [
      'eleven',
      'twelve',
      'thirteen',
      'fourteen',
      'fifteen',
      'sixteen',
      'seventeen',
      'eighteen',
      'nineteen',
    ],
    variations: [
      'Build the board from the bottom up, counting backward from nineteen',
      'Shuffle the cards and hand them over one at a time in random order for your child to place',
      'Say a teen number out loud and let your child build it with the right card',
    ],
    extensions: [
      'Hunt for teen numbers around the house: the clock, a calendar, page numbers, prices in a grocery flyer',
      'Count a pile of buttons or dry beans past ten, then write the total',
    ],
    whatComesNext:
      'When the names and numerals are steady, move to "Teen Board with Beads: 11–19," where each numeral meets its real quantity — a golden ten-bar plus a colored bead bar. After that comes the Ten Board (Seguin B), which names 10 through 90 the same way.',
    followUpWork: [
      {
        description:
          'Print a teens practice page: your child traces and writes the numerals 11–19 and fills in the missing numbers in short counting sequences.',
        worksheetSlug: 'teens-tens',
      },
      {
        description:
          'On plain paper, write prompts like "10 and 4 make ___". Your child builds the number on the board first, then writes the numeral in pencil.',
      },
      {
        description:
          'Make a paper teen board together: one strip of card with "10" written nine times and nine small unit cards, so your child can practice away from any screen.',
      },
    ],
  },
  {
    slug: 'teen-board-with-beads',
    name: 'Teen Board with Beads: 11–19',
    strand: 'linear-counting',
    sequence: 2,
    ages: [4, 6],
    grades: 'PK–K',
    overview:
      'Quantity meets symbol: beside each numeral on the board, your child lays one golden ten-bar plus the colored bead bar that matches, and discovers that 14 really is ten-and-four you can hold and count.',
    materialsNeeded: [
      'Seguin Board A and the unit cards 1–9 from the previous lesson',
      'Nine golden ten-bars (or nine pipe cleaners strung with ten beads each, or strips of ten dry beans glued to card)',
      'One colored bead bar of each size 1–9 (pipe-cleaner bars work — keep each size its own consistent color)',
    ],
    virtualMaterials: ['teen-board'],
    prerequisites: ['teen-board-intro'],
    directAims: [
      'Associate the quantities eleven through nineteen with their numerals',
      'Count from 11 to 19 with real objects, one bead at a time',
      'Understand each teen number as one ten plus some units',
    ],
    indirectAims: [
      'Foundation for place value and the golden bead work of the decimal system',
      'Preparation for addition: "ten and four make fourteen" is felt before it is ever written',
      'Preparation for the Ten Board and counting to 99',
    ],
    presentation: [
      {
        text: 'Lay one golden ten-bar beside the top slat of the board. Count its beads together, touching each one.',
        say: 'One, two, three… ten. This bar is ten.',
      },
      {
        text: 'Slide the 1 card over the zero so the slat reads 11, then lay the single red bead next to the ten-bar.',
        say: 'Ten and one make eleven.',
      },
      {
        text: 'Count every bead in the row from the beginning — all ten on the bar, then the one — touching each bead as you go.',
        say: '…nine, ten, eleven. Eleven!',
      },
      {
        text: 'Move down a row. Slide the 2 card over the zero, lay a fresh ten-bar and the green two-bar beside it, and count to twelve together.',
        say: 'Ten and two make twelve.',
      },
      {
        text: 'Invite your child to build the next rows: for each one, the card, one golden ten-bar, and the colored bar that matches the card. Continue as far as their interest lasts.',
      },
      {
        text: 'Ask your child to check a row: count the beads out loud, then read the numeral. Do they say the same number?',
        say: 'Count the beads. Does it match what the board says?',
      },
      {
        text: 'Another day, reverse the game: lay out a ten-bar and a colored bar first, and ask your child to build the numeral that matches the beads.',
      },
    ],
    pointsOfInterest: [
      'Each colored bar is its own color and length, so the row for 19 looks strikingly longer than the row for 11',
      'The colored bar has exactly as many beads as the number on the card — no more, no fewer',
      'The golden ten-bar is identical in every row; only the little colored bar changes',
    ],
    controlOfError: [
      'Counting the beads and reading the numeral must give the same number; if they disagree, something in the row needs fixing',
      'The colored bars have fixed lengths — a five-bar simply cannot be counted as six',
      'On the virtual board, a check mark appears beside a row only when the bead quantity equals the numeral shown',
    ],
    vocabulary: ['ten-bar', 'bead bar', 'quantity', 'match', 'teen'],
    variations: [
      'Build a row with a deliberate mistake (wrong bar or wrong card) and let your child find it by counting',
      'Build the rows out of order — beads for 16 first — and read whatever appears',
      'Say a number like "fifteen" and have your child build both the card and the beads from scratch',
    ],
    extensions: [
      'Count out 14 dry beans, put ten of them in a cup, and see the "ten and four" sitting on the table',
      'Draw a teen number as a picture: one long bar of ten circles plus loose circles for the units',
    ],
    whatComesNext:
      'When your child can build and read 11–19 with beads confidently, continue to the Ten Board (Seguin B) lessons, where the same card trick names 10, 20, 30 … 90, and then to counting every number from 11 to 99 with beads.',
    followUpWork: [
      {
        description:
          'Print a teens practice sheet: your child counts pictured ten-bars and unit beads, then writes the matching teen numeral in pencil.',
        worksheetSlug: 'teens-tens',
      },
      {
        description:
          'On paper, write prompts like "10 + __ = 13". Your child lays out the beads, counts, and fills in the blank.',
      },
      {
        description:
          'Bean counting: scoop a small handful of dry beans (somewhere between 10 and 19), group ten of them together, and write the total as a numeral.',
      },
    ],
  },
]
