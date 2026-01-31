# StoreStorm Design System

A modern, premium design system for the StoreStorm SaaS platform following Vercel Web Interface Guidelines.

---

## Design Philosophy

StoreStorm should feel **premium, professional, and delightful** to use. We're building for local shopkeepers who deserve the same quality experience as enterprise SaaS platforms.

### Core Principles

1. **Dark Mode First** - Modern, easy on the eyes, premium feel
2. **Glassmorphism** - Subtle blur effects for depth
3. **Micro-animations** - Delightful transitions that feel alive
4. **Bold Typography** - Clear hierarchy with Inter font family
5. **Vibrant Accents** - Purple/Indigo as primary, with semantic colors

---

## Color Palette

### Dark Theme (Primary)

```css
/* Background layers */
--bg-base: #0a0a0f;           /* Darkest background */
--bg-surface: #12121a;        /* Card/panel background */
--bg-elevated: #1a1a24;       /* Elevated elements */
--bg-hover: #22222e;          /* Hover states */

/* Accent colors */
--accent-primary: #8b5cf6;    /* Purple - Primary actions */
--accent-secondary: #06b6d4;  /* Cyan - Secondary elements */
--accent-success: #22c55e;    /* Green - Success states */
--accent-warning: #f59e0b;    /* Amber - Warnings */
--accent-danger: #ef4444;     /* Red - Errors/destructive */

/* Text colors */
--text-primary: #fafafa;      /* Primary text */
--text-secondary: #a1a1aa;    /* Secondary/muted text */
--text-tertiary: #71717a;     /* Disabled/placeholder */

/* Border colors */
--border-default: #27272a;    /* Default borders */
--border-hover: #3f3f46;      /* Hover state borders */
--border-focus: #8b5cf6;      /* Focus ring color */

/* Gradient */
--gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
--gradient-surface: linear-gradient(180deg, rgba(139,92,246,0.1) 0%, transparent 100%);
```

### Semantic Colors

| Purpose | Color | Usage |
|---------|-------|-------|
| Orders | `#8b5cf6` Purple | New orders, order management |
| Inventory | `#22c55e` Green | Stock levels, products |
| Delivery | `#f59e0b` Amber | Delivery tracking, routes |
| GST | `#06b6d4` Cyan | Compliance, reports |
| Alerts | `#ef4444` Red | Low stock, errors |

---

## Typography

### Font Family

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### Font Sizes

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| `text-xs` | 12px | 16px | Badges, labels |
| `text-sm` | 14px | 20px | Body small, captions |
| `text-base` | 16px | 24px | Body text |
| `text-lg` | 18px | 28px | Lead paragraphs |
| `text-xl` | 20px | 28px | Card titles |
| `text-2xl` | 24px | 32px | Section headers |
| `text-3xl` | 30px | 36px | Page titles |
| `text-4xl` | 36px | 40px | Hero titles |
| `text-5xl` | 48px | 48px | Dashboard numbers |

### Font Weights

- `font-normal` (400) - Body text
- `font-medium` (500) - UI labels, buttons
- `font-semibold` (600) - Subheadings
- `font-bold` (700) - Headings, emphasis

### Rules (Web Interface Guidelines)

- Use `…` not `...` for loading states
- Use curly quotes `"` `"` not straight `"`
- Use `tabular-nums` for number columns
- Use `text-wrap: balance` on headings

---

## Spacing & Layout

### Spacing Scale

```
4px  - xs    (gap between icons and text)
8px  - sm    (internal padding)
12px - md    (default padding)
16px - lg    (card padding)
24px - xl    (section spacing)
32px - 2xl   (major sections)
48px - 3xl   (page sections)
64px - 4xl   (hero spacing)
```

### Container Max Widths

- `max-w-7xl` (1280px) - Main content
- `max-w-4xl` (896px) - Forms, modals
- `max-w-2xl` (672px) - Text content

### Grid System

```css
/* Dashboard layout */
grid-cols-1 md:grid-cols-2 lg:grid-cols-4

/* Card grids */
gap-4 md:gap-6

/* Sidebar layout */
grid-cols-[280px_1fr]
```

---

## Components

### Cards

```jsx
// Base card with glassmorphism
<div className="
  bg-surface/80
  backdrop-blur-xl
  border border-white/10
  rounded-2xl
  p-6
  shadow-xl
  shadow-black/20
">

// Stat card with gradient border
<div className="
  relative
  overflow-hidden
  bg-gradient-to-br from-purple-500/10 to-transparent
  border border-purple-500/20
  rounded-2xl
  p-6
">
```

### Buttons

```jsx
// Primary button
<button className="
  px-6 py-3
  bg-gradient-to-r from-purple-600 to-purple-500
  hover:from-purple-500 hover:to-purple-400
  text-white font-medium
  rounded-xl
  shadow-lg shadow-purple-500/25
  transition-all duration-200
  hover:shadow-xl hover:shadow-purple-500/30
  hover:-translate-y-0.5
  focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black
">

// Ghost button
<button className="
  px-4 py-2
  text-zinc-400
  hover:text-white
  hover:bg-white/5
  rounded-lg
  transition-colors duration-200
  focus-visible:ring-2 focus-visible:ring-purple-500
">
```

### Input Fields

```jsx
<input
  type="text"
  className="
    w-full
    px-4 py-3
    bg-black/40
    border border-white/10
    hover:border-white/20
    focus:border-purple-500 focus:ring-1 focus:ring-purple-500
    rounded-xl
    text-white
    placeholder-zinc-500
    transition-colors duration-200
  "
  placeholder="Search orders…"
/>
```

### Badges

```jsx
// Status badge
<span className="
  inline-flex items-center
  px-2.5 py-1
  text-xs font-medium
  bg-green-500/10
  text-green-400
  border border-green-500/20
  rounded-full
">
  Active
</span>
```

---

## Animations

### Transitions

```css
/* Default transition */
transition-all duration-200 ease-out

/* Hover lift effect */
hover:-translate-y-0.5
hover:shadow-lg

/* Scale on press */
active:scale-[0.98]

/* Fade in */
animate-in fade-in duration-300
```

### Micro-interactions

1. **Button press** - Slight scale down (0.98)
2. **Card hover** - Subtle lift + shadow increase
3. **Link hover** - Color transition + underline
4. **Toggle** - Smooth spring animation
5. **Loading** - Pulse or skeleton shimmer

### Rules (Web Interface Guidelines)

- Honor `prefers-reduced-motion`
- Animate only `transform` and `opacity`
- Never use `transition: all`
- Animations must be interruptible

---

## Iconography

### Icon Library

Use **Lucide React** for consistent, clean icons.

```bash
npm install lucide-react
```

### Icon Sizes

| Size | Usage |
|------|-------|
| 16px | Inline with text, badges |
| 20px | Buttons, menu items |
| 24px | Cards, navigation |
| 32px | Feature highlights |
| 48px | Empty states |

### Usage

```jsx
import { Package, ShoppingCart, Truck, FileText } from 'lucide-react'

<Package className="w-5 h-5 text-purple-400" aria-hidden="true" />
```

---

## Navigation

### Sidebar

- Fixed position, 280px width
- Glassmorphic background
- Active state with gradient background
- Hover state with subtle background
- Icons + labels, collapsible on mobile

### Top Bar

- Sticky, blur backdrop
- Search command palette (Cmd+K)
- User avatar + dropdown
- Notifications bell

---

## Dashboard Design

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ SIDEBAR (280px)  │  MAIN CONTENT                            │
│                  │                                          │
│ • Logo           │  ┌─────────────────────────────────────┐ │
│ • Dashboard      │  │ TOP BAR (Search, User, Notifications) │
│ • Orders         │  └─────────────────────────────────────┘ │
│ • Inventory      │                                          │
│ • Delivery       │  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ │
│ • GST            │  │ STAT  │ │ STAT  │ │ STAT  │ │ STAT  │ │
│ • Settings       │  │ CARD  │ │ CARD  │ │ CARD  │ │ CARD  │ │
│                  │  └───────┘ └───────┘ └───────┘ └───────┘ │
│ ─────────────    │                                          │
│ • Help           │  ┌─────────────────┐ ┌─────────────────┐ │
│ • Storefront     │  │  RECENT ORDERS  │ │  AI INSIGHTS    │ │
│                  │  │                 │ │                 │ │
│                  │  │                 │ │                 │ │
│                  │  └─────────────────┘ └─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Stat Cards

Each stat card should have:
- Icon with colored background
- Large number (tabular-nums)
- Label text
- Trend indicator (optional)
- Gradient border on hover

---

## Accessibility (Web Interface Guidelines)

### Focus States

- Always visible focus ring
- Use `focus-visible:` (not `:focus`)
- Ring color matches accent

```css
focus-visible:ring-2
focus-visible:ring-purple-500
focus-visible:ring-offset-2
focus-visible:ring-offset-black
```

### ARIA

- Icon buttons need `aria-label`
- Decorative icons need `aria-hidden="true"`
- Use semantic HTML first
- Skip link for main content

### Forms

- Labels for all inputs (`htmlFor`)
- Proper `autocomplete` attributes
- Error messages inline with fix suggestion
- Never block paste

---

## File: index.css Updates

```css
@import "tailwindcss";

/* Import Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

/* Custom theme variables */
@theme {
  --color-surface: #12121a;
  --color-elevated: #1a1a24;
  --font-family-sans: 'Inter', system-ui, sans-serif;
}

/* Base styles */
html {
  color-scheme: dark;
  -webkit-tap-highlight-color: transparent;
}

body {
  @apply bg-[#0a0a0f] text-zinc-100 antialiased;
  font-family: 'Inter', system-ui, sans-serif;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #27272a;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}

/* Focus visible utility */
.focus-ring {
  @apply focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:outline-none;
}

/* Glassmorphism utility */
.glass {
  @apply bg-white/5 backdrop-blur-xl border border-white/10;
}

/* Gradient text */
.gradient-text {
  @apply bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent;
}
```

---

## Implementation Priority

### Phase 1: Foundation
1. ✅ Update `index.css` with theme
2. ✅ Create layout components (Sidebar, TopBar)
3. ✅ Build base UI components (Card, Button, Input)

### Phase 2: Dashboard
1. ✅ Rebuild Dashboard with new design
2. ✅ Create stat cards with animations
3. ✅ Add recent orders section
4. ✅ Add AI insights panel

### Phase 3: Feature Pages
1. Orders page with data table
2. Inventory page with product grid
3. Delivery page with map
4. GST page with reports

---

## References

- [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [Inter Font](https://fonts.google.com/specimen/Inter)
