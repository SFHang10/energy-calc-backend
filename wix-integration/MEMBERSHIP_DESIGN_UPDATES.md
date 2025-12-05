# Membership Section Design Updates

**Date:** November 17, 2025  
**Status:** ✅ Complete

---

## 🎯 Overview

Major redesign of the membership section to incorporate a widget-style three-tier selection system with dynamic backdrop switching, inspired by the energy-audit-widget design.

---

## 📋 Changes Made

### 1. Three-Tier Membership Selection System

**Location:** `wix-integration/members-section.html`

#### New Features:
- **Three-tier card selection** matching the widget design style
- **Image previews** in each tier card showing the backdrop image
- **Dynamic backdrop switching** - clicking a tier changes the full-page backdrop
- **Smooth transitions** between backdrop images

#### Tier Structure:
1. **Free Membership** (€0)
   - Image: `Renewable.jpeg`
   - Backend tier ID: `basic`

2. **Green Membership** (€20/month)
   - Image: `product-placement/renewable-energy-light-bulb-with-green-energy-efficiency_956920-97376.avif`
   - Backend tier ID: `premium`

3. **Green Partner** (€80/month)
   - Image: `product-placement/3d-glowing-green-energy-core-symbolizing-renewable-energy-sources_1093726-30448_edited.jpg`
   - Backend tier ID: `professional`

#### Technical Implementation:

**CSS Changes:**
- Added `.tier-selection-grid` for three-column card layout
- Added `.tier-selection-card` with hover effects and selection states
- Added `.tier-image-preview` for image previews in cards
- Added dynamic backdrop switching via body classes:
  - `body.tier-free::after` - Free tier backdrop
  - `body.tier-green::after` - Green Membership backdrop
  - `body.tier-partner::after` - Green Partner backdrop

**JavaScript Functions:**
- `selectTierCard(tierType)` - Handles card selection and backdrop switching
- Updated `selectTier(tierId)` - Maps tier IDs to backdrop types and triggers backdrop change

**HTML Structure:**
- Replaced dynamic tier loading with static three-card selection
- Each card includes:
  - Image preview
  - Tier name and price
  - Description
  - Selection button

---

### 2. Preferences Page Backdrop

**Location:** `wix-integration/member-preferences.html`

#### Changes:
- Added backdrop image: `images/Energy Analytics .jpeg`
- Full-screen backdrop with `background-size: cover`
- Image zoomed out to 120% to show more of the picture
- Dark overlay added for depth (`rgba(0, 0, 0, 0.2)`)
- Image opacity set to 0.7

#### Card Transparency:
- Preferences card background: `rgba(211, 211, 211, 0.85)` with backdrop blur
- Header background: Semi-transparent with backdrop blur
- Allows backdrop image to show through while maintaining readability

---

## 🖼️ Images Used

### Membership Section:
1. **Free Tier:**
   - Path: `../Renewable.jpeg`
   - Style: Tiled background

2. **Green Membership:**
   - Path: `../product-placement/renewable-energy-light-bulb-with-green-energy-efficiency_956920-97376.avif`
   - Style: Tiled background

3. **Green Partner:**
   - Path: `../product-placement/3d-glowing-green-energy-core-symbolizing-renewable-energy-sources_1093726-30448_edited.jpg`
   - Style: Tiled background

### Preferences Page:
- **Backdrop Image:**
  - Path: `images/Energy Analytics .jpeg`
  - Style: Full-screen cover (120% zoom)
  - Opacity: 0.7
  - Dark overlay: `rgba(0, 0, 0, 0.2)`

---

## 🎨 Design Specifications

### Backdrop Settings:
- **Membership Section:**
  - Size: `auto` (tiled)
  - Position: `top left`
  - Repeat: `repeat`
  - Opacity: `0.45`

- **Preferences Page:**
  - Size: `120%` (zoomed out)
  - Position: `center`
  - Repeat: `no-repeat`
  - Opacity: `0.7`
  - Dark overlay: `rgba(0, 0, 0, 0.2)`

### Card Styling:
- **Tier Selection Cards:**
  - Background: Gradient with backdrop blur
  - Border: `rgba(34, 197, 94, 0.3)`
  - Hover: Scale and shadow effects
  - Selected: Enhanced border and glow

- **Preferences Card:**
  - Background: `rgba(211, 211, 211, 0.85)`
  - Backdrop filter: `blur(10px)`
  - Allows backdrop image to show through

---

## 🔧 Technical Details

### Backdrop Switching Mechanism:
1. User clicks tier card
2. `selectTierCard()` function called
3. Body class updated (`tier-free`, `tier-green`, or `tier-partner`)
4. CSS `::after` pseudo-element background-image changes
5. Smooth transition via CSS `transition: background-image 0.8s ease-in-out`

### Integration:
- Works seamlessly with existing registration flow
- Maintains all current functionality
- No breaking changes to API calls
- Static tier cards replace dynamic API loading

---

## ✅ Testing Checklist

- [x] Three-tier cards display correctly
- [x] Image previews show in each card
- [x] Backdrop switches on tier selection
- [x] Smooth transitions between backdrops
- [x] Registration flow works with tier selection
- [x] Preferences page backdrop displays correctly
- [x] Card transparency allows backdrop visibility
- [x] All images load correctly
- [x] Responsive design maintained

---

## 📝 Notes

- **Removed:** Dynamic tier loading from API (now using static cards)
- **Added:** Widget-style card selection system
- **Updated:** Backdrop system to support multiple images
- **Enhanced:** Visual feedback with hover and selection states

---

## 🔄 Rollback Instructions

If needed to rollback:

1. **Membership Section:**
   - Restore `loadSubscriptionTiers()` call in `initializePage()`
   - Remove tier selection cards HTML
   - Remove backdrop switching CSS and JavaScript

2. **Preferences Page:**
   - Remove `body::after` and `body::before` CSS
   - Restore original card backgrounds
   - Remove backdrop-related styles

---

## 🚀 Future Enhancements

Potential improvements:
- Add more tier options if needed
- Implement tier-specific content filtering
- Add tier upgrade/downgrade functionality
- Enhance mobile responsiveness
- Add animation effects for tier selection

---

**Last Updated:** November 17, 2025  
**Status:** Production Ready ✅










