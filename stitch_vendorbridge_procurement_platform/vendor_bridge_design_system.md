# VendorBridge — Design System

## 1) Product Style Direction
VendorBridge should look like a modern B2B procurement SaaS dashboard: calm, trustworthy, spacious, and highly usable.

The visual style is based on the reference screenshot:
- warm off-white page background
- white cards and panels
- soft green primary brand color
- subtle borders and shadows
- rounded containers
- clean data-heavy layouts
- minimal decoration
- no black-heavy UI
- no futuristic or AI-looking styling

The interface should feel like serious business software used daily by procurement teams.

---

## 2) Color System

### Backgrounds
- **Page Background:** `#F8F6F1`
- **Surface / Card:** `#FFFFFF`
- **Soft Surface:** `#FCFBF8`
- **Subtle Tint Surface:** `#F2F7F4`

### Text Colors
- **Primary Text:** `#233128`
- **Secondary Text:** `#516058`
- **Muted Text:** `#7D887F`
- **Disabled Text:** `#A6ADA8`

### Brand Colors
- **Primary Green:** `#21B66F`
- **Primary Green Hover:** `#18945A`
- **Primary Green Soft:** `#E6F6ED`
- **Primary Green Deep:** `#15724A`

### Supporting Accent Colors
- **Blue:** `#5B7CFA`
- **Blue Soft:** `#E9EEFF`
- **Amber:** `#F0B84C`
- **Amber Soft:** `#FFF5DE`
- **Red:** `#E66A6A`
- **Red Soft:** `#FDECEC`
- **Purple:** `#8A6CFF`
- **Purple Soft:** `#F0EBFF`

### Borders
- **Main Border:** `#E8E2DA`
- **Soft Border:** `#F0EAE2`
- **Strong Border:** `#D8D1C7`

### Color Rules
- Never use pure black.
- Do not use very dark grays for large text blocks.
- Use green for actions, positive states, and active navigation.
- Use blue for charts and informational emphasis.
- Use amber for pending or in-review states.
- Use red only for errors, overdue items, or rejected states.
- Avoid rainbow dashboards. Keep the palette restrained and consistent.

---

## 3) Typography

### Font Family
- **Primary:** Inter
- **Alternative:** General Sans
- **Fallback:** system-ui, -apple-system, BlinkMacSystemFont, sans-serif

### Type Scale
- **Page Title:** 32px / 700
- **Section Title:** 22px / 700
- **Card Title:** 16px / 600
- **Body:** 14px / 400
- **Small Text:** 13px / 400
- **Label:** 12px / 500
- **Caption:** 11px / 500

### Typography Rules
- Keep headings clear and confident.
- Use sentence case for normal UI.
- Use uppercase only for small section labels.
- Avoid decorative fonts.
- Avoid extremely bold black type.
- Use dark green-gray text instead of black.

---

## 4) Spacing System
Use a consistent 4px grid.

- **4px** = tight gaps
- **8px** = label-to-input spacing, icon gaps
- **12px** = compact padding
- **16px** = standard spacing
- **24px** = card padding, section spacing
- **32px** = major section spacing
- **48px** = large page spacing

### Spacing Rules
- Keep layouts airy.
- Do not crowd tables, charts, or forms.
- Separate major sections clearly.
- Maintain strong visual rhythm across all screens.

---

## 5) Radius and Shape

### Border Radius
- **Inputs:** 8px
- **Buttons:** 10px
- **Cards:** 20px
- **Large Panels:** 24px
- **Badges / Pills:** full radius

### Shape Rules
- Cards should feel soft but still professional.
- Avoid sharp corners except where needed for structure.
- Avoid overly playful bubble shapes.

---

## 6) Shadow System
Use subtle elevation only.

- **Soft Card Shadow:** `0 1px 3px rgba(0, 0, 0, 0.05)`
- **Floating Panel Shadow:** `0 8px 24px rgba(0, 0, 0, 0.06)`
- **Focus Shadow:** soft green glow only

### Shadow Rules
- No dramatic shadows.
- No neon glows.
- Use shadows sparingly.
- Prefer borders and spacing over heavy depth.

---

## 7) Layout System

### General Layout
- Desktop-first enterprise interface
- Left sidebar navigation
- Top utility header
- Main content aligned to a wide grid
- Clean and predictable hierarchy

### Sidebar
- Width: 240px
- Background: white
- Active item: green tint background with green text
- Use simple text navigation with minimal icons
- Keep sidebar calm and readable

### Top Header
- Search bar on the left or center
- Notifications and profile on the right
- Clean, flat, unobtrusive design

### Content Area
- Use large cards and panels
- Keep enough whitespace around main sections
- Avoid full-width clutter
- Tables and analytics should be balanced visually

---

## 8) Buttons

### Primary Button
- Background: primary green
- Text: white
- Hover: darker green
- Radius: 10px
- Medium weight text

### Secondary Button
- Background: white
- Border: soft border
- Text: primary text
- Hover: subtle surface tint

### Ghost Button
- Transparent background
- Soft hover tint
- Used for low-priority actions

### Button Rules
- Keep buttons simple and confident.
- No glossy effects.
- No gradient buttons.
- Primary button should always be easy to find.

---

## 9) Forms

### Inputs
- White background
- 1px soft border
- Rounded corners
- Comfortable height
- Clear labels above fields

### Form Behavior
- Show helper text when needed
- Use clear validation states
- Keep multi-step forms organized
- Use cards for grouped form sections

### Form Rules
- Do not make forms feel dense.
- Keep labels and spacing consistent.
- Use light gray placeholders.
- Highlight active states in green.

---

## 10) Tables

### Table Style
- White surface
- Soft border
- Clear row separation
- Minimal row hover tint
- Clean column headers

### Table Rules
- Keep text readable.
- Use badges for status values.
- Avoid zebra striping unless necessary.
- Use hover or selection states, not heavy backgrounds.

### Status Badges
- **Approved:** green soft background, green text
- **Pending:** amber soft background, amber text
- **Draft:** neutral soft background, muted text
- **Rejected / Error:** red soft background, red text
- **Active:** green soft background, green text

---

## 11) Cards and Panels

### Card Style
- White background
- 1px soft border
- 20px radius
- 24px padding
- Soft shadow

### Card Rules
- Cards should feel like a premium dashboard system.
- Keep title, body, and actions clearly separated.
- Do not overdecorate cards.
- Use cards to group related information.

---

## 12) Charts and Analytics

### Chart Style
- Minimal and clean
- Soft axes and grid lines
- Limited colors
- Rounded bars and lines where possible
- Use green as the key growth color

### Chart Palette
- Green: primary trend or highlight
- Blue: support metric
- Amber: caution or pending
- Red: risk or negative

### Chart Rules
- Keep charts readable at a glance.
- Avoid cluttered legends.
- Use light backgrounds and soft contrast.
- Focus on business clarity, not visual noise.

---

## 13) Icons

### Icon Style
- Simple outline icons
- Rounded strokes
- Minimal detail
- Use consistent stroke weight

### Icon Rules
- Icons should support the interface, not dominate it.
- Use green only when the state is active or positive.
- Avoid decorative emoji-style visuals.

---

## 14) Navigation and State Rules

### Active State
- Green-tinted background
- Green text
- Subtle left emphasis

### Hover State
- Soft gray or green tint

### Focus State
- Clear green outline or glow

### Disabled State
- Reduced opacity
- Muted text

### Loading / Empty States
- Simple, calm, and informative
- No playful illustrations unless needed

---

## 15) Page Types
All pages in VendorBridge should follow the same visual language:

- Login
- Registration
- Dashboard
- Vendors
- RFQ creation
- Quotations
- Quotation comparison
- Approval workflow
- Purchase orders
- Invoices
- Activity logs
- Reports
- Settings

Each page must reuse the same:
- palette
- typography
- sidebar
- buttons
- cards
- borders
- spacing system
- table style
- badge style

---

## 16) Final Design Rules

1. Never use black as a main text color.
2. Keep the interface warm, soft, and professional.
3. Keep the UI business-first, not playful.
4. Maintain one consistent design system across all pages.
5. Use green as the brand anchor, not as decoration.
6. Keep all screens visually related.
7. Prefer clarity over visual complexity.
8. Make the product feel trustworthy and efficient.

---

## 17) One-line Summary
VendorBridge should look like premium procurement software with a warm background, white cards, soft green branding, muted dark-green text, and a clean enterprise dashboard style.