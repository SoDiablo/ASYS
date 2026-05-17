# Design System Specification: The Architectural Blueprint

## 1. Overview & Creative North Star
**Creative North Star: "The Architectural Negative"**
This design system moves beyond the "gray box" wireframe to create a high-end, editorial-grade blueprint. It treats the SaaS dashboard not as a collection of widgets, but as a structured environment of light and shadow. By stripping away the distraction of color, we focus entirely on **Information Architecture (IA)** and **Spatial Intent**. 

The "template" look is avoided through intentional asymmetry—using large, sweeping areas of `surface_container_lowest` against tighter, dense data clusters. The result is a system that feels like a premium architectural drawing: precise, authoritative, and profoundly organized.

---

## 2. Colors & Surface Logic
The palette is a monochromatic spectrum designed to define hierarchy through tonal weight rather than chroma.

### The "No-Line" Rule
Standard 1px borders are largely prohibited for sectioning. To create a premium feel, boundaries must be defined by background shifts. Use `surface_container_low` for the main canvas and `surface_container_lowest` (pure white) for high-priority interactive areas. This "etched" look prevents the UI from feeling cluttered with "wire-mesh" lines.

### Surface Hierarchy & Nesting
Treat the dashboard as a series of physical layers:
*   **Level 0 (Base):** `surface` (#faf9f9) – The global background.
*   **Level 1 (Sections):** `surface_container_low` (#f4f3f3) – Sidebars or utility panels.
*   **Level 2 (Cards/Content):** `surface_container_lowest` (#ffffff) – Primary content blocks.
*   **Level 3 (Interactive):** `surface_bright` (#faf9f9) – Floating elements or active states.

### Signature Textures: The "Glass & Gradient" Rule
To elevate the wireframe, use subtle tonal gradients. A primary CTA should not be a flat gray; instead, apply a linear gradient from `primary` (#000000) to `primary_container` (#3b3b3b). For floating modals, use a backdrop-blur of 12px with a 70% opacity `surface_container_lowest` to create a "frosted glass" effect that keeps the user grounded in the dashboard context.

---

## 3. Typography
**Typeface:** Inter (Precision Sans)
The typography is the "lead architect" of this system. We use a high-contrast scale to ensure the hierarchy is unmistakable even without color.

*   **Display (Display-LG/MD):** Used for high-level dashboard summaries (e.g., total MRR). These should be tracked slightly tight (-0.02em) to feel "editorial."
*   **Headlines (Headline-SM):** Used for card titles. These represent the "Names" of data modules.
*   **Body (Body-MD):** The workhorse for all data entry and descriptions.
*   **Labels (Label-MD):** Used for metadata and form headers. Always in `on_surface_variant` (#474747) to distinguish them from actionable data.

---

## 4. Elevation & Depth
In this system, depth is a function of "Tonal Layering," not structural lines.

*   **The Layering Principle:** A card should never have a border. It should exist as a `surface_container_lowest` block sitting on a `surface_container_low` background. This creates a "soft lift" that is easier on the eyes for long-term SaaS usage.
*   **Ambient Shadows:** When an element must float (e.g., a dropdown or modal), use a shadow color derived from `on_surface` (#1a1c1c) at 4% opacity with a 24px blur and 8px Y-offset. It should feel like a soft atmospheric glow, not a hard drop shadow.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility (e.g., a text input), use the `outline_variant` (#c6c6c6) at 20% opacity. Forbid 100% opaque borders as they break the editorial flow.

---

## 5. Components

### Buttons
*   **Primary:** Fill `primary` (#000000), text `on_primary` (#e4e2e2). Sharp corners (`sm`: 0.125rem) for a brutalist, professional feel.
*   **Secondary:** Fill `secondary_container` (#d4d4d4), text `on_secondary_container` (#1a1c1c). 
*   **Tertiary:** No fill. Text `primary` (#000000) with an underline on hover.

### Input Fields
*   **Style:** Minimalist underline or "ghost" box.
*   **States:** Default uses `outline_variant` at 20%. Active state uses a 1px `primary` (#000000) bottom border only. This keeps the form-heavy SaaS pages looking clean and "un-boxed."

### Cards & Lists
*   **Rule:** Forbid divider lines. Use `spacing-6` (2rem) of vertical whitespace to separate list items, or a subtle background toggle between `surface_container_low` and `surface_container_lowest`.
*   **Data Density:** Use `spacing-1.5` (0.5rem) for internal card padding to maintain a compact, "pro" tool aesthetic.

### Additional Component: The "Breadcrumb Rail"
A persistent, thin `surface_dim` (#dadada) strip at the top of the workspace to provide immediate locational context without the visual weight of a full header.

---

## 6. Do's and Don'ts

### Do
*   **Do** use extreme whitespace (`spacing-16` or `20`) to separate major functional modules.
*   **Do** use `display-lg` for single, "Hero" numbers to create a sense of scale.
*   **Do** nest containers using background color shifts (Lightest on Low) to show ownership of content.

### Don't
*   **Don't** use 1px solid #D1D1D1 borders to create grids; use the spacing scale and background shifts instead.
*   **Don't** use standard "drop shadows." If it doesn't look like ambient light, it's too heavy.
*   **Don't** introduce any hue. The professional authority of this system relies entirely on its grayscale purity.