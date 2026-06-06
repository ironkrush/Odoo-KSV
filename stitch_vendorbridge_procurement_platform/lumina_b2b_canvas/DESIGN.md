---
name: Lumina B2B Canvas
colors:
  surface: '#fbf9f4'
  surface-dim: '#dbdad5'
  surface-bright: '#fbf9f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ee'
  surface-container: '#f0eee9'
  surface-container-high: '#eae8e3'
  surface-container-highest: '#e4e2dd'
  on-surface: '#1b1c19'
  on-surface-variant: '#3d4a40'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ec'
  outline: '#6d7a6f'
  outline-variant: '#bccabd'
  surface-tint: '#006d3e'
  primary: '#006d3e'
  on-primary: '#ffffff'
  primary-container: '#21b66f'
  on-primary-container: '#004022'
  inverse-primary: '#57df93'
  secondary: '#2a50cd'
  on-secondary: '#ffffff'
  secondary-container: '#486ae8'
  on-secondary-container: '#fffbff'
  tertiary: '#a73644'
  on-tertiary: '#ffffff'
  tertiary-container: '#fb7581'
  on-tertiary-container: '#700920'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#76fcad'
  primary-fixed-dim: '#57df93'
  on-primary-fixed: '#00210f'
  on-primary-fixed-variant: '#00522e'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b7c4ff'
  on-secondary-fixed: '#001453'
  on-secondary-fixed-variant: '#0038b8'
  tertiary-fixed: '#ffdada'
  tertiary-fixed-dim: '#ffb3b6'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#871d2e'
  background: '#fbf9f4'
  on-background: '#1b1c19'
  surface-variant: '#e4e2dd'
  surface-card: '#FFFFFF'
  text-primary: '#233128'
  text-secondary: '#516058'
  border-main: '#E8E2DA'
  status-amber: '#F0B84C'
  status-red: '#E66A6A'
  status-purple: '#8A6CFF'
  tint-green: '#E6F6ED'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  tight: 8px
  base: 16px
  comfortable: 24px
  loose: 32px
  major: 48px
  sidebar-width: 240px
  container-padding: 24px
---

## Brand & Style

This design system is engineered for high-stakes procurement environments where clarity, speed, and reliability are paramount. The aesthetic is defined as **Corporate Modern with a Tactile Warmth**, moving away from the cold, clinical grays of traditional enterprise software toward a more human-centric, approachable palette.

The core philosophy balances "Utility" and "Premium." By utilizing a warm off-white foundation, the UI reduces eye strain during long working hours, while the precision of the grid and the vibrancy of the primary green instill confidence in the data being managed. It is an interface that feels less like a tool and more like a high-end physical workspace.

## Colors

The palette is anchored by a **warm, organic neutral base** rather than pure white or cool gray. This creates a soft contrast that makes the primary green and secondary accent colors pop with intentionality.

- **Foundational Neutrals:** Use `#F8F6F1` for the global page background. Reserve `#FFFFFF` exclusively for cards and interactive panels to create clear elevation.
- **Brand Primary:** Use `#21B66F` for primary calls to action, active navigation states, and positive growth indicators.
- **Semantic Accents:** Blue is for information/logic, Amber for pending/warning, and Red for critical errors or overdue status.
- **Typography:** Never use pure black (`#000000`). All text is derived from a deep forest-green base (`#233128`) to maintain harmony with the brand green.

## Typography

The system utilizes **Inter** for its exceptional legibility in data-heavy environments. The typographic hierarchy is strictly enforced to ensure that complex dashboards remain scannable.

- **Headings:** Use tighter letter spacing for large titles to create a contemporary, "locked-in" feel.
- **Case Usage:** Use Sentence case for almost all UI elements. Uppercase is reserved strictly for `label-md` roles (such as small section headers or table headers) to provide structural distinction.
- **Hierarchy:** High-level metrics should use `headline-xl` while secondary data points use `body-sm` to create a clear visual flow.

## Layout & Spacing

The system follows a **12-column fluid grid** for the main content area, anchored by a fixed left-hand navigation sidebar.

- **Sidebar:** Fixed at 240px. Use a clean white background with `#E8E2DA` right-border separation.
- **Grid Rhythm:** Built on a 4px baseline. Standard card padding should always be `comfortable` (24px) to ensure data doesn't feel cramped.
- **Vertical Flow:** Major sections (e.g., between the header and the metric row) should use `loose` (32px) or `major` (48px) spacing to allow the interface to "breathe."
- **Mobile Adaptivity:** On mobile, the sidebar collapses into a hamburger menu, and the 12-column grid reflows into a single column with `base` (16px) horizontal margins.

## Elevation & Depth

This system avoids aggressive skeuomorphism in favor of **Tonal Layers and Soft Ambient Shadows**.

- **Level 0 (Background):** The warm off-white surface (`#F8F6F1`).
- **Level 1 (Cards):** White surfaces (`#FFFFFF`) with a 1px border of `#E8E2DA`. A very soft shadow (`0 1px 3px rgba(0,0,0,0.05)`) is applied to give a slight "lift" without looking heavy.
- **Level 2 (Overlays):** Modals, dropdowns, and floating menus use a more pronounced shadow (`0 8px 24px rgba(0,0,0,0.06)`) to signify immediate interaction focus.
- **Focus States:** No heavy outlines. Use a soft primary green glow or a 2px solid green border for active input focus.

## Shapes

The shape language is defined by **generous, friendly radii** that signal modern software design.

- **Cards:** Fixed at 20px for a distinctive, soft appearance that sets the tone for the entire application.
- **Buttons:** 10px roundedness provides a slightly more geometric feel than the cards, maintaining a "clickable" profile.
- **Inputs:** 8px roundedness for a standard, professional form look.
- **Badges:** Always use full-pill radius to distinguish them from interactive buttons or static labels.

## Components

### Buttons
- **Primary:** Background `#21B66F`, Text `#FFFFFF`. Use 10px radius. Medium weight.
- **Secondary:** Background `#FFFFFF`, Border 1px `#E8E2DA`, Text `#233128`.
- **Icon Buttons:** Use primary green soft (`#E6F6ED`) for the background when the icon is the focus.

### Cards
- Always use white backgrounds.
- Padding: 24px.
- Internal grouping: Use subtle background tints (`#FCFBF8`) for internal sections rather than nested borders.

### Data Tables
- Headers: `label-md` style with `#7D887F` text color.
- Row separation: 1px bottom border using `#F0EAE2`.
- Hover state: Very light tint (`#F2F7F4`).

### Badges & Pills
- Use low-saturation background tints of the semantic colors (e.g., soft green for "Approved", soft amber for "Pending").
- Text should be the high-saturation version of the same hue for maximum legibility.

### Form Inputs
- Height: 40px standard.
- Border: 1px `#E8E2DA`.
- Active state: Border changes to `#21B66F` with a soft 2px outer glow.