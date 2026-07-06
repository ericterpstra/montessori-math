import type { Lesson } from '../../lessons/types'

export const lessons: Lesson[] = [
  {
    slug: 'fractions-intro',
    name: 'Introduction to Fractions',
    strand: 'fractions',
    sequence: 1,
    ages: [6, 8],
    grades: '1–2',
    overview:
      'Your child discovers that a whole can be cut into equal parts, and that each family of parts has its own name: halves, thirds, fourths, on up to tenths. The fraction circles make this concrete — every piece is a real, holdable part of the same red circle.',
    materialsNeeded: [
      'Fraction circles: ten red circles in green square frames — one whole, then circles cut into 2 through 10 equal pieces (sold as "fraction metal insets"; the virtual material below works too)',
      'Household substitute: ten paper plates or traced paper circles, one left whole and the others cut into 2–10 equal wedges — keep each family in its own labeled envelope',
      'A work mat, tray, or solid-color placemat',
      'An apple, tortilla, or sandwich and a table knife for the opening moment',
      'Pencil and paper for writing the first fraction symbols',
    ],
    virtualMaterials: ['fraction-circles'],
    prerequisites: ['golden-beads-formation'],
    directAims: [
      'Understand that a fraction is one or more equal parts of a whole',
      'Learn the family names: half, third, fourth, fifth, sixth, seventh, eighth, ninth, tenth',
      'Connect a quantity of pieces to its written symbol, e.g. one fifth to 1/5',
    ],
    indirectAims: [
      'Prepare for fraction equivalence and the four operations with fractions',
      'Plant the idea that the bottom number names the family and the top number counts the pieces',
      'Prepare for decimal fractions — tenths return later on the decimal board',
    ],
    presentation: [
      {
        text: 'Start at the table with something real. Cut an apple (or tortilla) into two pieces as equal as you can manage, and hold the halves together to remake the whole.',
        say: 'I cut it into two equal pieces. Each piece is one half. Two halves make the whole.',
      },
      {
        text: 'Move to the mat with the fraction circles. Point to the uncut circle first and trace it with a finger.',
        say: 'This circle is one whole.',
      },
      {
        text: 'Lift one piece out of the halves circle and set it on the mat. Let your child hold it and fit it back before lifting it out again.',
        say: 'This circle is cut into two equal pieces. This piece is one half.',
      },
      {
        text: 'Do the same with the thirds and fourths circles: lift one piece, name it, and let your child fit it back into its frame.',
        say: 'Three equal pieces — this is one third. Four equal pieces — this is one fourth.',
      },
      {
        text: 'Give a three-period lesson with the three pieces on the mat: name them, ask your child to hand you each one, then point and ask what each is called.',
        say: 'Show me one third. … Now, what is this one called?',
      },
      {
        text: 'Set one half beside one tenth and let your child compare them in their hands. Count the tenths in their frame together, touching each piece.',
        say: 'The more pieces we cut, the smaller each piece is.',
      },
      {
        text: 'When the names are comfortable — today or another day — write 1/2 on paper. Point to the bottom number, then the top number, then match the symbol to the real piece.',
        say: 'The bottom number tells how the whole was cut: into two pieces. The top number counts how many pieces we have: one. One half.',
      },
      {
        text: 'Show your child how to return every piece to its frame and check that each circle is complete before putting the work away.',
        say: 'Every family fills its own circle exactly.',
      },
    ],
    pointsOfInterest: [
      'Lifting the smooth red pieces out of their frames and fitting them back perfectly',
      'How slim a tenth is next to the big, heavy-looking half',
      'The family names sound like counting words: third, fourth, fifth, sixth…',
      'A cut-up circle can always be rebuilt into a whole again',
    ],
    controlOfError: [
      'Each piece fits only its own frame exactly — a wrong piece leaves a gap or overlaps the others',
      'Counting the pieces in any frame confirms its family name (the fifths circle has exactly five pieces)',
      'The rebuilt apple (or paper circle) visibly succeeds or fails at being whole',
    ],
    vocabulary: [
      'whole',
      'half, halves',
      'third, fourth (also called a quarter), fifth, sixth, seventh, eighth, ninth, tenth',
      'fraction',
      'equal parts',
    ],
    variations: [
      'A feeling game: with eyes closed, your child finds the half — or the tenth — from three paper-plate wedges by touch alone',
      'A fraction hunt at mealtime: name the fractions you see when pizza, oranges, or sandwiches are divided',
      'Name a piece and have your child fetch it from across the room, keeping the name in mind as they walk',
    ],
    extensions: [
      'Trace the whole circle on paper, then trace a single piece inside it and color it red',
      'Lay out one piece from every family in a row, biggest to smallest, and read the names down the line',
      'Label paper-plate wedges with their symbols (1/2, 1/3, 1/4…) and shuffle them for a matching game',
    ],
    whatComesNext:
      'When your child names the pieces easily and reads simple symbols like 1/4, move on to Fraction Equivalence, where they discover that two fourths make exactly one half. Much later, the tenths from this box return in the Introduction to the Decimal Board.',
    followUpWork: [
      {
        description:
          'Print a fractions page at the naming level: your child looks at each pictured piece, says its name aloud, and writes the fraction symbol underneath in pencil.',
        worksheetSlug: 'fractions',
      },
      {
        description:
          'Fold paper circles into halves and fourths, cut along the folds, color one piece of each, and write its symbol on the piece — a scissors-and-crayon version of today’s lesson.',
      },
      {
        description:
          'Draw three "pizzas" on paper. Divide one into halves, one into thirds, one into fourths, shade one slice of each, and label the shaded slice with its fraction.',
      },
    ],
  },
  {
    slug: 'fractions-equivalence',
    name: 'Fraction Equivalence',
    strand: 'fractions',
    sequence: 2,
    ages: [7, 9],
    grades: '2–3',
    overview:
      'A detective game with the fraction circles: can any other family rebuild one half exactly? Your child lays smaller pieces into the space of a larger one and discovers equivalence — different names, the very same amount.',
    materialsNeeded: [
      'Fraction circles (or the paper-plate wedge families from the introduction lesson)',
      'A work mat or solid-color placemat',
      'Pencil and paper for recording the equivalences discovered',
      'Optional: a sheet of paper with a traced outline of the half piece, for laying trial pieces inside',
    ],
    virtualMaterials: ['fraction-circles'],
    prerequisites: ['fractions-intro'],
    directAims: [
      'Discover that some fractions name the same amount: 1/2 = 2/4 = 3/6 = 4/8 = 5/10',
      'Test a fill honestly — pieces either rebuild the target exactly or visibly fail',
      'Record equivalences in symbols with pencil and paper',
    ],
    indirectAims: [
      'Prepare for comparing fractions and for adding fractions with unlike denominators',
      'Prepare for reducing fractions to lowest terms',
      'Build the habit of testing a mathematical claim with materials instead of asking an adult',
    ],
    presentation: [
      {
        text: 'Lift one half out of its frame and lay it on the mat where the empty half-space in the frame stays visible.',
        say: 'Here is one half. I wonder… can another family make one half exactly?',
      },
      {
        text: 'Try the fourths. Lay fourth pieces on top of the half piece (or into its empty space in the frame), one at a time, until it is covered exactly.',
        say: 'One fourth… two fourths. Two fourths cover one half exactly!',
      },
      {
        text: 'Say the discovery clearly and write it in pencil where your child can see: 1/2 = 2/4.',
        say: 'Two fourths and one half are worth the same. We say they are equivalent.',
      },
      {
        text: 'Invite your child to try the sixths family the same way, counting each piece as it goes down, then the eighths and the tenths.',
        say: 'How many sixths will it take? What do you think?',
      },
      {
        text: 'Now try the fifths — this failure is the best part. Two fifths leave a sliver of the half uncovered; three fifths spill past its edge.',
        say: 'Two fifths are too little, three fifths are too much. The fifths family cannot make one half.',
      },
      {
        text: 'Read the finished record together: 1/2 = 2/4 = 3/6 = 4/8 = 5/10. Let your child hunt for a pattern in the numbers.',
        say: 'Look at the top and bottom of each one. Do you notice anything?',
      },
      {
        text: 'Another day, repeat the game with one third as the target and let your child run the investigation: sixths work (2/6), ninths work (3/9), and the rest do not.',
        say: 'Which families do you predict can make one third?',
      },
    ],
    pointsOfInterest: [
      'The suspense of the last piece — will it fit exactly or spill over?',
      'Fifths refusing to make a half, no matter how they are arranged',
      'The pattern hiding in 1/2, 2/4, 3/6, 4/8, 5/10: the top counts up by one while the bottom counts by two',
      'Different names — one half, two fourths, five tenths — for the very same amount of circle',
    ],
    controlOfError: [
      'The pieces themselves: an equivalent fill covers the target exactly, while a wrong family leaves a gap or overhangs the edge',
      'On the virtual material, the Check button confirms only what the pieces already show',
      'Recounting the pieces and rebuilding the fill settles any doubt',
    ],
    vocabulary: ['equivalent', 'equivalence', 'equal parts', 'family (of fraction pieces)', 'exactly'],
    variations: [
      'Reverse the game: lay out three sixths and ask which single piece is worth the same',
      'A prediction game: before testing a family, your child writes down how many pieces they think it will take, then tests',
      'Use two halves, then try to rebuild one whole out of a single other family — every family can do it!',
    ],
    extensions: [
      'Make an equivalence chart: trace the half piece, then draw and label every fill that worked (2/4, 3/6, 4/8, 5/10)',
      'Investigate one fourth and one fifth as targets (2/8 works for a fourth; 2/10 works for a fifth)',
      'Ask the big question: why do fifths, sevenths, and ninths all fail to make a half? Let the pieces argue the answer',
    ],
    whatComesNext:
      'Once your child can find equivalent fills and record them in symbols, they are ready for Adding & Subtracting Fractions, where pieces from a single family are joined and taken away — and a sum grows past one whole circle.',
    followUpWork: [
      {
        description:
          'Print a fractions page with equivalence problems: your child fills in the missing number in pairs like 1/2 = ?/6, checking any doubtful one by rebuilding it with the pieces.',
        worksheetSlug: 'fractions',
      },
      {
        description:
          'Fold two same-size paper strips — one into halves, one into eighths — shade one half and four eighths, and hold the strips side by side to see the equivalence, then write it as symbols.',
      },
      {
        description:
          'Write each discovered equivalence chain from memory (1/2 = 2/4 = 3/6 = 4/8 = 5/10, and the chain for 1/3), then check the written chains against the circles.',
      },
    ],
  },
  {
    slug: 'fractions-operations',
    name: 'Adding & Subtracting Fractions',
    strand: 'fractions',
    sequence: 3,
    ages: [7, 10],
    grades: '2–4',
    overview:
      'The first fraction arithmetic: joining and taking away pieces of one family. Because every piece is the same size, adding is simply counting pieces — and when a sum grows past a whole, the pieces visibly complete a full circle.',
    materialsNeeded: [
      'Fraction circles — for sums past one whole you need extra pieces, so borrow from a second set or cut a spare paper-plate family (the virtual material has spares built in)',
      'A work mat or solid-color placemat',
      'Pencil and paper for writing each equation',
      'Slips of paper with same-denominator problems, e.g. 2/8 + 3/8, 5/6 − 2/6, 5/8 + 6/8',
    ],
    virtualMaterials: ['fraction-circles'],
    prerequisites: ['fractions-equivalence'],
    directAims: [
      'Add fractions with the same denominator by joining and counting pieces',
      'Subtract fractions with the same denominator by taking pieces away',
      'Rename an improper sum as a mixed number: 11/8 is one whole and three eighths',
    ],
    indirectAims: [
      'Show that only the numerator counts pieces — the family (denominator) does not change when adding like pieces',
      'Prepare for adding unlike denominators, where equivalence work supplies the common family',
      'Prepare for abstract, pencil-only fraction arithmetic',
    ],
    presentation: [
      {
        text: 'Write 2/8 + 3/8 = at the top of a paper. Build the first number on the mat with two eighths, leave a hand’s width of space, and have your child build three eighths beside it.',
        say: 'Two eighths… plus three eighths. The plus sign tells us to put them together.',
      },
      {
        text: 'Slide the two groups together into one arc and count every piece aloud, touching each one.',
        say: 'One, two, three, four, five — five eighths. Two eighths plus three eighths is five eighths.',
      },
      {
        text: 'Have your child write the answer: 2/8 + 3/8 = 5/8. Point at the numbers as you talk about them.',
        say: 'Look — the bottom number never changed. We only counted pieces of the same family.',
      },
      {
        text: 'Now subtraction. Write 5/8 − 2/8 =, build five eighths, and have your child take two away and return them toward their frame.',
        say: 'Five eighths, take away two eighths… count what is left. Three eighths.',
      },
      {
        text: 'The big moment: write 5/8 + 6/8 =. Build both numbers and slide them together — the pieces complete one full circle with pieces left over.',
        say: 'Eleven eighths — and look, eight of them made a whole circle! Eleven eighths is one whole and three eighths.',
      },
      {
        text: 'Record the sum both ways: 5/8 + 6/8 = 11/8 = 1 whole + 3/8. Read both forms aloud together.',
        say: 'Eleven eighths and one-and-three-eighths are two names for the same amount.',
      },
      {
        text: 'Give your child the slips of problems to work through alone: build, count, and write each equation in pencil. Stay nearby but let the pieces do the correcting.',
        say: 'The pieces will always tell you if the answer is right.',
      },
    ],
    pointsOfInterest: [
      'Watching a sum of flat pieces suddenly close into a complete circle',
      'The denominator stubbornly staying the same while the numerator does all the counting',
      'Saying big improper fractions out loud: "eleven eighths!"',
      'Subtraction physically undoing an addition, piece by piece',
    ],
    controlOfError: [
      'The answer is a count of real pieces — recounting them settles it without an adult',
      'A completed whole circle announces itself; the sum has passed one and must be renamed',
      'Taking away more pieces than are on the mat is physically impossible',
    ],
    vocabulary: ['plus, minus, equals', 'sum', 'difference', 'numerator', 'denominator', 'mixed number', 'improper fraction'],
    variations: [
      'Roll a die twice to invent addition problems in a chosen family (e.g. 4/10 + 5/10), build them, and record them',
      'Play "make it whole": lay out 5/8 and ask how many more eighths are needed to finish the circle',
      'Chain problems: start with 3/6, add 2/6, subtract 4/6, adding and removing pieces as you go',
    ],
    extensions: [
      'Sums past one whole in other families: 7/10 + 6/10, 3/4 + 3/4 — build, rename as mixed numbers, and record',
      'After a sum like 4/8 + 2/8 = 6/8, use the equivalence work to rename the answer 3/4 with fourths pieces laid on top',
      'For an older child: try 1/2 + 1/4 with the pieces, and let the puzzle of unlike families point back to equivalence',
    ],
    whatComesNext:
      'This closes the first fraction sequence. From here, practice mixed problems on paper until they are fluent; a child who also finishes the decimal-system work is ready for the Introduction to the Decimal Board, where tenths reappear as decimal fractions written with a point.',
    followUpWork: [
      {
        description:
          'Print a fractions page of same-denominator addition and subtraction: your child solves each problem in pencil, building any doubtful one with the circle pieces to check.',
        worksheetSlug: 'fractions',
      },
      {
        description:
          'Have your child write three "past a whole" problems of their own (like 5/8 + 6/8), solve them, and draw the completed circle plus leftover pieces beside each answer.',
      },
      {
        description:
          'Make a fact page for one family: all the ways to compose a whole from eighths (1/8 + 7/8, 2/8 + 6/8, …), written neatly in pencil and checked with the pieces.',
      },
    ],
  },
]
