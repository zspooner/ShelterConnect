# ShelterDog Amplify Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from **Notion** and **Linear** for the dashboard/utility areas, and **Airbnb** for public-facing pages. This combines clean productivity aesthetics with warm, trustworthy presentation for adoption content.

## Core Design Elements

### A. Color Palette
**Primary Colors:**
- Light mode: 220 20% 20% (charcoal slate)
- Dark mode: 220 15% 95% (warm white)

**Brand Accent:**
- 160 50% 45% (emerald green - hope and growth)

**Status Colors:**
- Warning: 45 90% 60% (amber for "Soon" deadlines)
- Danger: 0 75% 55% (red for "Critical" and euthanasia risk)
- Success: 120 40% 50% (green for adopted status)

**Background Treatments:**
- Subtle gradient overlays on hero sections using primary + accent colors
- Soft cream/warm gray backgrounds for public pages to feel welcoming

### B. Typography
**Primary Font:** Inter (Google Fonts)
- Headings: 600-700 weight
- Body: 400-500 weight
- UI elements: 500 weight

**Sizes:** Use Tailwind's type scale (text-sm, text-base, text-lg, text-xl, text-2xl, text-3xl)

### C. Layout System
**Spacing Units:** Consistently use Tailwind units of **4, 6, 8, 12** (p-4, m-6, gap-8, space-y-12)
- Component padding: p-4 or p-6
- Section spacing: space-y-8 or space-y-12
- Container max-width: max-w-6xl

### D. Component Library

**Navigation:**
- Clean horizontal nav with shelter logo/name
- Breadcrumb navigation for deep pages
- Volunteer vs Shelter mode toggle

**Cards:**
- Dog profile cards with rounded corners (rounded-lg)
- Subtle shadows (shadow-sm) with hover states (shadow-md)
- Status badges with appropriate colors

**Forms:**
- Generous spacing between fields (space-y-6)
- Clear labels with optional field indicators
- Upload areas with drag-and-drop visual feedback

**Data Displays:**
- Simple metrics cards with large numbers
- Minimal sparkline charts for click tracking
- Status chips with dot indicators

**Overlays:**
- Modal dialogs for destructive actions
- Toast notifications for success/error states

### E. Page-Specific Design

**Dashboard (Utility-Focused):**
- Clean grid layout for dog cards
- Sidebar with filters and quick actions
- Metrics overview at top with key stats

**Public Dog Pages (Experience-Focused):**
- Large hero image of the dog (full viewport width)
- Urgency badge overlay (top-right of hero image)
- Two-column layout below hero: dog details + inquiry form
- Warm, approachable color scheme
- Prominent "Adopt Me" CTA buttons with blurred backgrounds when over images

**Volunteer Amplify Board:**
- Task cards in masonry/grid layout
- Filter chips at top
- Channel icons for easy scanning

## Images
**Hero Images:** Large hero images on public dog pages only - full viewport width showing the adoptable dog prominently. No hero images on utility pages (dashboard, forms).

**Profile Images:** Square thumbnails in cards and listings, circular avatars for user profiles.

**Generated Content:** Instagram-style square images with dog photo backgrounds, overlaid text, and QR codes as specified in requirements.

## Key Design Principles
1. **Emotional Connection**: Public pages should feel warm and hopeful
2. **Urgency Communication**: Clear visual hierarchy for deadline-driven content
3. **Efficiency**: Dashboard and admin areas prioritize speed and clarity
4. **Accessibility**: High contrast ratios, clear interactive states
5. **Mobile-First**: All layouts responsive with touch-friendly targets

This creates a professional tool that doesn't sacrifice the emotional appeal needed for successful pet adoption.