import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'bead-chains-skip-counting',
    name: 'Bead Chains & Skip Counting',
    strand: 'linear-counting',
    sequence: 7,
    ages: [5, 8],
    grades: 'K–2',
    overview:
      'Your child counts a chain of bead bars from end to end, labeling each stopping point — 5, 10, 15, 20, 25 — and meets the square of a number at the finish. Skip counting learned this way is the direct seed of the multiplication tables.',
    materialsNeeded: [
      'The short bead chains 2–10 with their arrow labels (or the virtual Bead Chains material on this site)',
      'Household substitute: pony beads threaded on pipe cleaners — make five pipe cleaners with five beads each and twist them together end to end for a chain of five; match colors if you can',
      'Small slips of paper and a pencil to make your own labels (for the chain of five, write 5, 10, 15, 20, 25)',
      'A rug, towel, or clear stretch of table long enough to lay the chain out straight',
    ],
    virtualMaterials: ['bead-chains'],
    prerequisites: ['hundred-board-intro'],
    directAims: [
      'Skip count by any number from 2 to 10, up to that number’s square',
      'Connect each spoken multiple to its written numeral by labeling the chain',
      'Discover that counting a chain of equal bars always ends at the square of the number',
    ],
    indirectAims: [
      'Preparation for memorizing the multiplication tables',
      'A first sensorial impression of the square of a number, preparing for later work with squares and powers',
      'Practice sustaining order and attention through one long, satisfying piece of work',
    ],
    presentation: [
      {
        text: 'Choose the chain of 5 on screen, or lay a real five-chain out straight on a rug with its labels nearby in a little pile. Sit beside your child.',
        say: 'This is the chain of five. Every bar on it has five beads.',
      },
      {
        text: 'Run a finger slowly along the whole chain from one end to the other, so your child sees it is one long line of bars joined together.',
      },
      {
        text: 'Count the beads of the first bar one at a time, touching each bead as you say its number.',
        say: 'One, two, three, four, five.',
      },
      {
        text: 'Find the ticket that says 5 and place it at the end of the first bar. On screen: tap the 5 ticket in the tray, then tap the empty spot at the end of the first bar.',
        say: 'Five. This ticket marks five.',
      },
      {
        text: 'Count on across the second bar without starting over — six, seven, eight, nine, ten — and place the 10 ticket at its end. Invite your child to take over the counting and placing as soon as they lean in.',
        say: 'Six, seven, eight, nine, ten. Ten.',
      },
      {
        text: 'Let your child continue bar by bar to the end of the chain, counting every bead and labeling each bar. Resist the urge to rush or correct — a recount settles any doubt.',
      },
      {
        text: 'When the last ticket, 25, goes in place, pause. It is the biggest label on the chain.',
        say: 'Five bars of five make twenty-five. Five taken five times is twenty-five — we call it the square of five.',
      },
      {
        text: 'Go back to the beginning and read only the tickets, touching the end of each bar as you say its number together.',
        say: 'Five, ten, fifteen, twenty, twenty-five.',
      },
      {
        text: 'On screen, tap Check if your child wants to be sure — each placed ticket is marked right or wrong, and a wrong one simply means it is time to recount that bar. Another day, invite your child to choose a different chain.',
      },
    ],
    pointsOfInterest: [
      'Each chain wears the same color as its bead-stair bar — the chain of 5 is light blue, and the chain of 10 is golden',
      'The last ticket on every chain is larger than the rest: the square',
      'The rhythm of the numbers — after a few rounds children start chanting the sequence before their finger gets there',
      'The chains grow visibly longer as the numbers grow: the chain of 10 has one hundred beads',
    ],
    controlOfError: [
      'The beads themselves: recounting a bar shows whether the ticket at its end is right',
      'The tickets form one fixed set — a ticket left over, or a gap with no ticket that fits, shows something is off',
      'On screen, the Check button marks each placed ticket right or wrong without giving away the answer',
    ],
    vocabulary: ['chain', 'bar', 'ticket (arrow label)', 'skip counting', 'square of a number'],
    variations: [
      'Let your child pick the chain — a favorite color is a fine reason to count by sevens',
      'Count backward from the square once the chain is labeled: 25, 20, 15, 10, 5',
      'Play the whisper game: whisper the in-between numbers and say the ticket numbers out loud',
    ],
    extensions: [
      'Fold a real chain bar by bar into a solid square to see with your eyes why 25 is called the square of five',
      'Find every ticket number on the hundred board and notice the pattern the multiples make',
      'Skip count past the square on paper: keep the sequence going — 30, 35, 40 — as far as your child can',
    ],
    whatComesNext:
      'This is the last lesson in the Linear & Skip Counting strand, and the sequences your child can now chant are the multiplication tables in disguise. From here the path leads into the Memorization strand: the Snake Game turns counting into addition facts, and later the Multiplication Bead Board turns these skip-counted sequences into remembered products.',
    followUpWork: [
      {
        description:
          'Print a skip-counting worksheet for the chain your child just worked with, and let them fill in the missing multiples in pencil.',
        worksheetSlug: 'skip-counting',
      },
      {
        description:
          'Ask your child to write one chain’s sequence from memory on paper — 5, 10, 15, 20, 25 — then lay out the chain and check it against the tickets.',
      },
      {
        description:
          'Count real things in groups and write the running totals down: eggs by twos or sixes in a carton, muffin-tin cups by threes or fours, fingers by fives and tens.',
      },
    ],
  },
]
