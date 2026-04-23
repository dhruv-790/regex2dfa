# Responsive Design Documentation - DFA Studio

## Overview
DFA Studio is now fully responsive, supporting devices from small mobile phones (320px) to large desktop displays (2560px+). The design uses a **mobile-first approach** with Tailwind CSS breakpoints and custom media queries.

## Responsive Features

### 1. **Mobile-First Layout**
- **Below 768px (Mobile/Tablet Portrait)**: Vertical stacking layout
  - DFA Editor accessible via sidebar drawer menu
  - Full-width graph visualization
  - Bottom-positioned simulator overlay

- **768px and above (Tablet/Desktop)**: Horizontal layout
  - DFA Editor sidebar visible on the left
  - Graph takes up remaining space
  - All controls fully visible

### 2. **Typography Scaling**
```tailwind
Mobile:  text-xs  (12px)
Tablet:  text-sm  (14px)
Desktop: text-base (16px) - text-lg (18px)

Headers scale proportionally:
h1: text-lg → text-2xl → text-3xl
h2: text-base → text-xl → text-2xl
h3: text-sm → text-lg → text-xl
```

### 3. **Touch-Friendly Controls**
All interactive elements meet the 44px minimum touch target size:
- Buttons: `min-h-11 sm:h-8 md:h-10` = 44px on mobile, 40px on desktop
- Icon buttons: `min-h-11 min-w-11` = 44x44px on mobile
- Spacing optimized for fat finger interactions

### 4. **Responsive Containers**
- **Mobile (< 640px)**: 
  - `p-2 md:p-4` padding (8px → 16px)
  - `gap-2 md:gap-4` gaps (8px → 16px)
  - Compressed layouts

- **Tablet (640px - 1024px)**:
  - `md:p-4 lg:p-6` padding (16px → 24px)
  - `md:gap-4 lg:gap-6` gaps (16px → 24px)

- **Desktop (1024px+)**:
  - Standard padding and spacing
  - Full horizontal layout

### 5. **Responsive Components**

#### DFA Editor (Sidebar)
- **Mobile**: Hidden by default, accessible via menu drawer
- **Desktop**: Always visible on the left side (384px wide)
- **Drawer**: Full-screen sheet on mobile (300-400px width on tablet)

#### DFA Graph
- **Mobile**: Full available width, pinch-to-zoom enabled
- **Zoom limits**: 0.5x to 2x (prevents over/under zooming on small screens)
- **Controls**: Touch-optimized button sizing
- **MiniMap**: Hidden on screens below 768px to save space

#### Simulator Overlay
- **Mobile**: Bottom-positioned with compact spacing
- **Controls**: 
  - Icon buttons with abbreviated labels ("ACC"/"REJ" instead of "ACCEPTED"/"REJECTED")
  - 44px minimum touch targets
  - Stacked on mobile, inline on desktop
- **Info display**:
  - String Progress: Always visible
  - State Path: Hidden on mobile, shown on tablet+

#### AutomatonNode (Graph Nodes)
- **Mobile**: `w-14 h-14` (56px)
- **Tablet**: `sm:w-16 sm:h-16` (64px)
- **Desktop**: `md:w-16 md:h-16` (64px)
- **Arrow styling**: Scales proportionally with node size

### 6. **Media Query Breakpoints**

| Breakpoint | Size | Use Case | Tailwind Class |
|-----------|------|----------|-----------------|
| xs | < 640px | Mobile phones | (default) |
| sm | 640px | Landscape phones | `sm:` |
| md | 768px | Tablets | `md:` |
| lg | 1024px | Large tablets/small desktops | `lg:` |
| xl | 1280px | Desktops | `xl:` |
| 2xl | 1536px | Large desktops | `2xl:` |

### 7. **Custom Hooks**

#### `useResponsive()`
Located in `/src/hooks/use-responsive.tsx`

Provides real-time responsiveness information:
```typescript
const responsive = useResponsive();

// Returns:
{
  isMobile: boolean,          // < 768px
  isTablet: boolean,          // 768px - 1024px
  isDesktop: boolean,         // >= 1024px
  breakpoint: 'xs'|'sm'|'md'|'lg'|'xl'|'2xl',
  screenWidth: number,
  screenHeight: number,
  isPortrait: boolean,        // height >= width
  isLandscape: boolean        // width > height
}
```

### 8. **Accessibility & Performance**

#### Touch Optimization
- 44px minimum touch targets (iOS guideline)
- 48px recommended spacing between targets
- Implemented via `touch-friendly` utility class

#### Input Handling
- Font-size: 16px minimum (prevents iOS auto-zoom on focus)
- Clear visual feedback on interaction
- Proper label associations

#### Motion & Animations
- Respects `prefers-reduced-motion` (CSS media query)
- Smooth scroll behavior on supported devices
- Animations disabled on low-end devices

#### Viewport Meta Tags
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
<meta name="theme-color" content="#1f2e21" />
<meta name="mobile-web-app-capable" content="yes" />
```

### 9. **Responsive Images & SVG**
- All SVG node graphics scale with container size
- Edge paths (transitions) scale proportionally
- Graph canvas fills available viewport

### 10. **Performance Considerations**

**Mobile Optimization**:
- MiniMap hidden on screens < 768px (saves CPU)
- Reduced animation complexity on mobile
- Optimized font loading (Latin + numbers only)
- Lazy-loaded components via dynamic imports

**Desktop Optimization**:
- Full feature set enabled
- No element hiding
- Smooth animations enabled
- All controls visible

## Testing Responsive Design

### Device Sizes to Test
```
Mobile:
- iPhone SE: 375x667
- iPhone 12: 390x844
- Pixel 5: 393x851
- Samsung S21: 360x800

Tablet:
- iPad Mini: 768x1024
- iPad Air: 820x1180
- Samsung Tab S7: 800x1280

Desktop:
- 1366x768 (Common)
- 1920x1080 (FHD)
- 2560x1440 (2K)
- 3840x2160 (4K)
```

### Browser Tools
1. Chrome DevTools → Responsive Design Mode (Ctrl+Shift+M)
2. Firefox Responsive Design Mode (Ctrl+Shift+M)
3. Safari Responsive Design Tools

### Real Device Testing
- Test on actual devices when possible
- Check touch interaction (not just mouse clicks)
- Verify orientation changes
- Test with different text zoom levels

## Common Issues & Solutions

### Issue: Text too small on mobile
**Solution**: Ensure base font-size is set to 16px on mobile inputs and text elements

### Issue: Buttons hard to tap on mobile
**Solution**: Use touch-friendly class and set min-h-11 min-w-11 for icon buttons

### Issue: Layout breaks on tablet landscape
**Solution**: Use orientation media queries and adjust spacing for landscape

### Issue: Graph crowded on mobile
**Solution**: Reduce zoom limits (0.5x-2x) and hide MiniMap (hidden md:block)

### Issue: Drawer doesn't close after selection
**Solution**: Ensure setIsEditorDrawerOpen is called after state changes

## CSS Utilities Added

### New Tailwind Utilities
```css
.touch-friendly        /* 44px x 44px minimum */
.responsive-container  /* Centered with responsive padding */
.no-scrollbar         /* Hide scrollbars but keep scrolling */
.mobile-button        /* Mobile-optimized button styling */
.prevent-layout-shift /* Stable scrollbar gutter */
```

### Responsive Spacing
```tailwind
/* Adaptive spacing for different screen sizes */
.p-4              → p-2.5 sm:p-4 (on <480px screens)
.gap-4            → gap-2.5 sm:gap-4 (on <480px screens)
.space-y-4        → space-y-2.5 sm:space-y-4 (on <480px screens)
```

## Future Improvements

1. **Landscape Mobile Optimization**: Further reduce height on landscape phones
2. **Foldable Device Support**: Handle fold detection and adjust layout
3. **Haptic Feedback**: Add haptic feedback on button presses (iOS/Android)
4. **High Contrast Mode**: Better support for prefers-contrast CSS media query
5. **Smaller Device Support**: Optimize for 320px width screens
6. **Progressive Web App (PWA)**: Add installation capabilities

## Files Modified

- `/src/app/globals.css` - Enhanced with mobile-first styles and media queries
- `/src/app/layout.tsx` - Added viewport meta tags and PWA support
- `/src/app/page.tsx` - Integrated useResponsive hook and mobile drawer
- `/src/components/dfa/DfaEditor.tsx` - Touch-friendly button sizing
- `/src/components/dfa/DfaGraph.tsx` - Responsive zoom and control sizing
- `/src/components/dfa/AutomatonNode.tsx` - Proportional node sizing
- `/src/components/dfa/SimulatorOverlay.tsx` - Responsive control layout
- `/src/hooks/use-responsive.tsx` - NEW: Responsive design hook
- `/src/app/responsive-guide.css` - NEW: Media query reference guide

## References

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Apple HIG: Touch](https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/adaptivity-and-layout/)
- [Material Design: Responsive Layout Grid](https://material.io/design/layout/understanding-layout.html)
