---
trigger: model_decision
description: "Laws of the craft (typography, space, colour, imagery, components), special-case workflows (brands, redesigns, missing backends), and reference file index."
---

# Laws of the Craft, Special Cases & Reference Index

Precise design specifications derived from the study of 247 gallery sites, instructions for special operational cases, and directory index.

---

## Laws of the Craft

### 1. Typography
- **Contrast & Steps**: 2 to 3 distinct sizes do all visible work: one very large, one small, nothing in between. The median headline-to-body ratio on top-tier sites is **4.3:1** (largest type: median 8.4vw on top sites vs. 5.0vw on weak ones).
- **Metrics**:
  - *Display Type*: Tracking `-0.02` to `-0.05em`, leading `0.85`–`1.05`.
  - *Body Text*: `16`–`20px`, leading `1.45`–`1.6`, line length `45`–`75` characters per line.
- **Limits**: Maximum 5 font sizes on a page. 1 font family is normal (33% of top sites); 2 is the hard ceiling.
- **Alignment**: Left-aligned by default. Centre at most one intentional moment per page.

### 2. Space & Layout
- **Grid & Margins**: One grid and one pair of tight outer margins (16–32px) used consistently across the entire page. Large elements extend to the grid edge. Text blocks share 2 or 3 left edges across the entire page.
- **Asymmetry**: Asymmetry belongs inside the grid, never in the outer frame. Both outer margins remain equal; an off-centre heading must be balanced by an element on the opposite side.
- **Rhythm**: Section gaps must be noticeably larger than internal element gaps: **120–240px** on desktop (study median ~240px).
- **Variety**: Each section uses a different composition from its neighbours; never repeat card grids.

### 3. Colour
- **Proportions**: One ground, one ink, one accent. The accent color is reserved for the primary action and at most one other element.
- **Ink Legibility**: Set running body text in full ink. Soft grey running text reads as unfinished and harms accessibility.
- **Surface Elevation**: Separate surfaces with subtle tone steps, never with borders or drop shadows.
- **Field Shifts**: Sections may transition the whole page background tone. Avoid soft color fades or gradient transitions.

### 4. Imagery
- **Dominance**: One dominant visual beats 6 small ones. On top-tier sites, hero media occupies at least 50% of the first screen 68% of the time.
- **Crops & Geometry**: Consistent aspect ratios; square corners by default (73% of studied sites leave media corners square).
- **Authenticity**: Authentic images > code drawings > dealt generic photos > no image. Icons, placeholder boxes, and abstract shapes are banned.
- **Licensing & Credits**: Every open collection image must be downloaded locally to `assets/`, credited in the footer, and documented in the final report. Never misrepresent found imagery as the client's own facility or product.
- **Overlay Prohibition**: Nothing may overlap or sit on top of a headline or statement text.

### 5. Components
- **Buttons**: Flat with solid color fill; either crisp square corners or fully rounded pills (top sites: 52% square, 23% pill; soft 9–16px radii are typical of lower-scoring sites). Most strong heroes use at most one button.
- **Navigation**: Clean, unornamented bar: wordmark, 3 to 5 plain text links, 1 action. No heavy bar chrome or floating pills.
- **Footer**: A deliberate, designed close rather than a generic sitemap. On top sites, the brand name often returns at full container width.

---

## Special Cases

### 1. Existing Brand or Design System
- Run draw with `--keep palette,type` to lock brand colors and typography while dealing fresh compositions.
- If brand identity mandates a normally banned pattern (e.g., logo on a gradient, violet accent), preserve the brand asset, document it in the report, and pass `--allow <rule>` to `inspect.mjs` for that rule only.

### 2. Redesign, Restyle, or Review Workflows
1. **Record the Before**: Run the current project, inspect it (`inspect.mjs <url> --out .taste-skill/before`, with `--app` for app screens), and lint source code. Identify the tech stack, CSS method, and non-negotiable logic (routes, forms, state).
2. **Review Mode**: Critique the "before" screenshots with `references/critique.md`, list quantitative inspection findings, and name the top 3 high-impact changes.
3. **Preserve Foundation**: Do not perform framework migrations. Restyling preserves layouts while updating typography, palette, and components; redesigning deals a full direction and rebuilds section blueprints inside existing components.
4. **Order of Execution**:
   - Typography (fonts and scales).
   - Colour (ground, ink, accent).
   - Frame (margins, section rhythm, titles/headings).
   - Interactive states (hover, focus, empty, loading).
   - Component replacement (replace card grids and pills with dealt blueprints).
5. **Side-by-Side Proof**: Inspect into `.taste-skill/after`, verify functionality across all viewports, and present before/after metrics side-by-side.

### 3. Single Component or Section Builds
- Skip the full direction draw unless starting from scratch.
- Match surrounding page styles, adhere to all House Rules and Craft Laws, and run `inspect.mjs` on the isolated element.

### 4. Static or Missing Backends
- Primary actions should lead to genuine destinations when specified.
- If no backend exists, open a pre-filled `mailto:` link with choices in subject/body, or link to `#checkout` with a clear report note that checkout wiring is required. Never present a fake, un-wired payment form.

### 5. Environment & Tooling Fallbacks
- **No Chrome or Node 22**: Run `lint.mjs` (requires Node 18+), capture manual screenshots via whatever browser tools exist, and critique manually. Note in report that automated inspection was skipped.
- **No Network Access**: If `assets.mjs` cannot query archives, generate flat code-based graphic drawings from the subject inventory. Note in report that open collections were unreachable.

---

## Reference & Tooling Catalog

| Path / Tool | Purpose & Usage |
| :--- | :--- |
| `references/app-screens.md` | Dedicated workflow, tokens, house rules, and inspector guidelines for dashboards, admin panels, and apps. |
| `references/copy.md` | Guidelines for writing the argument and copy deck; 2-line headline arithmetic. |
| `references/type.md` | Typography scales, tracking, measure, font loading, and pairing strategies. |
| `references/colour.md` | Palette management, roles, tonal steps, dark themes, and WCAG contrast. |
| `references/layout.md` | Grid systems, margins, vertical rhythm, section composition, and mobile adaptation. |
| `references/imagery.md` | Sourcing, licensing, crediting, treatments, SVG drawing, and `data-ui` guidelines. |
| `references/motion.md` | Motion budgets, animation tokens, interaction recipes, and reduced-motion fallbacks. |
| `references/scenes.md` | Blueprint catalog and integration steps for scroll-pinned scenes. |
| `references/critique.md` | Visual critique rubric: 14 inspection passes and Awwwards-weighted scoring. |
| `references/tells.md` | Dated registry of algorithmic AI design tells and their required replacements. |
| `references/research.md` | Complete methodology and data from the study of 247 curated gallery sites. |
| `scripts/draw.mjs` | Direction dealer: deals directions, type systems, palettes, and section blueprints. |
| `scripts/assets.mjs` | Image search engine across open archives (Openverse, Commons, Met, Art Institute). |
| `scripts/lint.mjs` | Source code linter for banned utility classes and cliché phrasing. |
| `scripts/inspect.mjs` | Headless browser inspector measuring typography, contrast, layout, and visual compliance. |
| `scripts/scenes.mjs` | Visual verification tool for scroll scenes across scroll steps and devices. |
| `assets/base.css` | Neutral CSS foundation containing CSS variables, fluid type, and reset styles. |
| `assets/scenes/` | Shared scroll-scene stage files and library demonstrations. |
| `assets/app.css` / `charts.js` | UI components and SVG charts for app screen builds. |
| `library/` | Underlying database of directions, palettes, type pairings, and blueprints. |
