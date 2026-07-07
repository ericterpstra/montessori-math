import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'multiplication-charts',
    name: 'The Multiplication Charts',
    strand: 'memorization',
    sequence: 7,
    ages: [6, 9],
    grades: '1–3',
    overview:
      'The multiplication charts come after the bead board, when your child has built the tables by hand and is ready to own them. Looking up products on the control chart, discovering the half chart, and rebuilding the whole table from memory with answer tiles turns table-building into true recall.',
    materialsNeeded: [
      'Multiplication Chart 1 and Chart 2, printed from this site (open the virtual material and press the "Print control charts" button)',
      'A set of 81 small answer tiles and a blank 9 × 9 grid for the working chart — or use the on-screen working chart and check against the printed control chart',
      'Household substitute: hand-rule a 9 × 9 grid with the numbers 1–9 across the top and down the side, and write the 81 products on small squares cut from card stock',
      'A pencil and paper for writing facts',
    ],
    virtualMaterials: ['multiplication-charts'],
    prerequisites: ['multiplication-bead-board'],
    directAims: [
      'To memorize the multiplication facts up to 9 × 9',
      'To give the child an independent way to look up and check any product',
    ],
    indirectAims: [
      'Discovering commutativity — that 3 × 5 and 5 × 3 share one product, so only half the chart needs remembering',
      'Noticing the square numbers marching down the diagonal — a first taste of number patterns',
      'Preparation for long multiplication on the checkerboard, where table facts must come without hesitation',
    ],
    presentation: [
      {
        text: 'Sit beside your child with Chart 1. Let them explore it for a moment, then read the numbers across the top and down the left side together.',
        say: 'This chart holds every fact from the tables you built on the bead board — all of them, from 1 × 1 to 9 × 9.',
      },
      {
        text: 'Show the finger gesture. Put your left finger on the 4 at the side and your right finger on the 3 at the top.',
        say: 'Four… taken three times.',
      },
      {
        text: 'Slide the side finger straight across and the top finger straight down until they meet on one square. Read the product there.',
        say: 'My fingers meet at twelve. Four times three is twelve.',
      },
      {
        text: 'Hand the chart to your child and call out facts from a table they know well, letting their own fingers find each product. Then bring out Chart 2 and let them notice the missing squares.',
        say: 'Half the chart is gone — but no answers are missing. Three times five and five times three are the same fact, so we only keep it once.',
      },
      {
        text: 'On another day, show the working chart: a blank grid and a box of answer tiles. Choose a fact your child knows cold, find the tile, and place it on its square.',
        say: 'Six times six… thirty-six. The thirty-six tile goes where the two sixes meet.',
      },
      {
        text: 'Let your child keep placing tiles from memory, in any order they like — many children work one table at a time. Say nothing about right or wrong while they work.',
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
      'The moment the two fingers meet on the product square',
      'The square numbers (1, 4, 9 … 81) running down the diagonal of Chart 1',
      'Discovering why Chart 2 can throw half the squares away and lose nothing',
      'Sorting the tiles first — four different facts all share the 12 tile',
    ],
    controlOfError: [
      'The control chart itself: the child compares their work to Chart 1, so the material corrects and the adult never marks',
      'On screen, the Check button flags only misplaced tiles — it gives no answers and adds no praise',
      'The tile box holds exactly one tile per fact, so a finished chart with tiles left over shows something is off',
    ],
    vocabulary: ['product', 'times', 'combination', 'chart', 'row', 'column', 'square number'],
    variations: [
      'Work one table at a time on the working chart — place all nine ×4 facts from memory, then check',
      'Place the square numbers first and watch the diagonal appear',
      'Call out a fact and have your child find the product with the finger gesture as fast as they comfortably can',
    ],
    extensions: [
      'Cover a product square on the printed Chart 1 with a coin, name the fact from memory, then lift the coin to check',
      'Have your child hand-rule their own blank 9 × 9 chart and fill it in with pencil, checking against the control chart when done',
      'Hunt for a product: pick a number such as 24 and find every square on Chart 1 that holds it, writing each fact down — then talk about why some numbers appear four times and some only once',
    ],
    whatComesNext:
      'When your child can rebuild the working chart with few slips, the tables are truly theirs — and that fluency is exactly what long multiplication needs. Move on to the Checkerboard in the passage-to-abstraction strand, where those memorized facts multiply numbers into the millions.',
    followUpWork: [
      {
        description:
          'Print a page of times-table facts and let your child answer in pencil, keeping the printed control chart nearby to check any fact they are unsure of after answering.',
        worksheetSlug: 'math-facts',
        presetId: 'times-tables',
      },
      {
        description:
          'Copy one table of Chart 1 onto paper each day — all the ×7 facts, say — writing each as a full equation and reading it aloud.',
      },
      {
        description:
          'Make a personal "tables I know cold" list on paper: each time a whole table comes out instantly three days running, your child writes its heading on the list in pen.',
      },
    ],
  },
]
