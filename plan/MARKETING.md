# Marketing Plan — Getting Montessori Math in Front of People

**Status:** Draft, 2026-10-08. Nothing below has been done yet.

The goal is to reach the people who would use the site: parents doing Montessori at
home, families at Montessori schools, Montessori guides, homeschoolers, and the
teachers and tutors who need good manipulatives. It costs nothing and keeps the
hard rules: no analytics, no accounts, no ads.

## The short version

1. **Fix how the site looks to search engines and link previews.** Today every URL
   serves the same empty page, so shared links all look like the home page and
   most crawlers see no content at all. This comes first. It's code work (proposed PRD 20).
2. **Register with Google Search Console and Bing Webmaster Tools.** Free, takes 30
   minutes, and needs no change to the site.
3. **Launch in waves**, one community a week: Montessori communities, then
   homeschool communities, then Hacker News.
4. **Use Pinterest as the long-term engine.** It's where parents search for printables,
   and a pin keeps sending visitors for months, not days.
5. **Reach out to the people who pass resources on:** Montessori schools, training
   centers, bloggers, and the authors of "free Montessori resources" roundup posts.

Expect about 6–8 hours a week for the first 8 weeks, then about 3 hours a week.

---

## Who it's for and where to find them

| Audience | What they get from the site | Where they gather | Best page to send them |
|---|---|---|---|
| Montessori-at-home parents (core) | Lessons written for untrained parents; materials they can't afford to buy | r/Montessori, "Montessori at home" Facebook groups, Instagram, Pinterest | `/parents/using-this-site` |
| Families at Montessori schools | A way to support at home what the child does at school | School newsletters, parent-education nights | `/parents/montessori-math-overview` |
| Montessori guides and assistants | Printables with answer keys, paper kits, command cards | Montessori teacher Facebook groups, training-center alumni networks | `/worksheets`, `/kits` |
| Homeschoolers (eclectic) | Free worksheets with answer keys, a scope and sequence by age | r/homeschool, homeschool Facebook groups, co-ops, Pinterest | `/ages`, `/worksheets` |
| Teachers, tutors, math coaches | Virtual base-ten, fraction, and hundred-board manipulatives | Bluesky (#iteachmath, #MTBoS), Teachers Pay Teachers | `/materials` |
| Developers who are also parents | A well-made, private, offline, open-source tool | Hacker News, GitHub | `/` plus the repo |

## Positioning

**One-liner:** A free Montessori math album: 21 virtual materials, 41 lessons written
for parents, and printable worksheets in true Montessori color or ink-friendly B&W.
No accounts, no ads, no tracking.

**Why it lands:**

- **The physical materials are expensive.** Golden beads, the stamp game, bead frames,
  and racks and tubes add up fast. Virtual versions and print-and-cut kits close that gap.
- **The "album" usually comes from teacher training.** Parents rarely get the
  step-by-step presentations, and these are written for them.
- **It's private by design.** Nothing collects data, so there's nothing for a
  school's student-privacy review to flag. Lead with this for schools and teachers.
- **Kids work on paper.** Many parents want less screen time, not another app.

**Words to use:** free, printable, album, lessons, materials, no sign-up, works offline.
**Words to avoid:** app, platform, gamified, "learn math fast". Never claim AMI or AMS
endorsement, and never call it certified.

---

## Step 0 — Before telling anyone (weeks 1–2)

### 0.1 Fix discoverability (code, proposed PRD 20)

What I found on the live site (2026-10-08):

- **Every URL serves the identical HTML:** the same `<title>`, the same description,
  and an empty `<div id="root">`. Google renders JavaScript, eventually. Facebook,
  Pinterest, iMessage, Slack, and Reddit link previews never do, and neither do
  many other crawlers, including most AI assistants'. So a link to the stamp-game lesson
  previews as the generic home page with no image, and to a non-rendering
  crawler the site has no content at all.
- **`/robots.txt` and `/sitemap.xml` return the home page** (`200 text/html`).
- **Unknown paths return 200**, for example `/this-does-not-exist`. Search engines
  call these "soft 404s."
- **There's no social preview image** (`og:image`).
- `www.` already redirects to the bare domain with a 301, so that part is fine.

Proposed fix. It's all build time and needs no new dependencies, since `react-dom/server` and
React Router 7's static rendering are already installed:

1. **Prerender every route.** After `vite build`, a script lists every route from the
   registries (about 96 pages: home, 7 index pages, 21 materials, 41 lessons, 13
   worksheet builders, 7 kits, 6 guides). It writes `dist/<route>/index.html` with that page's
   own `<title>`, meta description, canonical URL, and Open Graph/Twitter tags. The
   descriptions already exist as the `summary`/`description` fields on every content type.
   - *Minimum version:* inject head tags only. That fixes link previews and gives every page
     a distinct title.
   - *Full version:* also render the page body into the HTML. That fixes crawlers that
     don't run JavaScript, and it's the bigger search win.
2. **Generate `sitemap.xml` and `robots.txt`** at build time from the same route list.
   Allow all crawlers, AI ones included. The goal is reach.
3. **Return real 404s.** Once every real route has a file, switch `not_found_handling`
   in `wrangler.jsonc` to `"404-page"` so typos get a true 404.
4. **Add a 1200×630 `og-image.png`** to `public/`: a golden bead mat plus the site name.
   Per-section variants are optional.
5. **Precache the new HTML files.** Make sure `scripts/generate-sw.mjs` includes them so
   offline still works.

Hard-rule check: all of this happens at build time and the output is static files, so
nothing makes a request at runtime.

### 0.2 Two small product changes (owner's call, for the review list)

- **A one-line footer on every printed page**, for example "montessori-math.org: free
  Montessori math", small and in the margin. Printed sheets travel to co-ops,
  classrooms, grandparents, and Instagram photos. Without a footer, a sheet doesn't
  say where it came from. This is a print change, so it goes on the printables review
  list rather than being made now.
- **A way to reach you.** Add a "Contact / corrections" link to the colophon. The simplest
  setup is `hello@montessori-math.org` through **Cloudflare Email Routing**, which is free,
  forwards to your Gmail, and adds nothing to the site but a `mailto:` link. GitHub
  Issues works too, but most parents won't use it. Corrections from Montessori guides
  are valuable, and the launch posts below ask for them.

### 0.3 Finish the printables review first

`plan/QA-CHECKLIST.md` has 72 unchecked items. A launch brings one burst of first
impressions, and printables are what people share. At minimum, review the sheets and
kits you'll feature in screenshots and pins before Step 2. The search-engine setup
below can start right away, since it's quiet.

### 0.4 Register with search engines (30 minutes, no code)

**Google Search Console**

1. Go to <https://search.google.com/search-console> → **Add property** → choose
   **Domain** → enter `montessori-math.org`.
2. Copy the TXT record it gives you.
3. In the Cloudflare dashboard: **montessori-math.org → DNS → Records → Add record**,
   type `TXT`, name `@`, and paste the value. Save, then click **Verify** in Search Console.
   It can take a few minutes.
4. After PRD 20 ships: **Sitemaps** → submit `https://montessori-math.org/sitemap.xml`.
5. Use **URL Inspection** → **Request indexing** for the home page, the 6 index pages,
   and about 10 of the best lessons, such as the golden beads and stamp game lessons and
   `/parents/scope-and-sequence`.

**Bing Webmaster Tools**

1. Go to <https://www.bing.com/webmasters> → sign in → **Import from Google Search
   Console**. One click, no second verification.
2. Submit the same sitemap. Bing's index also feeds DuckDuckGo and the web search
   in several AI assistants.

### 0.5 Make a launch kit (2–3 hours, reused everywhere)

- **4–6 screenshots:** golden beads mid-exchange, the stamp game, a lesson page, the
  worksheet builder with color and B&W side by side, a kit page with its
  calibration square.
- **One 30–60 second screen recording**, no voiceover. Use presentation mode on
  `/lessons/golden-beads-addition`: it builds 1,568 + 1,679 through three exchanges.
  Then show a worksheet's print preview in color, then B&W.
- **2–3 photos of real printed sheets** on a table with a pencil, plus a cut-out kit.
  Photos of paper do better than screenshots on Pinterest, Instagram, and Facebook,
  and they show the "practice on paper" idea.
- **The one-liner and a one-paragraph description** (see Positioning).
- **The GitHub repo's About box:** set the website to `https://montessori-math.org`,
  add topics (`montessori`, `homeschool`, `math`, `education`, `printables`,
  `manipulatives`), and add a screenshot near the top of the README. Do this in the GitHub web
  UI: repo page → gear icon next to **About**.

---

## Step 1 — Soft launch (week 3)

1. Send the site to 5–10 people you know who are the audience: a Montessori guide, a
   homeschooling parent, a parent at a Montessori school.
2. Ask them three questions: *What did you try first? Where did you get stuck? Who would you
   send this to?* The answers to the third question start your outreach list.
3. Fix what they find before the public posts.

## Step 2 — Community launch (weeks 4–6, one channel at a time)

Rules for every post:

- **Read each community's rules**, and message the moderators first if self-promotion is unclear.
- **Say plainly that you made it.**
- **Ask for corrections and feedback**, not just attention.
- **Reply to every comment the same day.**
- **Post Tuesday–Thursday mornings, US Eastern.**
- **Never post the same text in several places on the same day.**

**2.1 r/Montessori (week 4).**

1. Read the sidebar rules. If self-promotion isn't clearly allowed, message the mods and ask.
2. Post Template A with 2–3 screenshots or the video.
3. Plan to spend the day replying. Note every correction and fix the real ones quickly,
   then say in the thread that you fixed them. That builds credibility fast.

**2.2 Montessori Facebook groups (week 4).**

1. Search Facebook for "Montessori at home", "Montessori homeschool", "Montessori
   elementary", and "Montessori teachers". Join 5–8 groups with daily activity.
2. Spend a week answering other people's questions before posting anything.
3. Many groups allow promotion only on a set day. Use it.
4. Post Template E with a photo of the printed sheets. Space the groups a day or two apart.

**2.3 r/homeschool and homeschool Facebook groups (week 5).** Use Template A, but lead
with "free printable worksheets with answer keys, plus step-by-step lessons for
parents" and less Montessori jargon. Many homeschoolers are eclectic, and Montessori
is a draw for them rather than an identity.

**2.4 Show HN (week 6).**

1. Make sure PRD 20 has shipped, so links preview well, and that the printables review is done.
2. Submit at <https://news.ycombinator.com/submit> with the title from Template B and
   the URL `https://montessori-math.org`. Do it on a weekday between 8 and 10am US Eastern.
3. Immediately add the first comment from Template B.
4. Stay for 3–4 hours and answer everything, including the technical questions.
5. Don't ask anyone to upvote. HN detects voting rings and buries the post.
6. If it sinks without discussion, HN allows an occasional repost later. Wait a few
   weeks, not a few days.

**2.5 Optional: Bluesky or Mastodon.** Only if you already post there. Math teachers use
#iteachmath and #MTBoS. The video does best.

---

## Step 3 — Durable channels (month 2 onward)

### 3.1 Pinterest (the long game for printables)

A Reddit post brings visitors for a few days. A good pin brings them for months,
because Pinterest works like a search engine for "free printable" and homeschool searches.

1. **Create a free Pinterest Business account**, or convert a personal one.
2. **Claim the website:** **Settings → Claimed accounts → Websites → Claim**. Pick the
   DNS TXT option if it's offered, which adds a Cloudflare DNS record like the one in 0.4.
   Otherwise use the meta tag, a one-line change to `index.html`.
3. **Create 8 boards:**
   - Free Montessori Math Printables
   - Golden Beads & Place Value
   - Montessori Stamp Game
   - Montessori Math at Home (lessons)
   - Fractions & Decimals
   - Skip Counting & Bead Chains
   - DIY Montessori Materials (kits)
   - Montessori Math Scope & Sequence
4. **Make about 40 vertical pins at 1000×1500**, one design template used throughout. Canva's free tier is enough.
   - Pins: one per worksheet builder (13), one per kit (7), one for each of about 20 key lessons.
   - Layout: a photo or crisp image of the printed sheet on the top two-thirds, then a
     text band such as "Free Stamp Game Worksheets: color or B&W, with answer
     keys", then the URL in small type.
5. **Link every pin to its specific page**, not the home page. This works once PRD 20 ships.
6. **Write descriptions in plain words people search for:** "montessori stamp game
   printable", "golden bead activities", "free homeschool math worksheets", "montessori
   math at home".
7. **Schedule 1–3 pins a day** with Pinterest's built-in scheduler. Batch the work into
   one session a week.
8. **Each month**, check Pinterest Analytics for the top pins by outbound clicks, and make 3
   new variations of each winner.

### 3.2 Montessori schools

One mention in a school newsletter reaches hundreds of families who already value
Montessori, and schools are always asked how families can support math at home.

1. **Build a list of 50 schools.** The Montessori Census (<https://www.montessoricensus.org>)
   lists US schools by state. Start with your region and with public Montessori programs.
2. **Find the right contact** on each school's website: the head of school or the
   parent-education coordinator.
3. **Send Template C:** short, personal, no attachments.
   - Timing: early December (winter break), January, and April–May (summer packets).
   - Avoid Thanksgiving week.
4. **Optional:** a one-page flyer with a QR code that schools can post or send home.
5. **Track it in a spreadsheet.** Follow up once after two weeks, then stop.

### 3.3 Teacher-training centers

AMI and AMS both publish directories of their training centers. Email the program
directors. The pitch: virtual materials for adult learners practicing presentations
away from the classroom, and parent guides their graduates can use at parent-education
nights. Be respectful: trainees write their own albums, so don't pitch the lessons as a
replacement.

### 3.4 Bloggers, Instagram accounts, and roundup posts

1. **Find existing roundups.** Search Google for "free montessori math resources",
   "montessori math printables free", and "montessori homeschool math". Many "best free
   resources" roundups already rank, and a link from one brings visitors and helps search.
   Email each author with Template D.
2. **Find creators.** Search Instagram for #montessorihomeschool, #montessorimath,
   #montessoriathome, and #montessorielementary.
   - Prioritize accounts with children ages 4–12. Toddler-focused accounts are a weak
     fit, since the site starts at age 4.
   - Pick 30 and engage genuinely for a while before reaching out.
3. **Reach out with a personal note**, not a blast. Mention a specific post of theirs.

### 3.5 Directories and lists

- State homeschool association resource pages and co-op newsletters.
- Your local library's "homeschool" or "homework help" resource page. Libraries
  like free, ad-free, privacy-respecting resources.
- Curated GitHub lists of education resources, such as "awesome" lists. Open a pull request
  adding the site, which helps the developer audience.

### 3.6 Answer questions (30 minutes a week, the highest-converting habit)

Each week, search Reddit, Facebook groups, and Quora for "stamp game", "golden beads",
"montessori math at home", "montessori long division", and "which montessori math
materials to buy". Answer the actual question, and link the specific lesson only when it
really helps. This also earns links that help search.

### 3.7 Optional: Teachers Pay Teachers

TpT is where many classroom teachers look first, and free listings are allowed. You
would build a small free PDF sample pack by printing to PDF from the builders, with the
site URL on it. Check TpT's current seller policy on outside links before relying on it.
Lower priority than everything above.

---

## Step 4 — Make search compound (monthly, ongoing)

1. **Search Console → Performance → Queries and Pages**, once a month:
   - Pages with many impressions but few clicks need a better title or description.
   - Queries where you rank about 8–20 show which pages to strengthen first.
2. **Match page titles to how parents search.** For example, a lesson titled "Stamp
   Game: Addition" could be titled "How to Teach Addition with the Montessori Stamp Game"
   for search. That's a content change, so it's your call page by page.
3. **Fill content gaps** (scope changes, owner decides). Common parent questions the site
   could answer well:
   - "Montessori math at home without buying materials": tie together the kits and
     virtual materials.
   - "Which Montessori math materials to buy first": an honest answer earns trust and
     links.
4. **Seasonal calendar:**
   - August–September: back to school.
   - December: winter-break packets.
   - January: homeschool mid-year planning.
   - April–June: summer learning and homeschool convention season. Bring flyers to
     local conventions.

---

## Measuring without analytics

Hard rule 1 rules out analytics on the site. Don't add any, because "no tracking" is
itself a selling point. Measure from the outside instead:

- **Google Search Console and Bing Webmaster Tools** (weekly): clicks, impressions,
  top queries, pages indexed, and other sites linking to you (**Links** report).
- **Cloudflare dashboard → montessori-math.org → Analytics:** aggregate requests and
  visitors, counted at the server, with nothing added to the page.
- **Pinterest Analytics:** outbound clicks per pin.
- **GitHub stars and issues, and emails to `hello@`.**
- **A simple log spreadsheet:** date | channel | link | what happened. After a couple of
  months it shows which channels deserve your time.

**Signs it's working by early January:**

- All ~96 pages indexed in Search Console.
- Search clicks rising week over week.
- At least 5 other sites linking to you.
- Pins sending outbound clicks.
- Schools or bloggers sharing it without being asked.

---

## Calendar

| Week | Dates (2026) | Do |
|---|---|---|
| 1 | Oct 12–18 | Search Console and Bing (0.4); Cloudflare Email Routing; start PRD 20 |
| 2 | Oct 19–25 | Finish PRD 20 and submit the sitemap; review featured printables (0.3); launch kit and GitHub About (0.5) |
| 3 | Oct 26–Nov 1 | Soft launch to 5–10 people; fix what they find |
| 4 | Nov 2–8 | r/Montessori; first Montessori Facebook groups |
| 5 | Nov 9–15 | r/homeschool and homeschool groups; set up Pinterest (account, claim, boards, first 10 pins) |
| 6 | Nov 16–22 | Show HN; 10 more pins |
| 7 | Nov 23–29 | Light week (Thanksgiving): build the school and blogger lists |
| 8 | Nov 30–Dec 6 | School emails, batch 1 (25), timed for winter break; roundup-author emails (15) |
| Ongoing | From December | About 3 hours a week: pins in one weekly batch, 30 min answering questions, 10 outreach emails, monthly Search Console review |

## Don'ts

- **Don't add analytics, ad pixels, an email-gated download, or a sign-up.** Each one
  breaks the hard rules and the trust story.
- **Don't add the site to Wikipedia yourself.** That's a conflict of interest, and the link
  gets reverted and flagged.
- **Don't ask friends to upvote.** It gets posts buried on HN and Reddit.
- **Don't imply AMI or AMS endorsement.**
- **Don't paste the same post into many groups at once.** It looks like spam and gets
  caught by spam filters.
- **Skip paid ads for now.** If organic channels work and you want to go faster, the cheapest
  test is promoting your best-performing pin on Pinterest.

---

## Templates

Fill in the bracketed parts in your own words. An honest sentence about why you built
it matters more than anything else in the post.

### A. Reddit (r/Montessori, r/homeschool)

**Title:** I made a free Montessori math site: virtual materials, album lessons
for parents, and printable worksheets (no accounts, no ads)

> Hi all, [one or two sentences: who you are and why you built it].
>
> It's montessori-math.org. What's there:
>
> - 21 virtual materials (golden beads, stamp game, bead frames, racks and tubes,
>   checkerboard, fraction circles, and more) for families who don't own the physical ones.
>   Real beads are always better when you have them.
> - 41 album-style lessons written for parents without training: aims, materials,
>   step-by-step presentation with suggested words, control of error, what comes next.
> - Worksheet builders with answer keys that print in Montessori colors or
>   ink-friendly B&W, plus print-and-cut paper kits (stamp tiles, number cards,
>   fraction circles, play money).
>
> No login, no ads, no tracking, and it works offline once loaded.
>
> I'd really value corrections from guides here, especially on presentation sequence
> and terminology. What's wrong or missing?

### B. Show HN

**Title (78 characters, under HN's 80 limit):**
Show HN: Free Montessori math materials and printable worksheets for kids 4–12

**First comment:**

> [Why you built it, in a sentence or two.]
>
> Montessori math is taught through a sequence of physical materials, and the "album"
> that explains how to present them usually comes from teacher training. Both are out of
> reach for most parents. This puts 21 of the materials on screen, 41 parent-friendly
> lessons alongside, and printable follow-up work.
>
> Some choices that may interest HN:
>
> - No accounts, analytics, ads, CDNs, or server. It's a static React app on Cloudflare,
>   and a dependency-free service worker makes it fully offline after one visit.
> - Kids practice on paper by design. The only on-screen activity is the materials
>   themselves. Print is a first-class feature: every sheet comes in Montessori color or B&W,
>   where patterns replace color so place values stay distinguishable.
> - Worksheets come from pure generators with a seeded PRNG, so a seed reproduces a sheet
>   exactly, and the tests check every answer key.
> - The weekly planner keeps its whole state in the URL, so it's shareable and nothing is stored.
>
> Source: https://github.com/ericterpstra/montessori-math
>
> Feedback welcome, especially from Montessori teachers on terminology and sequence.

### C. Email to a Montessori school

**Subject:** A free Montessori math resource for your families

> Hi [Name],
>
> I built montessori-math.org, a free resource that helps parents support Montessori
> math at home. It has parent-friendly versions of the presentations (golden beads,
> stamp game, bead frames, fractions, and more), virtual materials for families who don't have the
> physical ones, and printable worksheets in Montessori colors with answer keys.
>
> It has no accounts, ads, or tracking, so no student data is involved and there's
> nothing for families to sign up for.
>
> If it seems useful, please feel free to share it with your families, in a newsletter,
> at a parent-education night, or ahead of winter break. I'd also welcome corrections
> from your guides.
>
> Thank you,
> [Your name]

### D. Email to a blogger or roundup author

**Subject:** A free resource for your "[post title]" list

> Hi [Name],
>
> I enjoyed [specific post, and one specific thing about it]. I made a free Montessori math
> site that might fit [that roundup / your readers]: montessori-math.org. It has virtual
> golden beads, stamp game, and bead frames, parent-friendly album lessons, and
> printable worksheets in Montessori color or B&W. There's no sign-up or email gate.
>
> If you try it, I'd love to hear what's missing. Either way, thanks for what you share.
>
> [Your name]

### E. Facebook group post (with a photo of printed sheets)

> I made a free Montessori math site for families doing this at home:
> montessori-math.org. It has step-by-step lessons for parents (golden beads, stamp game,
> bead frames, fractions...), virtual materials for when you don't have the physical
> ones, and printable worksheets with answer keys in Montessori colors or B&W. No sign-up
> or ads. I'd love corrections from anyone with training. [One line about why you built it.]
