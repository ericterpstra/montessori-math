import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'subtraction-strip-board',
    name: 'The Subtraction Strip Board',
    strand: 'memorization',
    sequence: 3,
    ages: [6, 8],
    grades: '1–2',
    overview:
      'The subtraction strip board gives your child a way to work — and eventually memorize — every subtraction fact with answers from 1 to 17. A wooden cover strip hides the numbers you do not need, a blue strip takes away, and the answer is simply the number left showing.',
    materialsNeeded: [
      'A subtraction strip board: a grid with the numbers 1–18 printed across the top, 1–9 in blue and 10–18 in red (a homemade version ruled onto poster board works well — make the squares about an inch wide)',
      'Blue strips 1–9 squares long, each labeled with its number (cut from blue construction paper to match your grid)',
      'One long natural-colored cover strip, about 17 squares long, to hide unused numbers (a strip of plain cardboard or folded brown paper)',
      'Natural wood strips 1–9 squares long for checking answers, if your set includes them (plain paper strips work as a substitute)',
      'Pencil and paper for recording each fact',
    ],
    virtualMaterials: ['subtraction-strip-board'],
    prerequisites: ['addition-strip-board'],
    directAims: [
      'To practice subtraction facts with minuends up to 18 and single-digit subtrahends',
      'To move the subtraction facts from worked-out answers toward effortless memory',
      'To experience subtraction as taking an amount away from a whole and seeing what remains',
    ],
    indirectAims: [
      'Preparation for abstract, pencil-and-paper subtraction with larger numbers',
      'Discovery of the relationship between addition and subtraction facts (fact families)',
      'Building the habit of checking one’s own work against the material rather than asking an adult',
    ],
    presentation: [
      {
        text: 'Sit beside your child with the board between you. Run a finger along the numbers across the top, from 1 to 18, and point out that the numbers turn from blue to red after 9.',
        say: 'These numbers go all the way up to eighteen. Blue up to nine, red from ten.',
      },
      {
        text: 'Announce a problem your child can succeed with, such as 12 − 4, and write it at the top of a piece of paper.',
        say: 'Let’s take four away from twelve.',
      },
      {
        text: 'Slide the long natural cover strip in from the right until only the numbers 1 through 12 are showing. On the virtual board, tapping 12 does this.',
        say: 'We start with twelve, so the cover hides everything past twelve.',
      },
      {
        text: 'Take the blue strip labeled 4 and lay it on the row below the numbers, with its right end against the cover strip. Count its four squares aloud together.',
        say: 'This blue strip takes four away.',
      },
      {
        text: 'Point to the number just to the left of the blue strip — 8 — and pause so your child can read it.',
        say: 'Twelve take away four is… eight. The board shows us the answer.',
      },
      {
        text: 'Have your child write the complete fact, 12 − 4 = 8, on the paper. Writing each fact is part of the work — it is how the facts settle into memory.',
        say: 'Write it down so we keep it: twelve minus four equals eight.',
      },
      {
        text: 'Slide the cover back out, choose a new problem together, and let your child do every step: set the cover, lay the blue strip, read the answer, record the fact. Stay nearby but let the board do the correcting.',
        say: 'Your turn — pick a number to start with.',
      },
    ],
    pointsOfInterest: [
      'Sliding the wooden cover strip in from the right and watching numbers disappear',
      'The blue strip fitting exactly under the numbers being taken away',
      'Discovering that the answer is simply the last number left showing',
      'The color change from blue to red at 10, marking the numbers beyond one hand of nine',
    ],
    controlOfError: [
      'The board itself gives the answer: the number just left of the blue strip is the difference, so a misread can be caught by looking again',
      'The blue strip’s squares can be recounted to confirm the right strip was chosen',
      'A recorded fact can be checked by adding back: if 12 − 4 = 8, then 8 + 4 must land on 12 (the addition strip board shows this)',
    ],
    vocabulary: ['minus', 'take away', 'difference', 'subtraction', 'fact'],
    variations: [
      'Write eight or ten problems on slips of paper, fold them into a bowl, and let your child draw one at a time to work on the board (the virtual board’s Practice mode does this with an honest right-or-not check)',
      'Choose one number, such as 12, and take away 1, then 2, then 3, up to 9 — recording every fact in a column (the virtual board’s “Ways to take from a number” mode steps through this)',
      'Let your child pose problems for you to work, and check your answers on the board — children love catching a parent’s deliberate mistake',
    ],
    extensions: [
      'Build the complete subtraction table for each number from 18 down, one number per day, and keep the pages in a folder',
      'Hunt for patterns in the recorded tables: taking away 9 always lands one below taking away 8; taking a number from itself plus one always leaves 1',
      'Write fact families on paper: from 12 − 4 = 8, find 12 − 8 = 4, 8 + 4 = 12, and 4 + 8 = 12',
    ],
    whatComesNext:
      'When most subtraction facts come quickly and the board is only needed for an occasional check, your child is ready to begin the multiplication facts with the Multiplication Bead Board. Keep sprinkling in short pencil-and-paper subtraction reviews even after moving on — facts stay sharp with use.',
    followUpWork: [
      {
        description:
          'Print a page of mixed subtraction facts and let your child work it with a pencil, keeping the board nearby to check any fact they are unsure of.',
        worksheetSlug: 'math-facts',
      },
      {
        description:
          'Have your child write the complete subtraction table for one number — every way to take from 12, say — in a neat column, then read it aloud to you.',
      },
      {
        description:
          'Fold a paper into eight boxes and write one subtraction fact in each box with the answer hidden under a flap; your child lifts each flap only after saying the answer.',
      },
    ],
  },
]
