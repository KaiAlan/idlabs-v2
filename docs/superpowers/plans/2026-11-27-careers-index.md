# Careers Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `/careers` (variant A, white) and `/exp/careers-2` (variant C, scroll-told) listing the three roles.

**Architecture:** One content module (pitch + roles) feeds both pages. A reuses the legal/about page system
(`legal.css`, rails, SiteChrome, Fibonacci footer). C is a pinned stage whose scenes are scrubbed by the
scroll (the cd-2 technique, written fresh and smaller), then plain sections.

**Tech Stack:** Next.js 16.4 App Router, React 19, CSS, Lenis (global SmoothScroll). No test runner in the
repo: verification is `npm run typecheck`, `npm run build`, and Playwright screenshots at 1440 and 390 wide.

**Spec:** `docs/superpowers/specs/2026-11-27-careers-index-design.md`

## Global Constraints
- Copy word for word from the forwarded message; sentences may be split across scenes, never reworded.
- Season Mix for display, IBM Plex Mono for body (caps, as the site's mono). No sans-serif.
- Roles link to their Notion postings, new tab, `rel="noopener noreferrer"`.
- Do not touch `app/exp/cd*` (another session has uncommitted work in cd-3).

## Review Focus
- Phones (390px): the role rows and the big figures must not overflow sideways.
- Reduced motion: C's scenes must all be readable without scrolling animation.
- No JS / before hydration: C's first scene visible; A fully visible.
- Keyboard: role rows focusable with a visible focus state.
- The fixed header must not cover A's title or C's scenes.

---

### Task 1: Content + variant A
**Files:** Create `components/careers/content.ts`, `components/careers/careers.css`; modify `app/careers/page.tsx`,
`components/ComingSoon.tsx` (manifesto only).
**Produces:** `PITCH: string[]` (the three paragraphs), `FIGURES: {value: string; label: string}[]`,
`ROLES: {n: string; title: string; href: string}[]`, `HIRING: string` (the hiring sentence).
- [ ] Build; screenshot desktop + phone; check Review Focus items 1, 4, 5.
- [ ] Commit.

### Task 2: Variant C
**Files:** Create `app/exp/careers-2/page.tsx`, `CareersStage.tsx` (client, scroll-scrubbed scenes), `careers2.css`;
modify `app/exp/page.tsx` (list it under Sections).
- [ ] Build; scroll captures at several points, desktop + phone, plus reduced motion; check Review Focus 1–3.
- [ ] Commit.
