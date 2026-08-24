# Project Page Color System

## CSS architecture and layout standard

Every active Case Study loads exactly two local stylesheets, in this order:

1. `case-study-shared.css` — the single shared structural system.
2. One project stylesheet — project colors and genuinely unique visual components only.

Do not add separate page-level links for the logo, mobile navigation, header emphasis, dividers, chapter spacing, Reflection, or Impact transitions. Those rules belong to the shared stylesheet. Dollar Flip and Polyverse are the visual references, but their repeated structural rules should be moved into the shared system whenever a page is rebuilt.

Shared desktop measurements:

- Brand logo: `104.4 × 33.6px` on desktop and `90 × 28.8px` on mobile.
- Content width: `1024px` maximum.
- Content gutter: no internal desktop gutter above `1029px`; `45px` from `815–1029px`; `35px` at `814px` and below. These are the original Tomorrowland breakpoints.
- Case-study grid: a flexible `444px` label column plus a fixed `580px` copy column at the maximum reading width.
- Header position: `3vh` from the top with `4%` horizontal page padding.
- Project name: EB Garamond, `15px`, weight `400`.
- Hero statement: Heebo, `35px`, weight `200`, line-height `40px`.
- Hero statement top spacing: `72px`.
- Hero metadata top spacing: `96px`.
- Hero image top spacing: `62px`; standard crop is the established wide hero ratio.
- Chapter vertical padding: `105px`.
- Space between subsections: `84px`.
- Body copy: the local Tomorrowland Heebo font, `16px`, weight `300`, line-height `32px`.
- Chapter label: the local Tomorrowland Gilroy Bold font, `9px`, line-height `9px`, letter-spacing `.37em`, uppercase.
- Editorial subheading: the local Tomorrowland GT Sectra Display font, `30px`, line-height `35px`, weight `500`.
- Chapter numbers and titles remain together on one line.
- First Overview media: `16:9`, centered crop, with Background 1 behind its upper 50% and Page Background behind its lower 50%.
- When the Overview transition media is present, the Overview chapter has no bottom padding after the media. No extra Background 1 strip may appear between the image and the following details section.
- When an Outcome, Impact, or Effect chapter exists, its final complete media block bridges Page Background and Background 1 at its vertical midpoint. A single image or video uses `16:9`; a multi-image gallery keeps its intentional grid and image ratios.
- Projects without an Outcome, Impact, or Effect chapter do not receive a forced closing-media transition.

### Shared Project Hero typography

The complete Hero block—including the project name inside the fixed header, main project statement, region, and year—is a shared component. Project-specific CSS must not redefine its font family, size, weight, line-height, letter-spacing, or column alignment.

- Project name: EB Garamond, `15px`, weight `400`, line-height `15px`, letter-spacing `.02em`, uppercase.
- Main project statement: Heebo, `35px`, weight `200`, line-height `40px`, letter-spacing `-.02em`, maximum width `580px`.
- Region and year: Heebo, `13px`, weight `600`, line-height `13px`, no additional letter-spacing.
- Mobile main statement: Heebo, `32px`, line-height `38px`, maximum width `11em`.
- Colors continue to come from each project’s semantic color variables; typography does not.

These measurements are shared rules. Do not redefine them in a project stylesheet unless the project has a documented, intentional exception.

This document defines the required color system for every portfolio project page. New project pages must use these semantic roles instead of adding colors for individual components.

## Core palette

Every project has exactly seven color roles.

### Background colors

1. **Background 1** (`--project-bg-1`)
   - The primary project background.
   - Used for the hero, image transition bands, Reflection, and the contact/copyright footer.

2. **Background 2** (`--project-bg-2`)
   - The secondary project background.
   - Used for Next Case Study and secondary presentation areas.
   - Also used for structural divider lines so every chapter and Reflection divider shares one exact solid color.

3. **Page Background** (`--project-page-bg`)
   - Used for the main case-study reading area.
   - May be a warm white or cool white selected to match the project palette.

### Text colors

4. **Highlight** (`--project-highlight`)
   - Used for the logo, Back to Gallery, Home button, location, year, and every chapter number from `/ 01` through the final chapter number.
   - Chapter titles remain Dark Text.
   - Reflection list numbers, Reflection body copy, Reflection point headings, and Reflection divider lines do not use Highlight.

5. **Text 1** (`--project-text-1`)
   - The main text role for chapter titles, body copy, captions, Reflection content, and Reflection list numbers.

6. **Text 2** (`--project-text-2`)
   - The alternate text role used wherever Text 1 does not provide the intended contrast for that project.

### Structural color

7. **Divider** (`--project-divider`)
   - Used for every structural horizontal line on the project page.
   - This includes the line above Problem and Solution, all later chapter separators, the line above Reflection content, and all Reflection point lines.
   - Divider is an independent solid color. It does not use Highlight, Background 1, Background 2, Text 1, Text 2, or opacity.
   - Divider uses the fixed portfolio-wide value `#e3e2e8` on every project page.
   - Because the same solid color may appear lighter or darker against different backgrounds, consistency is defined by the exact color value rather than perceived contrast.

## Rules

- Do not use opacity or semi-transparent colors to create text hierarchy.
- Do not introduce additional gray, border, label, or hover colors.
- Secondary text uses the same Text 1 or Text 2 color. Hierarchy is created with font size, font weight, spacing, and layout.
- The line above Problem and Solution, all chapter divider lines, the Reflection top line, and every Reflection point line use Divider. They do not use Highlight or a background color.
- Hover and active states keep the same color and use motion, underlines, or typography for feedback.
- Each project decides whether Text 1 or Text 2 is appropriate for a particular background. The standard does not classify either role as inherently dark or light.
- The Highlight color must remain readable on Background 1, Background 2, and Page Background wherever it is used.
- Back to Top is outside the scope of this standard because the feature is planned for removal.

## Required project setup

Each project page defines only these variables:

```css
.project-page {
  --project-bg-1: #000000;
  --project-bg-2: #000000;
  --project-page-bg: #ffffff;
  --project-highlight: #000000;
  --project-text-1: #000000;
  --project-text-2: #ffffff;
  --project-divider: #e3e2e8;
}
```

Components must reference these variables. Project-specific components must not contain separate hard-coded presentation colors.

## Shared project body layout — exact Tomorrowland mapping

The body architecture is based on the content rhythm of the archived Tomorrowland reference in `Docs/tomorrowland`. Its header, footer, navigation, credits, and unused case-study modules are not copied.

The portfolio Header remains Yuhui Qi's custom component. Everything after the Header uses the Tomorrowland body geometry and typography as a direct implementation standard, not as loose visual inspiration.

- Reading frame: `1024px` maximum width. On desktop the full `1024px` is usable; there is no extra internal gutter.
- Main copy column: `580px` maximum width.
- Label column: `444px` at the maximum reading width.
- Media frame: the full `1200px` maximum width, centered independently from the reading frame.
- Desktop chapter spacing: `105px` above and below each chapter.
- Tablet chapter spacing: `80px` above and below at `814px` and below.
- Mobile chapter spacing: `65px` above and below at `767px` and below.
- Text sections use two columns inside the full `1024px` desktop frame: `444px` for the chapter-label column and `580px` for the copy column.
- The Hero content uses the same column anchors: project name and introduction align with the `580px` right column; region aligns to the left column and year aligns to the right column.
- The navigation/header height remains fixed; the project name stays inside that header rather than becoming a separate body section.
- Body copy uses the reference Heebo at `16px / 32px`; section labels use Gilroy Bold at `9px / 9px` with `.37em` tracking; editorial subheadings use GT Sectra Display at `30px / 35px`.
- Consecutive paragraphs use a consistent `24px` gap. Media follows the same shared section rhythm unless a documented project-specific gallery needs a smaller internal gap.
- The first Overview media may bridge Background 1 and the Page Background at its vertical midpoint.
- A closing Outcome, Impact, or Effect transition is attached only to the final complete media block in that chapter. Images, GIFs, video, and iframe embeds all count as media.
- A transition must never be inferred from an image that is followed by more copy or another media block. This prevents an accidental color band in the middle of a chapter.
- Multi-image galleries keep their intended grid and aspect ratios; a single closing image or video uses the shared `16:9` frame.

All reusable measurements belong in `Assets/css/works/case-study-shared.css`. Every active project maps its HTML to the shared semantic classes `case-section`, `case-grid`, `case-label`, `case-body`, `case-copy`, `case-subheading`, and `case-media`. A project stylesheet may define only its palette and genuinely exceptional media composition; it must not redefine the shared reading width, columns, media width, section spacing, dividers, or standard typography.

## Close To Me palette

```css
--project-bg-1: #a9b5e9;
--project-bg-2: #c5ccef;
--project-page-bg: #faf9ff;
--project-highlight: #5b2f94;
--project-text-1: #25213a;
--project-text-2: #ffffff;
--project-divider: #e3e2e8;
```
