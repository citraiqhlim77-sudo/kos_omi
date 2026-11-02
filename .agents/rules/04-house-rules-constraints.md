---
trigger: always_on
description: "Mandatory frontend house rules and anti-slop constraints: table of 17 invariant rules and alternatives, banned design tells, and allowed exceptions."
---

# Frontend House Rules & Visual Constraints

These rules are strictly enforced across all frontend builds, regardless of chosen direction or sector. Automated inspection via `inspect.mjs` measures every rule in this table.

---

## The House Rules Table

| Banned Pattern | Required Alternative | Rationale & Measurement |
| :--- | :--- | :--- |
| **Headlines over 2 lines** | Cut words first; widen the measure second; resize text last. | Applies to every `h1`–`h6` and first-screen main text at every viewport width. |
| **Missing title / untitled sections** | Use a clear `h1` on the first screen and a distinct heading on every section. | Clearly state what this is: product with purpose, event with date and venue. |
| **Unequal margins / huddled sections** | Balance every off-centre void with content on the opposite side. | The opposite half must hold a picture, column, list, or figure—never empty void. |
| **Blank stretches** | Maintain consistent 120–240px section rhythm. | No vertical stretch taller than half a screen may be left empty. One deliberate rest permitted per page. |
| **Statements styled as giant headings** | Use `<p>` or `<blockquote>` at statement size (≤36px desktop, ≤24px mobile, ~25 words). | Jurors read a 42px sentence over 4 lines as an oversized headline that fails the 2-line rule. |
| **Eyebrows & pill badges** | Integrate details into the headline or introductory sentence, or delete them. | No small labels, pill chips, or "New ·" badges above headings. |
| **Monospace for body/captions** | Use the primary text typeface; use tabular figures (`font-variant-numeric: tabular-nums`) for numbers. | Monospace is banned outside real code blocks. |
| **Index numbering** | Indicate sequence by layout order, scale, or plain text words. | No `01` / `02` / `03`, `(001)`, or `"Step 2"`. Use semantic `<ol>` if order is essential. |
| **Thin rules & hairlines** | Use whitespace, tonal steps between backgrounds, or scale changes. | No hairline dividers, no 1px outline boxes, no crosshairs or crop marks. |
| **Gradients** | Use flat color or authentic photography. | Banned on backgrounds, text, and buttons. Neutral scrims over photos are the only exception. |
| **Shadows on static elements** | Use distinct background tone steps between surfaces. | No drop shadows on resting cards or panels; no glows. Shadows only on truly floating dialogs/menus. |
| **The "Assistant" palette** | Use the dealt palette from the direction library. | Strictly avoid yellow-cream backgrounds paired with terracotta/rust, and avoid generic violet/indigo. |
| **Tiny uppercase tracked labels** | Use sentence case at a legible font size (≥14px). | Avoid all-caps with wide tracking used as artificial ornament. |
| **Icon-topped feature cards** | Use the specific blueprint layout dealt for that section. | No rows of 3 identical boxed cards with icons in tinted squares. |
| **Glassmorphism** | Use solid, clean bars: wordmark, 3–5 plain links, 1 clear action. | No `backdrop-filter: blur()`, frosted glass containers, or floating pill navigation bars. |
| **Decorative fillers** | Use real photography, authentic interface fragments, or nothing. | No emoji, no blurred gradient blobs, no floating geometric shapes, no grey-bar mockups. |
| **Styled accent words** | Use a single typeface and color for the entire headline. | No italicized, serifed, underlined, or color-swapped single words in headlines. Words carry the weight. |
| **Font overload** | Use 1 font family (preferred) or 2 at most. | Dealt type system governs all hierarchy. |

---

## Allowed Exceptions

The inspector leaves three specific contexts untouched:
1. **Real Code Blocks**: Inside `<pre>` and `<code>`, monospace type is correct and expected.
2. **Form Controls & Tables**: Real data tables and form input elements may have standard borders and dividers.
3. **App Interface Fragments (`data-ui`)**: Real product screens, charts, or widget fragments whose container carries `data-ui="true"` may use internal application borders, tabs, and panel styling (`references/imagery.md` §7).

---

## Study Evidence: Why These Rules Exist

Data from the study of 247 curated gallery sites (One Page Love, Awwwards Site of the Day) proves that generic AI defaults mirror low-scoring websites:

- **Icon feature cards**: Used by only **1%** of top-tier sites (score ≥ 7.5), versus **28%** of lower-tier sites (< 6.5).
- **Pill badges / chips**: Present on **14%** of top sites vs. **34%** of lower-tier sites.
- **Gradients**: Present on **22%** of top sites vs. **52%** of lower-tier sites.
- **Resting drop shadows**: Present on **24%** of top sites vs. **48%** of lower-tier sites.
- **Tiny tracked uppercase labels**: Used on **16%** of top sites vs. **57%** of lower-tier sites.

Certain elements (monospace labels, index numbers, hairline borders) became popular fashion items, which is why AI models over-generate them. They now read as algorithmic costume and are banned here without exception.

---

## Filling the Void: Substance, Not Ornament

Removing ornaments creates open layout space. **Never fill that space with another ornament.**
Fill it with:
1. **Scale**: Make the primary message or media larger and more commanding.
2. **Substance**: Present the complete content (full pricing details, complete menus, real bios).
3. **Imagery**: Include authentic photographs or code-drawn graphics specific to this subject.
4. **Color**: Use confident, solid color fields.
