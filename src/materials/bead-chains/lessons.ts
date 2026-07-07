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
      'One grand adventure remains in this strand: the long chains. The hundred chain and the great thousand chain stretch skip counting by tens all the way to 1,000 — see the next lesson, The Long Chains. After that, the path leads into the Memorization strand, where the Snake Game turns counting into addition facts.',
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
  {
    slug: 'long-chains',
    name: 'The Long Chains: 100 and 1,000',
    strand: 'linear-counting',
    sequence: 8,
    ages: [5, 8],
    grades: 'K–2',
    overview:
      'The long chains are the longest count in the primary classroom: one golden line of ten-bars that your child counts by tens, labeling every bar along the way. The hundred chain comes first — ten ten-bars ending at 100 — and then the thousand chain turns counting into a true expedition, one hundred ten-bars long with a milestone waiting at every hundred.',
    materialsNeeded: [
      'Real golden hundred and thousand chains with their arrow labels, or the virtual Bead Chains material on this site set to Hundred chain or Thousand chain',
      'The printable arrow labels from the material page (tap "Show arrow labels", then print) — cut them out to label a real or homemade chain',
      'Household substitute: 10 strings of 10 beads each, or 100 paper clips chained in tens, joined end to end',
      'A long runway for the count: a hallway, a long rug, or a painter’s-tape line down the floor',
    ],
    virtualMaterials: ['bead-chains'],
    prerequisites: ['bead-chains-skip-counting'],
    directAims: [
      'Count by tens to 100, and then all the way to 1,000, labeling the end of every ten-bar',
      'Meet the hundred square at every milestone and the thousand cube at the finale as counted proof that 100 is 10 tens and 1,000 is 100 tens — 10 hundreds',
      'Sustain one long count from beginning to end, checking the work honestly along the way',
    ],
    indirectAims: [
      'Preparation for the decimal system and the powers of 10',
      'Concentration and stamina built across one long, continuous piece of work',
      'A bodily, walked-and-counted sense of how big 1,000 really is',
    ],
    presentation: [
      {
        text: 'Choose the Hundred chain on screen, or lay a real hundred chain out straight on a long rug with its arrow labels nearby. Sit beside your child at the very start of the chain.',
        say: 'This is the hundred chain. It is made of ten-bars — let us count them.',
      },
      {
        text: 'Count the first bar bead by bead, touching each bead, and when you reach ten, place the 10 arrow at the end of the bar. On screen: tap the 10 ticket in the tray, then tap the empty spot at the end of the first bar.',
        say: 'Ten.',
      },
      {
        text: 'Count on by tens from there, placing an arrow at the end of each bar. Invite your child to take over the counting and the arrows as soon as they reach for them.',
        say: 'Ten, twenty, thirty…',
      },
      {
        text: 'At the end of the chain comes the larger ticket, 100, and beside it the hundred square. Let your child set the ticket, then pause to look back down the whole labeled chain.',
        say: 'Ten tens make one hundred. The chain is the hundred square, unrolled.',
      },
      {
        text: 'Another day, present the thousand chain. Before any counting, travel its whole length together — scroll from one end to the other on screen, or walk beside a real chain from start to finish.',
        say: 'This chain has one hundred ten-bars. Today we count all the way to one thousand.',
      },
      {
        text: 'Count and label by tens, your child leading. At every hundred, pause: the milestone earns its bigger ticket and a hundred square appears beside it. Greet each one before counting on.',
        say: 'One hundred!',
      },
      {
        text: 'Breaks are part of this work — a count to 1,000 can span snack time or even a day. On screen, the "You are near" sign shows where you left off when you scroll back; on a real chain, the last placed arrow does the same.',
      },
      {
        text: 'At the very end of the chain waits the finale: the 1,000 ticket, the largest of all, with the thousand cube beside it.',
        say: 'One thousand. One hundred tens — ten hundreds — make one thousand.',
      },
      {
        text: 'Walk back down the chain and read only the milestones aloud together — one hundred, two hundred, three hundred… one thousand. If your child wants certainty, tap Check: every placed ticket is marked right or wrong, and a wrong one just means it is time to recount that bar.',
      },
    ],
    pointsOfInterest: [
      'The sheer length of it — a real thousand chain runs about 7 meters, longer than most rooms',
      'A hundred square appearing at every milestone, and the thousand cube waiting at the very end',
      'The "You are near" sign that tells you where you are when you scroll back after a break',
      'The same golden beads as the decimal-system material, laid out here in one single line',
    ],
    controlOfError: [
      'The tickets form one fixed, ordered set — if the next arrow in the box does not match the count, something needs a recount',
      'Recounting any bar’s beads confirms the label at its end',
      'On screen, the Check button marks each placed ticket right or wrong without revealing the answer',
    ],
    vocabulary: [
      'hundred chain',
      'thousand chain',
      'ten-bar',
      'hundred square',
      'thousand cube',
      'arrow label',
      'milestone',
    ],
    variations: [
      'Read only the milestone numbers aloud and whisper all the tens in between',
      'Count backward from 100 down the hundred chain: one hundred, ninety, eighty…',
      'Walk a real chain heel-to-toe, counting the bars as you step past them',
    ],
    extensions: [
      'Fold a real thousand chain into hundreds and stack the ten hundred squares next to the thousand cube — the same quantity, three shapes',
      'Find every milestone on the hundred board and notice the pattern the multiples of ten make',
      'Estimate first: guess where 500 will fall down the hallway, mark the guess with tape, then count to check',
    ],
    whatComesNext:
      'The Long Chains close the Linear & Skip Counting strand — your child can now count anything, in any step, to 1,000. Two paths open from here. The Memorization strand begins with the Snake Game, which turns all that counting into addition facts. And the Decimal System strand’s golden beads take the very same units, ten-bars, hundred squares, and thousand cubes your child just counted and build numbers into the thousands with them.',
    followUpWork: [
      {
        description:
          'Print a skip-counting worksheet of tens and let your child fill in the missing multiples in pencil.',
        worksheetSlug: 'skip-counting',
      },
      {
        description:
          'Print the arrow labels from the material page, cut them out together, and use them to label a homemade chain — or a tens number line taped down the hallway.',
      },
      {
        description:
          'Ask your child to write the milestones 100, 200, 300 … 1,000 from memory on paper, then check them against the chain’s big tickets.',
      },
    ],
  },
]
