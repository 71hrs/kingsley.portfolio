# Project Portfolio Redesign Standard

This document records the reusable case-study system established while redesigning the Dollar Flip portfolio project. Use it as the default reference for future portfolio redesigns unless a project requires a deliberate exception.

## 1. Purpose

The portfolio should communicate product-design leadership at Staff level while preserving evidence of hands-on execution. Each case study must show:

- How the designer framed the problem.
- Which evidence changed the direction.
- How product, user, business, and technical constraints were balanced.
- What was explored, tested, rejected, and iterated.
- How the final system scales beyond one screen or feature.
- What changed for users, the product, and the team.
- What the designer learned and would carry forward.

The page should read as a cumulative decision narrative, not a process inventory.

## 2. Preservation and File Strategy

Never overwrite or delete an existing case study during a redesign.

For every redesigned project:

1. Preserve the original HTML unchanged.
2. Create a separate redesign HTML file during exploration.
3. Create a project-specific stylesheet and JavaScript file.
4. Create a project-specific asset directory under `static/picture/`.
5. Copy required assets into the new directory; never move or rename source assets used by older pages.
6. Rename copied assets consistently: `<project>-<section-or-purpose>.<ext>`.
7. Reference only the project-specific asset directory from the redesigned page.
8. Promote the redesign to the canonical URL only after approval; keep the old version as a backup.

Recommended working structure:

```text
project-redesign.html
static/css/project-redesign.css
static/js/project-redesign.js
static/picture/project-redesign/
  project-hero.png
  project-overview.png
  project-research-01.png
  project-decision-01.gif
  project-final-experience.gif
```

## 3. Default Narrative Architecture

Use this structure as a starting point, then adapt section names to the project:

```text
01 Overview
   Product summary
   Role / Scope / Team

02 Opportunity
   Context or market landscape
   Product gap

03 Research
   Research approach
   Key insights

04 Strategy
   Product vision
   Decision framework
   Product or AI principles

05 Design Opportunities
   Evidence-derived opportunity 1
   Evidence-derived opportunity 2

06 Exploration & Validation
   Exploration
   Testing
   Findings
   Iteration

07 Final Design
   Primary experience
   Secondary experience
   Design system

08 Impact
   User impact
   Product impact
   Organizational or platform impact

09 Reflection
   Key learnings
   Evidence or outcome summary when appropriate
```

Do not force every project into identical wording. Preserve the narrative jobs: context, evidence, strategy, decisions, validation, execution, impact, reflection.

## 4. Staff-Level Storytelling Rules

### 4.1 Lead with decisions, not deliverables

Avoid listing artifacts without explaining why they mattered. A research method, wireframe, or prototype belongs in the story only when it changed a decision.

### 4.2 Separate insight, direction, and solution

- **Insight:** what the evidence revealed.
- **Direction:** how the team decided to respond.
- **Exploration:** the alternatives or hypotheses tested.
- **Iteration:** how evidence changed the design.
- **Final design:** the resolved product behavior and system.

Do not describe an early direction as a final key decision before testing has occurred.

### 4.3 Make progression explicit

Use a text → visual → text → visual rhythm. Explain the question before showing the artifact, then explain what the artifact changed.

### 4.4 Show leadership and execution together

Role copy should communicate strategy, alignment, and ownership while retaining hands-on work such as interaction design, prototyping, testing, visual design, and implementation collaboration.

### 4.5 Do not invent evidence

Only present metrics, quotes, claims, or outcomes supported by project sources. Early-beta projects may use validated behavioral signals and qualitative evidence instead of fabricated production metrics.

## 5. Content Hierarchy

### Hero

- Left: favicon or portfolio mark.
- Center: project name.
- Right: back-to-gallery link with a left-facing arrow.
- All three align to one header baseline and match the rest of the portfolio navigation.
- Project title, one-sentence description, location/market, and year align to the central content grid.
- Hero image is full viewport width with a fixed editorial aspect ratio close to `1960 / 700`.
- On mobile and tablet, preserve the full image composition; do not crop essential content.

### Chapter labels

- Use a consistent two-digit sequence: `/ 01` through the final chapter.
- All chapter labels use the same style.
- Dark-background chapters may use a lighter color while preserving typography and spacing.
- Chapter titles align to the same central grid as hero copy and body text.

### Subsection titles

- Editorial rather than oversized.
- Slightly heavier than body copy.
- Smaller than the main project/chapter title.
- Reuse one subsection type style across the page.

### Body copy

- Optimize for sustained reading rather than visual drama.
- Use a restrained line length, approximately 560–600px on desktop.
- Use consistent paragraph spacing throughout the page.
- Highlight only decision-critical phrases; avoid excessive bolding.
- For compact process beats, use `<strong>Label:</strong> explanation` in the same paragraph instead of adding unnecessary headings.

## 6. Grid and Alignment

The case study uses one centered editorial container.

- Recommended maximum content width: approximately 1024px.
- Desktop grid: roughly 44% chapter-label column and 56% content column.
- Header, hero metadata, chapters, images, impact, next case, and footer share the same left and right boundaries.
- Full-width visuals may extend across the complete centered container, but must remain centered.
- Never place visuals only inside the right text column unless the composition intentionally calls for it.
- Role / Scope / Team may use three columns on desktop and one column on mobile.

## 7. Spacing Rhythm

Use spacing tokens instead of isolated one-off values.

- Chapter-to-chapter spacing must remain consistent.
- Subsection-to-subsection spacing must remain consistent.
- Body paragraph spacing must remain consistent.
- Text-to-visual spacing should be generous but repeatable.
- Visual-to-following-text spacing should match the same rhythm.
- Horizontal rules must align with the centered content container, never the viewport edges unless intentionally full bleed.
- When a visual bridges two background colors, transition at an intentional point within the image rather than leaving a visible gap.

Recommended CSS variables:

```css
--case-center: 1024px;
--case-gutter: clamp(22px, 5vw, 72px);
--chapter-space: clamp(108px, 12vw, 168px);
--subsection-space: clamp(82px, 9vw, 124px);
--media-space: clamp(62px, 7vw, 105px);
```

## 8. Typography

- Use web-hosted fonts rather than local machine fonts.
- Current editorial pairing: EB Garamond for expressive display text and Heebo for UI/body text.
- Maintain readable body sizes around 16px with approximately 29–32px line height.
- Small visual labels use approximately 9–10px, medium weight, and restrained letter spacing.
- Avoid forced uppercase for normal captions or prose.
- Avoid italic figure captions.
- Control wrapping: shorten copy or adjust composition before shrinking text.

## 9. Color System

Use a limited, project-informed palette.

- One deep background color.
- One warm or cool paper background selected to harmonize with project visuals.
- One primary ink color.
- One restrained accent color.
- One dark visual-panel color.

Dollar Flip established a warm paper background with a deep blue-purple night color. Future projects should preserve the tonal hierarchy while adapting hues to their own brand assets.

Do not introduce unrelated green, yellow, purple, and blue accents across separate sections. Images may contain broader color, but page chrome must stay coherent.

## 10. Visual and Image Rules

- Explain before showing an image whenever possible.
- Use one large centered visual rather than several cramped side-by-side visuals unless comparison is the content.
- Do not add decorative images after every paragraph; each image must have a narrative job.
- Remove external `Figure 01` labels and captions when the visual already explains itself.
- If a visual needs context, put a concise label inside the visual panel.
- Comparison panels may use explicit A/B, original/iteration, or criteria/result labels.
- GIF phone mockups should use per-asset corner radii and clipping that remove white edges without cutting the device frame.
- Do not reuse a final experience GIF repeatedly unless the narrative requires it.
- Scenario imagery should support a real use moment, not look like generic decoration.

## 11. Visual Panel Patterns

### Insight-to-direction panel

- Left: research insight.
- Middle: directional arrow.
- Right: design direction.
- Keep paired text blocks visually balanced.
- On mobile, stack vertically and rotate or replace the arrow appropriately.

### Comparison/testing panel

- A small internal label such as `A/B testing`, `First assumption`, or `Comparative pricing test results`.
- Show alternatives with enough context to understand the strategic variable.
- Follow with a text paragraph explaining what testing revealed.

### Workflow panel

- Product experience on one side and the end-to-end workflow on the other.
- Workflow steps align left and remain legible.
- Number circles and connecting lines must not overlap.
- On mobile, stack experience and workflow vertically.

### Impact panel

- Use three evidence-based outcomes: user, product, and system/organization when appropriate.
- A structured horizontal panel works well on desktop; stack on mobile.
- Do not force equal card titles by adding empty language.

### Reflection

- Keep reflection in the right editorial text column.
- Use concise learning titles followed by a line break and explanation.
- Lightweight 01–03 numbering may be used at body-text size.
- Avoid decorative vertical bars when separators and spacing already provide hierarchy.

## 12. Metrics and Evidence

- Metrics belong where they close the project narrative most clearly.
- A full-width or image-overlay evidence summary may follow Impact or precede Reflection.
- Preserve strict grid alignment.
- On desktop, metrics may sit in a three-column row or a vertical image-side rail.
- On mobile, move dense image overlays below the image and use a readable stacked layout.
- Use arrows only when direction is meaningful (`↓35%`, `↑17%`).
- Keep metric title and explanation left-aligned even if the metric group is centered within its column.

## 13. Background Transitions

- The hero and introductory region may use the deep background.
- Continue the background through the opening narrative where it improves cohesion.
- Transition using a visual that overlaps both color regions rather than inserting an empty gap.
- Final Impact/Reflection regions may return to the deep background.
- Test back-to-top color changes at every background transition.

## 14. Navigation and Interaction

### Back to gallery

- Align with the portfolio’s existing header positions.
- Use a left-facing arrow before the label.
- Use a restrained underline or arrow motion hover.

### Back to top

- Hidden while the hero header remains visible.
- Appears after the header leaves the viewport.
- Uses a simple text treatment rather than a large floating control.
- Adapts color automatically: accent on dark backgrounds, project background color on light backgrounds.
- Use native smooth scrolling only; do not introduce scroll-jacking.

### Next case study

- Align with the main content container.
- Avoid excessive empty space.
- Keep project title prominent but controlled.
- Add one concise project belief or insight on the lower right when it creates balance.
- Hover may use underline reveal and subtle arrow movement; avoid distracting scale effects.

## 15. Scrolling

- Do not use page snapping.
- Do not intercept wheel events.
- Do not simulate presentation slides.
- Preserve native trackpad behavior.
- If mouse-wheel inertia cannot be implemented without resistance or input lag, use native browser scrolling.
- Respect `prefers-reduced-motion`.

## 16. Responsive Requirements

Test at minimum:

- 1280 × 720 desktop.
- Tablet breakpoint around 768–980px.
- 390 × 844 mobile.

For every test:

- No horizontal overflow.
- All major visuals have equal left and right margins.
- Hero media preserves essential content.
- Comparison panels stack logically.
- Desktop borders do not remain as stray vertical lines on mobile.
- Titles do not create isolated one-word lines.
- Metrics remain readable and do not cover important image content.
- GIF clipping remains accurate at each breakpoint.
- Footer and Next Case Study align to the same container.

## 17. Accessibility and Semantics

- Use semantic `header`, `main`, `section`, `article`, `figure`, and `footer` elements.
- Every informative image needs meaningful alt text.
- Decorative arrows use empty alt text and `aria-hidden="true"`.
- Keep visible focus states for links and buttons.
- Maintain sufficient contrast on paper and dark backgrounds.
- Use `aria-label` for metric groups and icon-only controls.

## 18. Content Source Priority

When writing a redesigned case study, use sources in this order:

1. Latest presentation deck and speaker notes.
2. Latest résumé statements and verified metrics.
3. Existing case-study page.
4. Research files, testing artifacts, and design assets.
5. Designer clarification.

The presentation script is the preferred source for narrative logic because it records how the project is explained in interviews. The old site is supplementary and may contain artifacts or details omitted from the presentation.

## 19. QA Checklist

Before handing off a redesign:

- [ ] Original page still exists and works.
- [ ] Redesign uses its own HTML, CSS, JS, and asset directory.
- [ ] No redesign asset references an unrelated source directory.
- [ ] All chapter numbers and titles are consistent.
- [ ] Seller/buyer or primary/secondary journeys follow the intended order.
- [ ] No external figure captions remain unless explicitly required.
- [ ] All images are centered and aligned.
- [ ] Background transitions occur at intentional image positions.
- [ ] Body type and paragraph spacing are consistent.
- [ ] Impact claims are supported.
- [ ] Reflection is distinct from Impact.
- [ ] Back-to-top changes color correctly.
- [ ] Desktop, tablet, and mobile layouts have been visually tested.
- [ ] No horizontal overflow.
- [ ] `git diff --check` passes.

## 20. Reference Implementation

The current reference implementation is:

- `dollar-flip.html`
- `static/css/dollar-flip.css`
- `static/js/dollar-flip.js`
- `static/picture/dollar-flip/`

Future redesigns should inherit the system and interaction principles, not Dollar Flip’s project-specific content or exact color values.
