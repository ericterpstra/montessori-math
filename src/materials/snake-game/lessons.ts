import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'snake-game',
    name: 'The Positive Snake Game',
    strand: 'memorization',
    sequence: 1,
    ages: [5, 7],
    grades: 'K–1',
    overview:
      'The child lays colored bead bars into a long "snake," then counts it out ten beads at a time, trading each ten for a golden ten-bar until the colorful snake has turned to gold. It is the playful doorway into memorizing addition facts — especially the pairs that make ten.',
    materialsNeeded: [
      'Colored bead bars 1–9, several of each (or paper strips with 1–9 dots colored to match the bead stair: 1 red, 2 green, 3 pink, 4 yellow, 5 light blue, 6 lavender, 7 white, 8 brown, 9 dark blue)',
      'About ten golden ten-bars (or paper strips of ten golden-yellow dots)',
      'Black-and-white bead bars 1–9 (or paper strips with the first five dots black and the rest white)',
      'A small dish or bowl for the set-aside bars',
      'A work mat, rug, or bath towel',
    ],
    virtualMaterials: ['snake-game'],
    prerequisites: ['bead-stair-intro', 'golden-beads-intro'],
    directAims: [
      'Practice combining small numbers and counting on past ten',
      'Begin memorizing the addition facts, starting with the pairs that make ten',
    ],
    indirectAims: [
      'Preparation for column addition and carrying — the child sees regrouping into tens happen bead by bead',
      'Reinforcement of the golden-bead idea that ten of anything can be exchanged for one ten',
    ],
    presentation: [
      {
        text: 'Roll out the mat and carry over the bead bars in their bowl, the golden ten-bars, the black-and-white bars, and an empty dish. Sit beside your child.',
        say: 'Today we are going to play the snake game.',
      },
      {
        text: 'Choose five or six colored bead bars and lay them end to end in a gentle winding line across the mat. Invite your child to add a few bars of their own choosing.',
        say: 'Let us make a colorful snake. You may add some bars too — as many as you like.',
      },
      {
        text: 'Start at the snake’s head and count the beads one by one, touching each bead as you say its number. Stop exactly at ten and keep a finger on the tenth bead.',
        say: 'One, two, three, four, five, six, seven, eight, nine — ten!',
      },
      {
        text: 'Pick up every bar you counted completely and put those bars in the dish. Lay one golden ten-bar in their place at the head of the snake.',
        say: 'We counted ten beads, so we trade them for one golden ten.',
      },
      {
        text: 'If your count of ten stopped partway through a bar, count how many beads of that bar are left over. Put a black-and-white bar of exactly that many in its place at the head, and drop the colored bar in the dish with the others.',
        say: 'Three beads were left over, so this black-and-white three holds their place.',
      },
      {
        text: 'Count on from the black-and-white bar and repeat: count to ten, trade for gold, bridge any leftover with a black-and-white bar. When a black-and-white bar gets counted up, it goes back in its box — never in the dish. Let your child take over the counting as soon as they reach for it.',
        say: 'One, two, three... your turn to count to ten.',
      },
      {
        text: 'Keep going until fewer than ten beads remain. Lay the golden bars in a line and look at what the snake has become.',
        say: 'Look — our colorful snake has turned into a golden snake.',
      },
      {
        text: 'Prove it: empty the dish and recount the set-aside colored bars, grouping them into tens. Match each ten against a golden bar, and the leftover against the black-and-white bar.',
        say: 'Let us check our work. Does what we counted match our gold?',
      },
    ],
    pointsOfInterest: [
      'The moment the last colored bar is traded and the whole snake is gold',
      'The black-and-white bars that "hold the place" of leftover beads mid-count',
      'Noticing pairs that make ten exactly — a 7 with a 3, a 6 with a 4',
      'The proof at the end: the dish and the gold telling the same story',
    ],
    controlOfError: [
      'The proof: recounting the set-aside colored bars must match the golden snake ten for ten, with the leftover matching the black-and-white bar',
      'The beads themselves — a miscount leaves the recount over or short, and the child simply counts again',
    ],
    vocabulary: ['snake', 'ten-bar', 'golden ten', 'trade (exchange)', 'set aside', 'leftover', 'black-and-white bar', 'proof'],
    variations: [
      'Let the child build the entire snake alone — short and stubby or stretching off the mat, both are fine',
      'Play "surprise snake": one person builds a snake in secret, the other counts it into gold',
      'Build a snake from only two kinds of bars (all fives, or sixes and fours) and notice it comes out even, with no black-and-white bars needed',
    ],
    extensions: [
      'Before counting, ask the child to guess how many golden tens the snake will make, then count to find out',
      'Hunt for ten-pairs first: slide a 7 next to a 3 or an 8 next to a 2 and trade them straight for gold before counting the rest',
      'Write a favorite snake as an addition problem (5 + 3 + 8 + 4) and add it on paper, then check the answer against the golden snake',
    ],
    whatComesNext:
      'When your child plays the snake game with ease and starts to remember which pairs make ten without counting, move on to the Addition Strip Board, where every addition fact from 1 + 1 to 9 + 9 is built one at a time and written down — the next step in the memorization work.',
    followUpWork: [
      {
        description:
          'Print a page of addition facts with sums up to 10 and let your child solve them with a pencil. Any fact they are unsure of can be checked by building it as a tiny two-bar snake.',
        worksheetSlug: 'math-facts',
      },
      {
        description:
          'Ten-pairs from memory: ask your child to write down every pair of numbers that makes ten (1 + 9, 2 + 8, 3 + 7...) on paper, then check the finished list against the bead bars.',
      },
      {
        description:
          'Snake recipes: your child writes a "recipe" for a snake (for example 6 + 7 + 4 + 3), predicts on paper how many golden tens it will make, then builds and counts that snake to check the prediction.',
      },
    ],
  },
]
