# Portfolio Project Guidelines

This document is the single source of truth for editing, reviewing, and maintaining the portfolio project.

## 1. Project-wide editing principles

Keep the portfolio visually consistent, make the smallest change that solves the issue, and verify the result locally before considering the work complete.

Prefer project-specific changes over global overrides. Shared changes are reserved for behavior that is genuinely reusable across multiple pages.

## 2. Shared and reusable components

Before changing shared or reusable code, explain the affected scope and get explicit approval. This includes:

- `static/css/main.css`
- `static/css/project.css`
- shared page CSS and JavaScript
- the sidebar and navigation
- Carousel, button, video, and other reusable components

Make project-specific visual changes in the relevant project HTML or project-specific stylesheet whenever possible. Do not change shared rules as a patch for one page without approval.

After an approved shared change, preserve existing behavior and verify that other project pages are unaffected.

## 3. Navigation and loading behavior

The Works index intentionally skips page-entry and card-reveal animations so that refreshing Works or returning from a project shows the browsing surface immediately. Other pages retain their existing entry behavior.

While a page is loading images, fonts, or embeds, the user’s scroll intent takes priority over automatic position recovery. Once the user starts scrolling, fallback position restoration is cancelled so the page does not pull them back to the top.

These behaviors were checked against the local preview at `http://localhost:3000/works.html`. If a new navigation or loading issue appears, treat it as a separate, verified change rather than reopening unrelated shared rules.

The portfolio uses a shared local click-feedback effect in `static/js/main.js` and `static/css/main.css`. It is an independent native DOM/SVG/CSS implementation inspired by the Jackie Zhang reference interaction; it has no runtime dependency on that site, Framer, or any remote component. The effect is shared across pages, and internal Works-card links plus the primary sidebar navigation use a `420ms` navigation buffer so the `0.7s` click animation can begin before the document changes. Preserve this buffer when adjusting navigation timing, and verify both card navigation and Overview / Works / About navigation locally.

## 4. Asset system

### 4.1 Naming convention

New project assets should follow this pattern:

```text
<project-name>-<asset-role>-<variant-or-number>.<extension>
```

Use lowercase kebab-case throughout. Put the project name first, then a short descriptive role such as `cover`, `overview`, `concept`, `mechanism`, `experiment`, `outcome`, `reflection`, `code`, or `narrative`.

Use two-digit numbering for related sequences (`01`, `02`, `03`) and keep numbering stable when adding or replacing assets.

Examples:

- `the-underground-palace-narrative-01.gif`
- `wave-design-process-01.webp`
- `chem-guard-gas-mask-01.webp`
- `valentino-beauty-tiktok-01.webp`

Reusable assets should not be tied to an individual project. Place them in `static/picture/shared/` and name them for the component or function they support, for example `carousel-hint.svg`.

The shared Works gallery is the one intentional project-name exception: its files use `gallery-<project-name>.webp` at the gallery root.

### 4.2 File formats

- Use WebP as the default format for static raster images.
- Keep GIF for animated image sequences.
- Use WebM for video.
- Use SVG only for vector logos or interface graphics that need to remain vector-based.

## 5. Change verification and cleanup

When an asset is renamed:

1. Update every HTML, CSS, JavaScript, Markdown, and JSON reference in the same change.
2. Search the whole project for the old filename and confirm that no references remain.
3. Confirm that the new path resolves and that the asset still appears in the intended page or component.

Before removing an old file, confirm that it has no remaining references anywhere in the project. Do not deploy changes automatically; deployment remains a manual step.
