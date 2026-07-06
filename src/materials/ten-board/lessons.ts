import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'ten-board-intro',
    name: 'Ten Board: Names of the Tens',
    strand: 'linear-counting',
    sequence: 3,
    ages: [5, 7],
    grades: 'K–1',
    overview:
      'The Ten Board (Seguin Board B) gives the tens their names — twenty, thirty, forty, all the way to ninety — and shows that each one is simply that many ten-bars. It follows the Teen Board and opens the door to counting to 99.',
    materialsNeeded: [
      'Seguin Ten Board (Board B): two wooden boards printed 10, 20, 30 … 90 — or nine index cards with the tens written large in black marker',
      '45 golden ten-bars — or 45 bundles of ten (ten dried beans in a small bag, ten craft sticks rubber-banded, or ten straws bundled) so each “ten” is one graspable thing; nine are enough if you build one row at a time',
      'A work mat, tray, or tea towel to define the workspace',
    ],
    virtualMaterials: ['ten-board'],
    prerequisites: ['teen-board-with-beads'],
    directAims: [
      'Learn the names of the tens: ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety',
      'Connect each name with its quantity (that many ten-bars) and its written symbol (10, 20, … 90)',
    ],
    indirectAims: [
      'Preparation for counting to 99 and for the Hundred Board',
      'A first feel for place value: the tens digit counts whole tens, and the zero holds the units place',
      'Preparation for skip counting by ten, the seed of multiplication',
    ],
    presentation: [
      {
        text: 'Invite your child to carry the boards and the ten-bars to the mat with you. Lay one golden ten-bar at the top of the mat and count its beads together, touching each one.',
        say: 'This is ten.',
      },
      {
        text: 'Lay a second ten-bar beside the first. Point to the pair.',
        say: 'Two tens. We call this twenty.',
      },
      {
        text: 'Add a third bar and name it, then a fourth. Let your child count the bars each time before you give the name.',
        say: 'Three tens — thirty. Four tens — forty.',
      },
      {
        text: 'Give a three-period lesson on the new names. First name each quantity yourself, then ask your child to act: “Show me thirty.” “Point to twenty.” Mix up the piles and ask again. Only when that is easy, point to a pile and ask what it is called.',
        say: 'Show me thirty. … Now point to forty. … What is this one called?',
      },
      {
        text: 'Bring out the boards. Run your finger down the column of printed numbers and read them slowly together.',
        say: 'Ten, twenty, thirty, forty, fifty, sixty, seventy, eighty, ninety.',
      },
      {
        text: 'Now marry quantity to symbol: ask your child to lay the right number of ten-bars beside each row of the board — one bar next to 10, two bars next to 20, and so on down the board. A full set of 45 bars makes a staircase down the whole board; with only nine bars, build one row at a time and clear it before the next.',
        say: 'Can you put twenty next to the 20?',
      },
      {
        text: 'On another day, review with the three-period lesson again, working further down the board until all nine tens are known. Keep sessions short — two or three new names at a time is plenty.',
        say: 'Yesterday we learned twenty and thirty. Today, let’s meet fifty.',
      },
    ],
    pointsOfInterest: [
      'Hearing “two” hiding inside “twenty” and “three” inside “thirty” — the names almost give themselves away',
      'The zeros marching down the board in a perfectly straight line',
      'Counting all the beads of four ten-bars one by one and landing exactly on forty',
      'The staircase of bead bars growing by exactly one bar per row',
    ],
    controlOfError: [
      'Every quantity can be recounted bead by bead — a ten-bar always has exactly ten, so a miscount shows itself',
      'The bars laid beside the board grow by one bar per row; a skipped or doubled ten breaks the visible staircase',
      'The printed numerals let the child check a name against its symbol without an adult saying “wrong”',
    ],
    vocabulary: ['ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'ten-bar'],
    variations: [
      'Play the distance game: keep the ten-bars across the room, name a ten (“Bring me sixty”), and have your child fetch the right number of bars to build it — holding the name in mind the whole trip',
      'Point to rows out of order (“What is this one?”) once the sequence is solid',
      'Have your child close their eyes while you hide one pile of bars; they open their eyes, count what is missing, and name it',
    ],
    extensions: [
      'Count by tens out loud while doing something rhythmic — climbing stairs, clapping, or setting out spoons in groups of ten',
      'Hunt for tens around the house: a ten-pack of crayons, ten eggs left in a carton, dimes as “ten cents”',
      'Say the tens backward — ninety, eighty, seventy… — as a car game',
    ],
    whatComesNext:
      'When the names of the tens are secure, move to “Counting to 99,” where unit cards slide over the zeros and your child builds every number in between — 21, 22, 23 … — exchanging ten loose beads for a ten-bar at each new ten. After that comes the Hundred Board.',
    followUpWork: [
      {
        description:
          'Print a teens-and-tens practice sheet: your child writes the numeral for each tens name and draws the matching ten-bars.',
        worksheetSlug: 'teens-tens',
      },
      {
        description:
          'Have your child copy the column 10, 20, 30 … 90 down the left edge of a piece of paper, saying each name aloud while writing it.',
      },
      {
        description:
          'Say a tens name at the kitchen table (“seventy”) and have your child write the numeral; then swap roles — they say a name, you write it, and they check your work.',
      },
    ],
  },
  {
    slug: 'ten-board-counting',
    name: 'Counting to 99',
    strand: 'linear-counting',
    sequence: 4,
    ages: [5, 7],
    grades: 'K–1',
    overview:
      'With the tens named, the child now counts through every number from 10 to 99 on the Ten Board — sliding unit cards over the zeros and adding one bead at a time, trading ten loose beads for a ten-bar at every new ten. This is where counting past twenty stops being a chant and becomes a structure.',
    materialsNeeded: [
      'Seguin Ten Board (Board B) with its nine unit cards (1–9) — or index-card versions: nine tens cards and nine small unit cards sized to cover just the zero',
      'Nine golden ten-bars and about ten loose golden unit beads — or bundles of ten (craft sticks, straws) plus ten loose ones of the same object',
      'A work mat with room beside the board for the growing bead quantity',
    ],
    virtualMaterials: ['ten-board'],
    prerequisites: ['ten-board-intro'],
    directAims: [
      'Count in sequence from 10 to 99, building each number with both symbol and quantity',
      'Experience that ten loose units are always exchanged for one ten-bar — the moment the count crosses into a new ten',
    ],
    indirectAims: [
      'Preparation for the Hundred Board and for reading and writing any two-digit number',
      'Concrete groundwork for carrying (“regrouping”) in addition with the golden beads and stamp game',
      'Absorbing the rhythm of base ten: the units count 1 to 9, then start over',
    ],
    presentation: [
      {
        text: 'Set out the board with one ten-bar beside the 10 row. Point to the 10.',
        say: 'Ten. Let’s count on from ten.',
      },
      {
        text: 'Place one loose unit bead beside the ten-bar, then slide the 1 card over the zero of the 10 row so it reads 11.',
        say: 'Ten and one — eleven.',
      },
      {
        text: 'Continue one bead at a time: swap the card for the 2 to make 12, the 3 to make 13, and so on. Let your child place the bead and slide the card as soon as they reach for it.',
        say: 'Ten and two — twelve.',
      },
      {
        text: 'At 19, add one more bead and pause. Count the loose beads together: ten! Look at the pile with mock alarm.',
        say: 'Ten loose beads! Ten units make a ten. Let’s change them for a ten-bar.',
      },
      {
        text: 'Have your child gather the ten loose beads, set them aside, and take one ten-bar in exchange. Slide the unit card off, and move down to the 20 row: two ten-bars, no loose beads.',
        say: 'Two tens — twenty.',
      },
      {
        text: 'Carry on the same way — 21, 22, 23 … — exchanging at every new ten. Do not push for 99 in one sitting; stopping at 30 or 40 and continuing another day is exactly how the material is meant to be used.',
        say: 'Where did we stop yesterday? Let’s build it and keep counting.',
      },
      {
        text: 'Over later sittings, hand the whole process to your child: they place beads, slide cards, and call the exchanges while you simply watch and listen.',
        say: 'You be the counter today. I’ll listen.',
      },
    ],
    pointsOfInterest: [
      'The pile of loose beads growing and growing — then vanishing into a single golden bar',
      'Sliding a unit card over the zero and watching 30 become 34',
      'Discovering that the unit cards repeat identically on every row: after the 9 always comes an exchange',
      'Reaching 99 and finding there is no card and no bead left to go further — the board is full',
    ],
    controlOfError: [
      'The loose beads can always be recounted against the card showing — if they disagree, counting reveals it',
      'There is no unit card for ten: a tenth loose bead has nothing to slide over the zero, which itself signals the exchange',
      'The exchange balances physically — exactly ten beads leave the mat and exactly one ten-bar arrives, so nothing is gained or lost',
    ],
    vocabulary: ['exchange', 'units', 'tens', 'twenty-one, twenty-two … (the composed number names)'],
    variations: [
      'Start the count at a later ten — build 60 and count 61, 62, 63 … to keep long sessions fresh',
      'Count backward from a small landmark like 25, returning a bead at each step and breaking a ten-bar back into ten units at each ten',
      'Parent builds a number with beads only; the child sets the board and cards to match',
    ],
    extensions: [
      'Count a real collection past ten — buttons, dry pasta, building bricks — grouping into cups of ten as you go, then read the total as “tens and units”',
      'Count aloud to 99 in the car or on a walk, with your child taking over at each new ten',
      'Play “What comes after 39?” at odd moments; the exchange moments are the ones worth quizzing',
    ],
    whatComesNext:
      'After counting to 99 with beads and cards, the Hundred Board is next: the same numbers, now as tiles placed 1 to 100 in a grid, followed by skip counting on the Hundred Board and the bead chains. In parallel, the golden beads of the decimal system extend these same exchanges into hundreds and thousands.',
    followUpWork: [
      {
        description:
          'Print a teens-and-tens worksheet: your child reads two-digit numbers, writes the missing ones in counting sequences, and matches numerals to tens-and-units pictures.',
        worksheetSlug: 'teens-tens',
      },
      {
        description:
          'Make a counting strip: fold a paper strip into boxes and have your child write a stretch of the count (for example 27 through 43), saying each number aloud — the exchange numbers 30 and 40 get a circle.',
      },
      {
        description:
          'Say a number between 11 and 99 and have your child write it, then draw it as sticks and dots — one long stick for each ten, one dot for each unit.',
      },
    ],
  },
]
