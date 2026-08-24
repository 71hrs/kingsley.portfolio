# Project Page Color System

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
