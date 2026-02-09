# Eye Scan Pro - Component Guide & Visual Design

## Dashboard Component Hierarchy

```
App
├── LoginForm / RegisterForm (Auth State)
└── Dashboard (Authenticated State)
    ├── Navigation (Sidebar)
    │   ├── Logo Section
    │   ├── User Profile
    │   ├── Navigation Menu
    │   │   ├── Main Section
    │   │   ├── Operations Section
    │   │   └── Management Section
    │   └── Logout Button
    └── Dashboard Content (Router)
        ├── HomeView
        │   ├── Header
        │   ├── Quick Actions
        │   └── How It Works
        ├── PatientDetails
        │   ├── Form Header
        │   ├── Patient Form
        │   │   ├── Basic Information
        │   │   └── Medical Information
        │   └── Submit Button
        ├── EyeScanUpload
        │   ├── Scan Header
        │   ├── Patient Card
        │   ├── Upload Area
        │   │   ├── Upload Placeholder
        │   │   └── Preview
        │   ├── Upload Info
        │   └── Analyze Button
        └── Results
            ├── Results Header
            ├── Results Grid
            │   ├── Risk Level Card
            │   ├── Risk Score Card
            │   └── Confidence Card
            ├── Patient Summary
            ├── Analysis Message
            ├── Recommendations
            ├── Risk Indicators
            └── Action Buttons
```

## Color Palette

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Purple | #667eea | Primary buttons, gradients |
| Indigo | #764ba2 | Gradient end, accents |
| Red | #dc3545 | High risk, danger states |
| Orange | #f5a623 | Warnings, medium risk |
| Green | #28a745 | Success, low risk |

### Neutral Colors
| Name | Hex | Usage |
|------|-----|-------|
| Dark Gray | #2d3748 | Text, headings |
| Medium Gray | #4a5568 | Secondary text |
| Light Gray | #a0aec0 | Tertiary text |
| Bg Light | #f7fafc | Background |
| Bg Lighter | #edf2f7 | Disabled, secondary bg |

### Gradients
```css
/* Primary Gradient */
linear-gradient(135deg, #667eea 0%, #764ba2 100%)

/* Soft Gradient */
linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))
```

## Typography System

### Font Sizes
```
Body: 0.95em / 1em
Small: 0.85em / 0.9em
Large: 1.1em / 1.2em
XLarge: 1.4em / 1.5em
XXLarge: 1.8em / 2em
Heading: 2.5em
```

### Font Weights
```
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
```

## Button Styles

### Primary Button
```jsx
<button className="btn btn-primary">
  Proceed to Eye Scan →
</button>
```
**States:**
- Normal: Gradient background, white text, shadow
- Hover: translateY(-2px), enhanced shadow
- Active: pressed appearance
- Disabled: 0.6 opacity, no cursor

### Secondary Button
```jsx
<button className="btn btn-secondary">
  View History →
</button>
```
**States:**
- Normal: Light gray bg, border, dark text
- Hover: Darker bg, scale(1.05)
- Disabled: 0.6 opacity

### Icon Buttons (Navigation)
```jsx
<button className="nav-item">
  <span className="nav-icon">🏠</span>
  <span className="nav-label">Dashboard</span>
</button>
```
**States:**
- Normal: Transparent, light text
- Hover: Dark blue bg, left slide
- Active: Accent bg, left border highlight

## Form Components

### Input Field
```jsx
<div className="form-group">
  <label htmlFor="name">Full Name *</label>
  <input 
    type="text" 
    id="name" 
    placeholder="Enter patient's full name"
  />
</div>
```
**Styles:**
- Border: 2px solid #e2e8f0
- Padding: 12px 15px
- Border-radius: 8px
- Focus: #667eea border, light shadow

### Error Message
```jsx
{error && <span className="error-text">⚠️ {error}</span>}
```
**Style:** Red text, 0.85em, top margin

### Form Section
- Padding: 30px
- Border-bottom: 1px solid divider
- Section title: 1.4em, 600 weight

## Card Components

### Action Card
```jsx
<div className="action-card">
  <div className="action-icon">👤</div>
  <h3>New Patient Scan</h3>
  <p>Description text</p>
  <button className="action-btn btn-primary">Action →</button>
</div>
```
**Styles:**
- Background: white
- Padding: 30px
- Border-radius: 12px
- Shadow: 0 5px 15px rgba(0,0,0,0.08)
- Hover: translateY(-5px), enhanced shadow
- Grid: auto-fit, minmax(300px, 1fr)

### Result Card
```jsx
<div className="result-card risk-card">
  <div className="card-icon">⚠️</div>
  <h3>Risk Level</h3>
  <p className="risk-level">High</p>
</div>
```
**Card Types:**
- Risk Card: Light red bg, red text
- Score Card: White, circular progress
- Confidence Card: Light green bg

## Loading States

### Spinner Animation
```css
.spinner {
  width: 16px;
  height: 16px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Button with Spinner
```jsx
<button className="btn btn-primary" disabled={isLoading}>
  {isLoading ? (
    <>
      <span className="spinner"></span>
      Processing...
    </>
  ) : (
    'Submit'
  )}
</button>
```

## Responsive Design Details

### Desktop (> 768px)
- Sidebar: 280px width
- Content padding: 20px
- Grid: 2+ columns
- Buttons: 250px min-width

### Tablet (768px)
- Sidebar: 240px width
- Content padding: 15px
- Grid: 1-2 columns
- Form rows: Stack to single column

### Mobile (< 480px)
- Sidebar: 60px (icons only) or hidden
- Content padding: 10px
- Grid: 1 column
- Buttons: Full width
- Form: Single column

## Accessibility Features

### Color Contrast
- Text on bg: 4.5:1 or higher (WCAG AA)
- Buttons: High contrast colors
- Links: Underlined on focus

### Interactive Elements
- All buttons have `:hover`, `:active`, `:focus` states
- Form inputs have clear labels
- Error messages associated with fields
- Loading states prevent multiple submissions

### Keyboard Navigation
- Tab order follows visual flow
- Enter key submits forms
- ESC closes modals/dropdowns
- All buttons keyboard accessible

## Icons & Emojis Used

```
🏠 Dashboard
👤 Patient Details / User
📸 Eye Scan
📊 Results / Analytics
📋 History
⚙️ Settings
🚪 Logout
👁️ Logo (Eye Scan Pro)
⚠️ Risk/Warning
✓ Success/Confirm
→ Arrow/Next
🔄 Refresh
📥 Download
```

## Animation Effects

### Smooth Transitions
```css
transition: all 0.3s ease;
```
Applied to:
- Button hover states
- Card hovers
- Navigation items
- Form inputs focus

### Transform Animations
```css
/* Lift on hover */
transform: translateY(-5px);

/* Scale on hover */
transform: scale(1.05);

/* Slide on hover */
padding-left: 25px;
```

## Shadow System

### Subtle Shadow
```css
box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
```
Used on: Cards, forms

### Medium Shadow
```css
box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
```
Used on: Hovered cards

### Accent Shadow
```css
box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
```
Used on: Primary buttons

## Navigation States

### Normal State
- Transparent background
- Light text (70% opacity)
- No left border

### Hover State
- Dark background (20% opacity)
- Full opacity text
- 3px left slide

### Active State
- Accent gradient background
- 4px left border (accent color)
- Full opacity text

## Success / Error States

### Success (Green)
```css
background: #e8f5e9;
color: #28a745;
border-left: 4px solid #28a745;
```

### Error (Red)
```css
background: #ffe5e5;
color: #c53030;
border-left: 4px solid #c53030;
```

### Warning (Orange)
```css
background: #fff3cd;
color: #f5a623;
border-left: 4px solid #f5a623;
```

## Spacing System

### Padding
- Tight: 8px
- Small: 12px
- Medium: 15px
- Large: 20px
- XLarge: 25px
- XXLarge: 30px
- Huge: 35px
- Massive: 40px

### Gaps
- Small: 10px
- Medium: 15px
- Large: 20px
- XLarge: 25px
- Huge: 30px

### Margins
- Headers: 0 0 bottom-size 0
- Paragraphs: 0
- Sections: bottom-margin for spacing

---

## Implementation Tips

1. **Use consistent spacing** - Refer to spacing system
2. **Match colors** - Use palette hex values
3. **Apply transitions** - Add 0.3s ease to interactive elements
4. **Test responsiveness** - Check all breakpoints
5. **Verify accessibility** - Check color contrast and keyboard nav
6. **Animate on hover** - Use transform, not position changes
7. **Show loading states** - Always provide feedback during async operations
8. **Validate forms** - Real-time error messages
9. **Use gradients** - Enhance visual appeal
10. **Maintain hierarchy** - Clear visual distinction between sections

---

**Last Updated:** February 2026  
**Component Version:** 1.0.0
