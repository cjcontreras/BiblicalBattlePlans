# Biblical Battle Plans - Theming Guide

This document provides comprehensive documentation for the RPG Parchment theme used in Biblical Battle Plans. Use this as a reference when extending or modifying the UI.

## Design Philosophy

The theme draws inspiration from classic RPG game interfaces with a warm, inviting parchment aesthetic. Key principles:

- **Warm & Inviting**: Soft parchment tones instead of stark whites or blacks
- **Subtle Depth**: Soft drop shadows for elevation rather than heavy borders
- **Tonal Borders**: Darker shades of the palette, not harsh black lines
- **Pixel Typography**: "Press Start 2P" font for that retro RPG feel
- **Quest Terminology**: Campaigns → Quests, Plans → Quests, Users → Heroes

---

## Color Palette

### Background Colors

| Variable | Hex | Description |
|----------|-----|-------------|
| `--color-parchment-dark` | `#d0b888` | Main page background |
| `--color-parchment` | `#e8d4a0` | Card/panel backgrounds |
| `--color-parchment-light` | `#f0e8d0` | Secondary/input backgrounds |
| `--color-parchment-lightest` | `#f8f4e8` | Highlights, hover states |

### Text Colors

| Variable | Hex | Description |
|----------|-----|-------------|
| `--color-ink` | `#2a2416` | Primary text (dark brown) |
| `--color-ink-muted` | `#6b5c47` | Secondary/muted text |
| `--color-ink-faint` | `#8a7a62` | Disabled/placeholder text |

### Accent Colors - Gold (Neutral)

| Variable | Hex | Description |
|----------|-----|-------------|
| `--color-gold` | `#c8a060` | Neutral highlights, streaks |
| `--color-gold-dark` | `#a07840` | Hover states for gold |
| `--color-bronze` | `#b89050` | Secondary accent |
| `--color-copper` | `#a08060` | Borders, subtle accents |

### Accent Colors - Sage Green (Primary Actions)

| Variable | Hex | Description |
|----------|-----|-------------|
| `--color-sage` | `#5d8a66` | Primary buttons, CTAs, checkboxes |
| `--color-sage-dark` | `#4a7053` | Hover state for sage |
| `--color-sage-light` | `#7aa883` | Light variant |
| `--color-sage-bg` | `#d8e8da` | Background tint (for panels) |
| `--color-sage-bg-light` | `#e8f2ea` | Lighter background |

### Accent Colors - Dusty Blue (Spiritual/Calm)

| Variable | Hex | Description |
|----------|-----|-------------|
| `--color-blue` | `#5a7a9a` | Verse sections, calm elements |
| `--color-blue-dark` | `#4a6a88` | Hover state for blue |
| `--color-blue-light` | `#7a9ab8` | Light variant |
| `--color-blue-bg` | `#d0dce8` | Background tint (for verse panels) |
| `--color-blue-bg-light` | `#e4ecf4` | Lighter background |

### Semantic Colors

| Variable | Hex | Description |
|----------|-----|-------------|
| `--color-success` | `#5d8a66` | Completed, positive states (matches sage) |
| `--color-success-light` | `#7aa883` | Hover state for success |
| `--color-warning` | `#d4a020` | Warnings, streak indicators |
| `--color-danger` | `#c84040` | Errors, destructive actions |
| `--color-danger-dark` | `#a83030` | Hover state for danger |

### Border Colors

| Variable | Hex | Description |
|----------|-----|-------------|
| `--color-border` | `#a08060` | Standard borders |
| `--color-border-subtle` | `#c4a878` | Subtle/light borders |
| `--color-border-strong` | `#806040` | Emphasized borders |
| `--color-border-sage` | `#8ab093` | Green-tinted border (for sage panels) |
| `--color-border-blue` | `#8aa8c4` | Blue-tinted border (for blue panels) |

### Shadow Colors

| Variable | Value | Description |
|----------|-------|-------------|
| `--shadow-color` | `rgba(90, 70, 50, 0.15)` | Standard shadows |
| `--shadow-color-strong` | `rgba(90, 70, 50, 0.25)` | Elevated shadows |

---

## Typography

### Font Family

```css
font-family: 'Press Start 2P', cursive;
```

The "Press Start 2P" font is used throughout the application for that retro game feel.

### Font Sizes (using Tailwind arbitrary values)

| Size | Class | Use Case |
|------|-------|----------|
| 0.5rem (8px) | `text-[0.5rem]` | Labels, hints, tiny text |
| 0.625rem (10px) | `text-[0.625rem]` | Body text, buttons |
| 0.75rem (12px) | `text-[0.75rem]` | Inputs, larger body text |
| 0.875rem (14px) | `text-sm` | Headings (small) |
| 1rem (16px) | `text-base` | Page titles |
| 1.25rem+ | `text-lg`, `text-xl` | Large stats, hero numbers |

### Typography Classes

```html
<!-- Section header -->
<h2 class="font-pixel text-[0.625rem] text-ink">SECTION TITLE</h2>

<!-- Body text -->
<p class="font-pixel text-[0.5rem] text-ink-muted">Description text here</p>

<!-- Stat value -->
<div class="font-pixel text-xl text-ink">42</div>
```

---

## CSS Utility Classes

### Parchment Panel

The primary container styling for cards and panels:

```html
<div class="parchment-panel">
  <!-- Content -->
</div>
```

Provides:
- Gradient background from parchment to parchment-light
- Subtle border
- Soft drop shadow

### Retro Button

For button styling with that classic game UI feel:

```html
<button class="retro-button">Click Me</button>
<button class="retro-button-primary">Primary Action (Sage Green)</button>
<button class="retro-button-gold">Gold Accent Button</button>
<button class="retro-button-danger">Delete</button>
```

### Accent Panels

For color-accented sections:

```html
<!-- Blue panel for Daily Verse / spiritual content -->
<div class="blue-panel">
  <div class="blue-panel-header">
    DAILY VERSE
  </div>
  <div class="p-4">Content here</div>
</div>

<!-- Sage panel for Today's Quests / action sections -->
<div class="sage-panel">
  <div class="sage-panel-header">
    TODAY'S QUESTS
  </div>
  <div class="p-4">Content here</div>
</div>
```

### Quest Checkbox

For reading/task checkboxes:

```html
<div class="quest-checkbox"><!-- Empty --></div>
<div class="quest-checkbox checked"><!-- Shows checkmark --></div>
```

### Section Header

For section titles with subtle accent background:

```html
<div class="section-header">
  <h2 class="font-pixel text-[0.625rem] text-ink">SECTION TITLE</h2>
</div>
```

Or using Tailwind classes directly:

```html
<div class="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
  ...
</div>
```

---

## Component Patterns

### Card with Section Header

```jsx
<Card noPadding>
  <div className="bg-gradient-to-r from-parchment-dark/40 to-transparent px-4 py-3 border-b border-border-subtle">
    <div className="font-pixel text-[0.625rem] text-ink">
      SECTION TITLE
    </div>
  </div>
  <div className="p-4">
    {/* Content */}
  </div>
</Card>
```

### Stat Block

```jsx
<div className="p-4 bg-parchment-light border border-border-subtle text-center shadow-[0_2px_4px_var(--shadow-color)]">
  <div className="flex justify-center mb-2">
    <Icon className="w-5 h-5 text-ink-muted" />
  </div>
  <div className="font-pixel text-xl text-ink">42</div>
  <div className="font-pixel text-[0.5rem] text-ink-muted mt-1">LABEL</div>
</div>
```

### Reading Item / Quest Checkbox

```jsx
<div className="flex items-center gap-3 p-3 bg-parchment-light border border-border-subtle">
  <div className={`w-5 h-5 border-2 flex items-center justify-center ${
    isCompleted ? 'border-sage-dark bg-sage' : 'border-border bg-parchment-lightest'
  }`}>
    {isCompleted && <Check className="w-3 h-3 text-white" />}
  </div>
  <span className={`font-pixel text-[0.625rem] ${
    isCompleted ? 'text-ink-muted line-through' : 'text-ink'
  }`}>
    {passage}
  </span>
</div>
```

### Progress Bar

```jsx
<div className="h-3 bg-parchment-light border border-border-subtle overflow-hidden">
  <div
    className="h-full bg-gradient-to-r from-sage to-sage-light transition-all duration-300"
    style={{ width: `${percentage}%` }}
  />
</div>
```

---

## Button Variants

| Variant | Tailwind Classes | Use Case |
|---------|-----------------|----------|
| Primary | `bg-gradient-to-b from-sage to-sage-dark border-sage-dark text-white` | Main actions (green) |
| Secondary | `bg-gradient-to-b from-parchment-light to-parchment border-border` | Alternative actions |
| Danger | `bg-gradient-to-b from-danger to-danger-dark border-danger-dark text-white` | Destructive actions |
| Ghost | `bg-transparent border-transparent hover:bg-parchment-light` | Subtle actions |

---

## Badge Variants

| Variant | Colors | Use Case |
|---------|--------|----------|
| Default | Parchment light bg | General labels |
| Success | Sage green bg, white text | Completed, positive |
| Warning | Gold/yellow bg | Warnings, streaks |
| Danger | Red bg, white text | Errors |
| Gold | Sage green gradient, white text | Special achievements |

---

## Shadows

Use consistent shadow patterns:

```css
/* Standard elevation */
shadow-[0_4px_12px_var(--shadow-color),0_2px_4px_var(--shadow-color)]

/* Elevated/emphasized */
shadow-[0_8px_24px_var(--shadow-color-strong),0_4px_8px_var(--shadow-color)]

/* Small/subtle */
shadow-[0_2px_4px_var(--shadow-color)]
```

---

## Animations

### Available Animation Classes

| Class | Description |
|-------|-------------|
| `animate-pulse-subtle` | Gentle pulse opacity animation |
| `animate-spin-pixel` | Stepped rotation (4 steps) |
| `animate-fade-in` | Fade in with slight upward motion |

---

## Extending the Theme

### Adding New Colors

Add to the `@theme` block in `src/index.css`:

```css
@theme {
  --color-your-new-color: #hexvalue;
}
```

Then use in Tailwind as `text-your-new-color`, `bg-your-new-color`, etc.

### Adding New Utility Classes

Add after the `@theme` block in `src/index.css`:

```css
.your-utility-class {
  /* your styles */
}
```

### Component Styling

When creating new components, follow these patterns:

1. Use `font-pixel` for all text
2. Use tonal borders (`border-border-subtle` or `border-border`)
3. Use soft shadows for elevation
4. Use the parchment color scale for backgrounds
5. Keep border-radius at 0 for that pixel-perfect look

---

## File Structure

```
src/
├── index.css          # Theme variables and utility classes
├── components/
│   └── ui/
│       ├── Button.tsx   # Button component with variants
│       ├── Card.tsx     # Card/panel containers
│       ├── Input.tsx    # Form inputs
│       ├── Badge.tsx    # Status badges
│       ├── ProgressBar.tsx
│       └── ...
```

---

## Quick Reference

### Common Class Combinations

```html
<!-- Page title -->
<h1 class="font-pixel text-sm text-ink">PAGE TITLE</h1>

<!-- Section header -->
<h2 class="font-pixel text-[0.625rem] text-ink">SECTION</h2>

<!-- Body text -->
<p class="font-pixel text-[0.5rem] text-ink-muted">Text</p>

<!-- Card -->
<div class="bg-gradient-to-br from-parchment to-parchment-light border-2 border-border-subtle shadow-[0_4px_12px_var(--shadow-color)]">

<!-- Stat container -->
<div class="bg-parchment-light border border-border-subtle p-4 text-center shadow-[0_2px_4px_var(--shadow-color)]">

<!-- Interactive item -->
<div class="bg-parchment-light border border-border-subtle hover:border-sage transition-all">

<!-- Blue panel (spiritual) -->
<div class="blue-panel">
  <div class="blue-panel-header">DAILY VERSE</div>
  <div class="p-4">...</div>
</div>

<!-- Sage panel (actions) -->
<div class="sage-panel">
  <div class="sage-panel-header">TODAY'S QUESTS</div>
  <div class="p-4">...</div>
</div>
```

---

## Terminology

Use RPG-themed language throughout the app:

| Generic Term | RPG Term |
|--------------|----------|
| User | Hero |
| Plan | Quest |
| Campaign | Quest |
| Start | Begin / Enlist |
| Complete | Conquer |
| Profile | Hero Status |
| Dashboard | Home |
| Settings | Forge |

---

*Last updated: December 2024*

