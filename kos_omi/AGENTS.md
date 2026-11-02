# Frontend Design & Art Direction Standards (tasteskill v2)

This workspace enforces strict art direction and anti-slop frontend standards distilled from a study of 247 curated gallery sites (One Page Love, Awwwards Sites of the Day).

The complete guidelines are organized into 5 modular rules under `.agents/rules/`:

- @.agents/rules/01-frontend-design-core.md: Core philosophy, anti-slop principles, substance over thinness, and page vs. app screen classification.
- @.agents/rules/02-design-workflow-run.md: Creative workflow (The Run steps 1–5): subject inventory, writing the argument, drawing directions (`scripts/draw.mjs`), finding the unique idea sentence, and the copy deck.
- @.agents/rules/03-implementation-quality-gates.md: Implementation, automated inspection gates (`scripts/lint.mjs`, `scripts/inspect.mjs`, `scripts/scenes.mjs`), visual screenshot critique rubric, motion layer, and completion reporting (The Run steps 6–10).
- @.agents/rules/04-house-rules-constraints.md: Mandatory house rules and visual invariants (headlines ≤ 2 lines, no pill badges, no gradients, no resting shadows, no thin rules, no icon cards, no assistant palette).
- @.agents/rules/05-craft-laws-special-cases.md: Empirical craft laws (type scales, space, colour, imagery, components), special case workflows (existing brands, redesigns, single components, offline fallbacks), and reference file index.

---

## Quick Invariant Summary

1. **Decisions Over Defaults**: Never generate generic layouts with centered 3-line headlines, pill badges, and 3 icon feature cards.
2. **Headlines**: Maximum two lines at every viewport width (`h1`–`h6`).
3. **No Ornaments**: Banned: pill badges/chips, gradients, drop shadows at rest, thin hairlines/borders, monospace outside code, glassmorphism, floating pill navs, and styled single accent words in headings.
4. **Substance**: Fill space with scale, full authentic content, and real pictures of the subject's world (floor of 4–12 real pictures).
5. **Quality Gate**: Zero `FAIL` tolerance on `inspect.mjs` at 1440px, 768px, and 390px viewports before reporting completion.
