import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'addition-charts',
    name: 'The Addition Charts',
    strand: 'memorization',
    sequence: 6,
    ages: [5, 8],
    grades: 'K–2',
    overview:
      'The addition charts come after the strip board, when your child can build any fact but does not yet know them all by heart. Reading answers off the control chart, discovering the half chart, and finally rebuilding the whole table from memory with answer tiles carries the facts the last mile toward full abstraction.',
    materialsNeeded: [
      'Addition Chart 1 and Chart 2, printed from this site (open the virtual material and press the "Print control charts" button)',
      'A set of 81 small answer tiles and a blank 9 × 9 grid for the working chart — or use the on-screen working chart and check against the printed control chart',
      'Household substitute: hand-rule a 9 × 9 grid with the numbers 1–9 across the top and down the side, and write the 81 answers on small squares cut from card stock',
      'A pencil and paper for writing facts',
    ],
    virtualMaterials: ['addition-charts'],
    prerequisites: ['addition-strip-board'],
    directAims: [
      'To memorize the addition facts up to 9 + 9',
      'To give the child an independent way to look up and check any addition fact',
    ],
    indirectAims: [
      'Discovering commutativity — that 3 + 5 and 5 + 3 share one answer, so only half the chart needs remembering',
      'Preparation for abstract column addition, where facts must be recalled without material',
      'Reading a table by row and column — a skill used again in the multiplication charts',
    ],
    presentation: [
      {
        text: 'Sit beside your child with Chart 1. Let them look it over freely for a moment, then read the numbers across the top and down the left side together.',
        say: 'This chart holds every addition fact you have built on the strip board — all of them, from 1 + 1 to 9 + 9.',
      },
      {
        text: 'Show the finger gesture. Put your left finger on the 4 at the side and your right finger on the 3 at the top.',
        say: 'Four… and three.',
      },
      {
        text: 'Slide the side finger straight across and the top finger straight down until they meet on one square. Read the answer there.',
        say: 'My fingers meet at seven. Four plus three is seven.',
      },
      {
        text: 'Hand the chart to your child and call out facts they already know from the strip board, letting their own fingers find each answer. Then bring out Chart 2 and let them notice that squares are missing.',
        say: 'Half the chart is gone — but no answers are missing. Three plus five and five plus three are the same fact, so we only keep it once.',
      },
      {
        text: 'On another day, show the working chart: a blank grid and a box of answer tiles. Choose a fact your child knows cold, find the tile, and place it on its square.',
        say: 'Six plus six… twelve. The twelve tile goes where the two sixes meet.',
      },
      {
        text: 'Let your child keep placing tiles from memory, working in any order they like. Say nothing about right or wrong while they work.',
      },
      {
        text: 'When they want to check, bring the printed control chart alongside and compare square by square — or press "Check my chart" on screen, which marks only the tiles that do not match.',
        say: 'The chart will tell you. Compare your square with the same square on Chart 1.',
      },
      {
        text: 'Any tile that does not match goes back in the box to be placed again. Fixing and re-checking is the work — the adult never marks the chart.',
      },
    ],
    pointsOfInterest: [
      'The moment the two fingers meet on the answer square',
      'The staircase of doubles (2, 4, 6 … 18) running down the diagonal of Chart 1',
      'Discovering why Chart 2 can throw half the squares away and lose nothing',
      'The last tile going down on a completed working chart — all 81 in place',
    ],
    controlOfError: [
      'The control chart itself: the child compares their work to Chart 1, so the material corrects and the adult never marks',
      'On screen, the Check button flags only misplaced tiles — it gives no answers and adds no praise',
      'The tile box holds exactly one tile per fact, so a finished chart with tiles left over shows something is off',
    ],
    vocabulary: ['sum', 'combination', 'chart', 'row', 'column', 'double'],
    variations: [
      'Work one row of the chart at a time — all the +4 facts, say — placing those nine tiles from memory',
      'Place all the doubles first and watch the diagonal appear',
      'Call out a fact and have your child find the answer with the finger gesture as fast as they comfortably can',
    ],
    extensions: [
      'Cover an answer square on the printed Chart 1 with a coin, name the fact from memory, then lift the coin to check',
      'Have your child hand-rule their own blank 9 × 9 chart and fill it in with pencil, checking against the control chart when done',
      'Hunt for a sum: pick a number such as 11 and find every square on Chart 1 that holds it, writing each fact down',
    ],
    whatComesNext:
      'When your child can rebuild the working chart with few slips, the addition facts are essentially theirs. The same passage repeats for multiplication: the Multiplication Bead Board builds the tables by hand, and the Multiplication Charts — the next lesson in this strand — carry them into memory the same way.',
    followUpWork: [
      {
        description:
          'Print a page of first addition facts and let your child answer in pencil, keeping the printed control chart nearby to check any fact they are unsure of after answering.',
        worksheetSlug: 'math-facts',
        presetId: 'first-facts',
      },
      {
        description:
          'Copy one row of Chart 1 onto paper each day — all the +6 facts, say — writing each as a full equation and reading it aloud.',
      },
      {
        description:
          'Make a personal "facts I know cold" list on paper: each time a fact comes out instantly three days running, your child writes it on the list in pen.',
      },
    ],
  },
]
