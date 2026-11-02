---
trigger: model_decision
description: "Core design philosophy, anti-slop frontend principles, substance-over-ornament guidelines, and page vs. app screen classification."
---

# Frontend Design Core & Philosophy

## Overview: tasteskill v2

A page built by a model usually looks like the average of every page the model has seen: a centred headline over three lines, a little label above it, a row of icon cards, a soft gradient, a few thin rules, and a monospace caption. Nothing in it is wrong and nothing in it was decided.

This rule system replaces those defaults with decisions in four ways:

1. **A script deals the directions, you choose among them.** Asked to invent a look, a model picks the category default every time. `scripts/draw.mjs` deals three of twenty researched directions; you choose the one that carries the subject's idea, and the script then deals its type system, palette, hero, and section compositions from a library distilled from 247 real sites.
2. **The idea comes from the subject.** In the study, what separated the best sites from the forgettable ones was a concept taken from the thing itself, not the styling.
3. **A house style with no ornaments,** measured in a real browser by `scripts/inspect.mjs`, so the rules are checked rather than hoped for.
4. **You look at what you made.** Screenshots at three widths, a juror's rubric, fix, look again.

## Substance Over Thinness

Taking the ornaments away is only half the job. A page that has lost its labels, rules, and cards and gained nothing in their place reads as thin; blind jurors rightly prefer a richer page with tells over an empty page without them. 

The other half is substance:
- Type set larger and with conviction.
- Whole fields of color rather than timid washes.
- Real pictures of this subject's world (found or drawn).
- Every section carrying its full, authentic content.
- Do not trade substance for empty restraint.

## Environment & Tooling Prerequisites

- Run commands from the project root so working files land in `.taste-skill/`.
- Scripts require **Node 22+** and an installed **Chrome, Edge, or Chromium** (no npm installs needed).
- `assets.mjs` requires network access to open archives; it uses no API keys.
- Where `<skill>` is referenced, point to the skill folder or local tooling scripts.

## Page vs. App Screen Classification

Decide first which of two kinds of work is being undertaken:

### 1. A Page (Read & Scrolled)
- **Examples**: Landing page, marketing or product site, portfolio, event, restaurant, one-pager.
- **Workflow**: Follows **The Run** (see `@.agents/rules/02-design-workflow-run.md` and `@.agents/rules/03-implementation-quality-gates.md`).

### 2. An App Screen (Worked In)
- **Examples**: Dashboard, admin or analytics view, settings, billing, inbox or queue, wallet, list with filters, editor, or builder.
- **Workflow**: Follows `references/app-screens.md`:
  - Its own run and dedicated draw:
    ```bash
    node <skill>/scripts/draw.mjs --app --kind <kind> --brief "<the product>" --keep palette,type --out .taste-skill/app
    ```
  - Its own house rules: quiet borders, small labels, and repeated panels are normal; gradients, glows, icons in tinted squares, rainbow charts, and invented vanity numbers are strictly banned.
  - Verified with `inspect.mjs --app`. Read `references/app-screens.md` in full before starting; the standard page run does not apply.

### 3. Interface Fragments on a Page
A product site that shows its app is classified as a page, but the interface fragments on it follow app-screen rules internally:
- Deal the product's app style once in its own folder, keeping the page's palette and type:
  ```bash
  node <skill>/scripts/draw.mjs --app --kind <kind> --brief "<the product>" --keep palette,type --out .taste-skill/app
  ```
- Build every fragment the page shows (hero live screen, feature crop, chart) as a real piece of that app:
  - `assets/app.css` for panels, tables, and controls.
  - `assets/charts.js` for charts.
  - Real data that adds up, one finding stated, cropped, and scaled the way the page blueprint treats a picture.
  - Mark fragment root elements with `data-ui` so the inspector respects interface borders and controls.
  - Grey bars and lorem numbers are banned; a fragment that looks like a working product is the strongest visual asset software can show.
- When a brief mixes both (a landing page and the dashboard behind it), build each with its own run sharing one palette and typeface.
