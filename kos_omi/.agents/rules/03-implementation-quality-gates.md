---
trigger: model_decision
description: "Frontend implementation guidelines, quality gates (lint.mjs, inspect.mjs, scenes.mjs), screenshot critique rubric, motion layer, and completion reporting (The Run steps 6 to 10)."
---

# Frontend Implementation, Quality Gates & Verification (Steps 6–10)

Follow steps 6 through 10 to turn the direction and copy deck into an award-grade, anti-slop webpage.

---

## 6. Build It, Still

Build the page with motion turned off initially; a page that needs animation to look finished is not finished.

### Order of Construction
1. **Tokens**:
   - Establish color and typography tokens as CSS custom properties from the direction sheet.
   - Everything downstream must reference tokens exclusively.
   - `<skill>/assets/base.css` provides a neutral foundation (reset, token names, fluid type steps, grid, focus/selection styles, reduced-motion helpers).
2. **Hero Blueprint**:
   - Build the hero exactly as specified in the blueprint at desktop (1440px) and phone (390px) widths.
   - Establish the primary visual hierarchy (big things bold, small things quiet) before any other section exists.
3. **Sections from Blueprints**:
   - Carry the core idea into every section, including pricing, FAQ, and footer.
   - Neighboring sections must never share identical layouts.
4. **Imagery Hierarchy (Order of Preference)**:
   1. *Project's own photography/assets*.
   2. *Generated images* (if an image tool is available).
   3. *Real pictures from open collections* (`scripts/assets.mjs "<query>"`: Openverse, Wikimedia Commons, Art Institute of Chicago, Met; commercial-friendly licenses). Search the inventory: street postcards, old maps, material close-ups, trade engravings, botanical plates.
   4. *Drawn in code from the subject itself* (flat graphic language in palette colors).
   5. *Dealt sheet photographs* (only where generic fits honestly).
   6. *Type and color alone*.
   - **The Picture Floor**: The inspector requires at least **4 real pictures** on the page (typically 6 to 12). Real software interface fragments count; pure SVG icons/drawings do not count toward this floor.
   - Include **one moving picture/loop** where an honest clip exists (`assets.mjs --video "<query>"`).
5. **The Live Thing**:
   - Build the interactive element from Step 4 into the section where it proves the claim.
6. **Scroll Scenes** (when dealt on the sheet):
   - Copy scene files from `<skill>/assets/scenes/` (`stage.js`, `stage.css`, `<id>.js`, `<id>.css`).
   - Populate with real words and pictures; connect page tokens.
7. **Fullness**:
   - Treat each desktop viewport as a poster: one dominant anchor and its content.
   - A screen mostly composed of empty ground is underbuilt, not a "rest". Only one deliberate rest per page is permitted.
   - Set running text in full ink at 16px or larger.
8. **The Frame**:
   - One pair of equal outer margins at every width.
   - Sections are spaced 120–240px apart on desktop.
   - Any off-centre element must be balanced by an opposing element across the grid.
9. **States and Semantics**:
   - Semantic HTML elements (`h1`, `p`, `button`, `a`).
   - Visible focus states, complete alt text, and dedicated phone layout.

---

## 7. Gate (Automated Inspection)

Run automated linters and headless browser inspectors:

```bash
node <skill>/scripts/lint.mjs <source files or folder>
node <skill>/scripts/inspect.mjs <url or path/to/index.html>
node <skill>/scripts/scenes.mjs <url or path/to/index.html>     # when page has scroll scenes
```

- `lint.mjs`: Scans source code for banned patterns, utility classes, and stock AI phrases.
- `inspect.mjs`: Opens the page in a real browser at **1440px**, **768px**, and **390px**.
  - Measures: headline line counts, type sizes, active fonts, color contrast, thin rules, gradients, rest shadows, frame margins, blank stretches, and title/heading structure.
  - Outputs screenshots to `.taste-skill/inspect/`.
- **Enforcement Policy**:
  - **Fix every `FAIL`**: A page with any `FAIL` cannot be shipped.
  - Treat every `WARN` as an error unless you can defend it to a senior designer in one concise sentence.
  - Re-run until the report shows **0 FAIL**. Never hide elements from or argue with the inspector.

---

## 8. Look (Visual Critique)

Passing automated inspection does not guarantee excellence. Open the generated screenshots at all viewports:

1. **Critique using `references/critique.md`**:
   - Evaluate against the 14 inspection passes and Awwwards-weighted scoring.
   - Write out the critique in the standard format.
2. **Iterative Polish**:
   - Identify and fix the top 3 visual flaws.
   - Re-run the inspector and re-evaluate screenshots.
   - Limit to a maximum of 3 refinement rounds.
3. **Core Rule**: Judge the screenshots, not your code. If a flaw is visible in the rendering, it is real.

---

## 9. Move (Motion Layer)

Construct the motion layer after static layouts and inspection pass:

1. **Inspector Requirement**:
   - The inspector counts elements with active scroll/load animations; it **fails under 8** moving elements and **warns under 16**.
2. **Four Components of Motion**:
   - **Signature move**: One prominent movement specified on the direction sheet.
   - **Staggered section entrances**: Heading → text → media, staggered by 60–90ms, rising 16–32px with opacity on viewport enter.
   - **Control feedback**: Interactive states (hover, active, focus) for buttons, cards, links, and the live thing.
   - **One moving picture**: Ambient video loop, slow scale/drift, or scroll-linked hero motion.
3. **Accessibility**:
   - Transform and opacity only.
   - Provide full `prefers-reduced-motion` fallbacks preserving content while disabling translation/travel.

---

## 10. Report (Completion Checklist)

Do not report task completion until every item below is verified:
- [ ] `inspect.mjs` reports **0 FAIL** at 1440px, 768px, and 390px viewports.
- [ ] All generated screenshots have been manually reviewed.
- [ ] With scroll scenes: `scenes.mjs` ran cleanly with all sheets verified.
- [ ] First screen passes the 5-second test (a stranger immediately understands what it is and what to do).
- [ ] Every section has a heading, outer margins match equally, and no blank stretches exist.
- [ ] Final visual critique is documented.

### Standard User Report Format
Provide a concise summary containing:
1. **Direction**: Name, seed, and any intentional redraws with stated reasons.
2. **Concept**: The idea sentence and the live thing implemented.
3. **Critique Scores**: Final rubric scores and areas for future iteration.
4. **Imagery & Credits**: List of all found pictures/clips with title, creator, license, source URL, and footer credit placement.
5. **Replacements**: Note any placeholder drawings or sample content the client must finalize.
