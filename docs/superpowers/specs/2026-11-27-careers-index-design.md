# Careers index — two variants (2026-11-27)

## Intent
Replace the "Coming soon" `/careers` with a real page that sells the company to candidates and lists the
three open roles. Copy is the forwarded pitch ($1T on paid ads → organic distribution → 7x to $20M ARR →
$100M with 30 people, 12 spots left, the kinds of people we hire, "Join us."), word for word.

## Goals / non-goals
- Goal: two variants of the index to compare — A (white, calm) and C (told by the scroll).
- Goal: the three roles — Creative director, Head of growth, Thinker-writer — each clearly clickable.
- Non-goal (later): the role pages themselves. Their content and format come later; the Creative Director
  drafts (`/exp/cd`, `cd-2`, `cd-3`) are untouched.
- Anti-goal: anything that makes the roles hard to find or the pitch hard to read; sans-serif type.

## Approaches (picked in conversation)
- A. All white, as /about — picked, ships at `/careers`.
- B. Dark pitch over white roles — not picked.
- C. Scroll-told, as /exp/cd-2 — picked as the second variant, at `/exp/careers-2` (behind the /exp password).

## Design
Shared: role list + pitch copy in `components/careers/content.ts`. Until role pages exist, each role links to
its current Notion posting (the links ComingSoon already uses), opening in a new tab. Season Mix for display,
IBM Plex Mono for body. The site chrome (fixed wordmark/nav, rails) and the Fibonacci footer as on every page.

**A — `/careers`** (white, the /about + legal page system: rails, ticks, 512px-ish column widened where the
headline needs it):
- Pale "Careers" over a Season Mix headline drawn from the pitch.
- The pitch paragraphs in mono, the figures ($1T, 7x, $20M ARR, $100M, 30 people, 12 spots) set so they
  stand out (ink vs the grey body).
- "Open roles": three full-width ruled rows — role name in Season Mix, → at the right; hover darkens/shifts
  the arrow. Light reveal on load; respects reduced motion.
- `ComingSoon` keeps only its manifesto use.

**C — `/exp/careers-2`** (scroll-told, reusing cd-2's techniques: pinned stage, Lenis, scenes driven by
scroll progress):
- Pinned scenes, one idea each: "$1T spent on paid marketing…" → "diminishing returns" → "organic
  distribution, faster than we can hire" → "7x. $20M ARR." → "$100M with 30 people." → "12 spots left."
  Figures large in Season Mix; the supporting sentence in mono.
- After the stage: who we hire (the list from the pitch), then the three roles as large rows, then "Join us."
- Reduced motion: the scenes stack as plain sections.
- Listed on the /exp index.

## Left to the builder
Exact sizes, easing and scene timing; tuned by eye with real scroll captures at desktop and phone widths.
