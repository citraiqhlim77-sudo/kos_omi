---
trigger: model_decision
description: "Step-by-step creative workflow (The Run steps 1 to 5): subject inventory, writing the argument, drawing directions, finding the unique concept/idea, and writing the copy deck."
---

# Design Workflow: The Run (Steps 1–5)

Do these steps in strict sequence. Steps 1–5 take only a few minutes and decide whether the final page has character or defaults to generic slop.

---

## 1. Read the Brief and the Project

Find out what is real:
- The subject, the audience, and the one thing the page must get someone to do.
- The stack, and any existing brand constraints (colours, fonts, logo).
- **What imagery truly exists**: the project's own photographs, product shots, real interfaces that can be shown, an image generation tool you can call, or nothing. 
- *Rule*: Never plan around pictures you do not have. "Nothing of its own" is rarely nothing at all: the subject's city, street, materials, and history exist in open archives and museums, free to use with a credit (via `scripts/assets.mjs`).
- If the brief is vague, state your reading in one crisp line rather than asking. Ask only when a missing fact completely blocks the work (e.g., no product name).

### The Subject Inventory
Record 8 to 12 items in your notes that belong strictly to this client and to no competitor:
1. **Name and meaning**: What the name means or references.
2. **Physical place**: Address, door number, street, neighbourhood, tiles, signs, paint colours, shopfront typefaces, local light, weather.
3. **Hard numbers**: Seats, rooms, minutes to the sea, price, founding year.
4. **Living constraints**: One batch a month, closed in winter, by appointment only.
5. **Materials and colours**: Wood grain, stone, raw brass, ink tone.
6. **Rituals and hours**: The oven lit at 5 AM, the ferry at 7 PM.
7. **Printed artefacts**: Timetable, ticket, menu, label, receipt, invitation, manual.

*Insight*: In blind juror tests, every winning page was built from an item on this inventory. The list also doubles as your search queries for imagery in Step 6.

---

## 2. Write the Argument

Before any design or markup, list the page as claims with their proof, one line per section (`references/copy.md` §1):
- The claims dictate which sections exist and in what sequence.
- **Delete any section that has no claim.**
- This prevents falling back into the stock sequence: hero → logos → three feature cards → testimonial → pricing → CTA.

---

## 3. Draw the Direction

Run the direction dealer to generate 3 options:

```bash
node <skill>/scripts/draw.mjs --sector <sector> --brief "<one line about the subject>" \
  --sections <roles in the order of your argument> [--tone <tone>] [--have <assets>] [--keep palette,type] \
  --options 3
```

- Compare the three directions against your Subject Inventory: choose the composition that carries something unique to this client, not the most comfortable one. Note why in one sentence.
- Deal the full direction sheet:
  ```bash
  node <skill>/scripts/draw.mjs <the same arguments, without --options> --direction <chosen id>
  ```

### CLI Parameters
- `--sector`: View options via `node <skill>/scripts/draw.mjs --list sectors`.
- `--sections`: Roles from `--list roles` (features, showcase, how-it-works, testimonial, proof, stats, pricing, faq, cta, footer, intro, about, work, gallery, list, contact).
- `--tone` (optional): quiet, bold, warm, technical, playful, luxury, editorial. Pass only if explicitly requested.
- `--have`: Assets that genuinely exist (`photography`, `product-photo`, `product-ui`, `illustration`, `video`). Omit if none exist so the draw avoids layouts requiring them.
- `--keep palette,type`: Use when brand colours or typefaces are fixed.

### Rules of the Direction Sheet
1. **Adopt it completely.** Do not blend it with the comfortable layout you would have made anyway.
2. **Redraw only with stated cause** (`--redraw hero | type | palette | photos | scenes | section:<role> | direction`): only if it contradicts a brand rule or requires unavailable assets.
3. **Check palette against subject**: A dealt palette is a set of proportions (one ground, one ink, one accent, fields). If colors clash with the subject's material, redraw palette once or keep proportions and sample colors from the subject's world.
4. **Content-mismatch fallback**: If a dealt section cannot hold the real content (e.g., compares 3 plans but there is only 1 price), use `--alternatives <role>` and redraw with `--redraw section:<role>=<id>`.

---

## 4. Find the Idea

The direction is a way of composing; the idea is what makes the page belong exclusively to this subject. Fill in both blanks from the subject itself before writing code:

> On this page, **[something that belongs to the subject]** becomes **[the device the direction calls for]**.

### Where to Look for the First Blank
- **Its output**: What does it produce? Put the real output on the page as tangible material.
- **Its object or shape**: What does it physically look like in silhouette or cross-section? Enlarge it, crop it, make it the frame or motif.
- **Its name**: Can the letters hold a photograph, stack into a wall, or split to two corners?
- **Its place**: What single view makes someone want to be there?
- **Its ritual**: A sequence the page can perform as the user scrolls.
- **Its artefact**: A printed item (ticket, menu, receipt, shipping tag, folder).
- **Its opposite**: Which other category owns the feeling this one lacks?

### The Competitor Test
Substitute the nearest real competitor into your idea sentence. If the sentence still makes sense, the idea belongs to the category, not the client. (E.g., "a loaf of bread" belongs to every bakery; "the seven doors of the street it is named after" belongs only to this one.) "Clean and modern" is not an idea.

### One Live Thing
Give the page one interactive feature derived directly from the idea:
- *Examples*: Pick a wood and see the chair in it; type a name and see it cut in the foundry's letters; adjust a loan slider to see real monthly repayments; check live if the hut's stove is lit.
- *Rules*:
  1. Uses the subject's real content.
  2. Works effortlessly on a phone with a thumb.
  3. Has a plain, functional fallback without JavaScript.
  4. Never blocks reading or navigation.
  5. It is one focused thing, not an over-engineered playground.

---

## 5. Write the Words

Write the entire page as a plain-text copy deck before writing markup (`references/copy.md`):

1. **Two-Line Headline Arithmetic**:
   - Every headline (`h1`–`h6` and hero main text) must fit in **two lines or fewer at every viewport width**.
   - Aim for roughly **32 characters** (median across winning gallery heroes is 5 words / 32 characters).
2. **Immediate Supporting Sentence**:
   - Place one supporting sentence 32–48px directly below the headline.
   - Shown immediately with the headline, never docked at the bottom of the screen or delayed behind animations.
   - Clearly states what the thing is in plain language if the headline is poetic or a brand name.
3. **Hero Primary Action**:
   - One primary action named for what it does, styled as a real button on the first screen.
4. **Answer the First Question in Large Type**:
   - First screen must answer: What is it, when/where (for events), what does it cost or do (for products), who are they (for people).
5. **Full Content Delivery**:
   - Deliver information completely: full menus with prices, complete room specs, speaker lists with topics. Thin sections lose to busier ones.
   - Sample details are acceptable for gaps (dish names, room rates); **proof is never invented** (never fabricate fake customer quotes, logos, press, or business metrics).
