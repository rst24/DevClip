# DevClip Design Guidelines

## Design Approach

**Selected Approach:** Design System (Hybrid: Linear-inspired + VS Code familiarity)

**Rationale:** DevClip is a utility-focused developer productivity tool where efficiency, learnability, and performance are paramount. Drawing inspiration from Linear's modern minimalism combined with VS Code's developer-centric patterns ensures familiarity while maintaining visual sophistication.

**Key Design Principles:**
- Developer-first efficiency: Minimize clicks, maximize speed
- Visual hierarchy for Pro vs Free features
- Scannable clipboard history with syntax awareness
- Keyboard-friendly interactions throughout

## Typography

**Font Families:**
- Primary Interface: Inter (via Google Fonts CDN) - clean, readable at small sizes
- Code/Monospace: JetBrains Mono (via Google Fonts CDN) - optimized for code display

**Type Scale:**
- Hero/Headers: text-2xl font-semibold (extension popup header)
- Section Titles: text-lg font-medium
- Body Text: text-sm font-normal
- Code Snippets: text-xs font-mono
- Captions/Meta: text-xs opacity-75

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 3, 4, 6, and 8
- Micro spacing: p-2, gap-2 (between inline elements)
- Standard spacing: p-4, gap-4 (component padding, card gaps)
- Section spacing: p-6, py-8 (major sections)

**Grid System:**
- Extension popup: Fixed width (384px standard Chrome extension width)
- Settings/Dashboard: max-w-4xl centered container
- Clipboard items: Single column stack with dividers

## Component Library

### Core UI Elements

**Extension Popup Structure:**
- Header bar (h-14): Logo, active plan badge, settings icon
- Search/Filter bar (h-10): Quick search with keyboard shortcut indicator
- Clipboard history list: Virtualized scrollable list with max-h-96
- Action bar (sticky bottom, h-12): Format buttons, AI triggers

**Clipboard History Cards:**
- Compact mode (default): Single line preview with timestamp, 3-line clamp for text
- Expanded mode: Full content display with syntax highlighting
- Card structure: p-3, rounded-lg border, hover:shadow-md transition
- Meta info: Timestamp, content type badge, character count
- Quick actions: Copy, format, AI analyze (Pro badge for paid features)

**Pro Feature Indicators:**
- Badge component: text-xs px-2 py-1 rounded-full (e.g., "PRO", "AI")
- Locked state overlay: Blur effect on feature with unlock CTA
- Credit counter: Prominent display in header (e.g., "250 credits")

### Navigation

**Extension Popup:**
- Tab navigation: Inline tabs for History / Formatters / Settings
- Active state: border-b-2 with subtle background
- Icon + label for each tab (use Heroicons via CDN)

**Settings Panel:**
- Accordion-style sections: General, Formatting, AI, Billing
- Toggle switches for preferences
- Keyboard shortcut customization inputs

### Forms

**Search/Filter:**
- Input with icon prefix (search magnifier)
- Placeholder: "Search history... (Cmd+K)"
- Clear button on input focus
- Dropdown filters: Content type, date range

**Settings Controls:**
- Toggle switches: w-10 h-6 rounded-full with smooth transition
- Select dropdowns: Custom styled with chevron icon
- Number inputs: Stepper controls for credit limits

### Data Displays

**Clipboard History List:**
- Virtual scrolling for performance (display 20-30 items)
- Empty state: Centered icon, message, helpful tip
- Loading skeleton: Animated placeholder cards
- Infinite scroll with "Load more" trigger

**Syntax Highlighting:**
- Code blocks: rounded-md p-3 font-mono
- Language badge: Top-right corner of code block
- Line numbers for multi-line code (optional toggle)

**Stats Dashboard (Settings/Pro):**
- Metric cards: grid-cols-3 gap-4
- Large number display with label below
- Trend indicators (e.g., usage this month)

### Overlays

**Modals:**
- Upgrade prompt: Centered modal (max-w-md) with feature comparison
- Confirmation dialogs: Minimal with clear primary/secondary actions
- AI processing: Loading state with progress indicator

**Toasts:**
- Position: top-right, fixed
- Auto-dismiss after 3s
- Success/error states with appropriate icons
- Action button for undo operations

**Tooltips:**
- Hover delays: 300ms
- Keyboard shortcut hints in tooltips
- Positioning: Smart placement to avoid edge overflow

## Animations

**Subtle Motion Only:**
- Hover states: opacity-90 transition-opacity duration-150
- Card expand: max-height transition with ease-in-out
- Modal enter/exit: fade + slight scale (duration-200)
- Toast slide-in: translate-x + opacity
- NO complex scroll animations or distracting effects

## Accessibility

**Keyboard Navigation:**
- All interactive elements focusable
- Visible focus rings (ring-2 ring-offset-2)
- Keyboard shortcuts clearly indicated
- Escape key closes modals/expanded states

**Screen Reader Support:**
- ARIA labels for icon-only buttons
- Live regions for toast notifications
- Semantic HTML structure throughout

## Images

**No Hero Image Required** - This is a utility extension, not a marketing site. Focus on functional UI.

**Icon Usage:**
- Use Heroicons (outline style) via CDN for all UI icons
- Format type icons: JSON, SQL, YAML, etc.
- Status icons: Success checkmark, error alert, loading spinner
- Never generate custom SVG icons

## Specific Component Specifications

**Header Bar:**
- Sticky positioning
- Logo (24x24) + "DevClip" wordmark on left
- Plan badge + credits on right
- Settings gear icon (clickable)

**Format Buttons:**
- Grid layout: grid-cols-4 gap-2
- Icon + label vertical stack
- Disabled state for unavailable formats
- Pro badge overlay for AI features

**Pricing Table (Upgrade Modal):**
- 3 columns: Free, Pro ($10/mo), Team ($49/mo)
- Feature comparison with checkmarks
- Highlight recommended plan
- Clear CTA buttons

**Feedback Form:**
- Minimal: Rating stars + text area
- Submit at bottom
- Success confirmation toast

This design system creates a professional, efficient developer tool that balances modern aesthetics with functional clarity, ensuring quick clipboard management while clearly differentiating free and Pro features.