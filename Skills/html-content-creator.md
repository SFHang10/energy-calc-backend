# HTML Content Creator Skill

## Purpose
Create professional, interactive HTML pages for Wix sites using uploaded Wix static media images.

---

## 🔄 The Wix Image Process

### IMPORTANT: Wix Static Media Workflow

Images **cannot** be directly embedded from local files in Wix. They must be:

1. **Uploaded to Wix Media Manager** first
2. **Copied the Wix static URL** (format: `https://static.wixstatic.com/media/...`)
3. **Provided to Cursor** with numbering/descriptions
4. **Integrated into HTML** using the static URLs

### Wix Static URL Format
```
https://static.wixstatic.com/media/[account-id]_[file-hash]~mv2.[extension]

Example:
https://static.wixstatic.com/media/c123de_75b38bf573be48fd9ce5a3432acaec88~mv2.png
```

### Supported Extensions
- `.png` - Best for diagrams, graphics with transparency
- `.jpg` / `.jpeg` - Best for photos
- `.gif` - For animations
- `.webp` - Modern format, good compression

---

## 📋 Step-by-Step Process

### Step 1: Prepare Source Content
- Gather Word documents, PDFs, or notes with content
- Identify key sections, data, and information structure
- Note where images should be placed

### Step 2: Upload Images to Wix
1. Go to Wix Dashboard → Media Manager
2. Upload all images needed for the HTML
3. Number them logically (1, 2, 3... or by section)
4. Copy each image's static URL

### Step 3: Provide Image Links to Cursor
Format the images clearly:
```
Image 1 (Overview diagram): https://static.wixstatic.com/media/...
Image 2 (Product photo): https://static.wixstatic.com/media/...
Image 3 (Chart): https://static.wixstatic.com/media/...
```

### Step 4: Request HTML Creation
Provide:
- Source document path or content
- All Wix image URLs with descriptions
- Design preferences (tabs, cards, modern, etc.)
- Any special features needed (animations, galleries, tables)

### Step 5: Review & Refine
- Check all images display correctly
- Verify content accuracy
- Request styling adjustments if needed

---

## 🎨 HTML Design Options

### Layout Types
| Type | Best For | Features |
|------|----------|----------|
| **Tabbed** | Long content with sections | Sticky navigation, clean organization |
| **Single Page** | Short/medium content | Smooth scrolling, one-page overview |
| **Cards Grid** | Product showcases | Visual browsing, hover effects |
| **Timeline** | Historical/process content | Step-by-step progression |
| **Dashboard** | Data-heavy content | Charts, stats, metrics |

### Standard Features Available
- ✅ Responsive design (mobile-friendly)
- ✅ Animated counters for statistics
- ✅ Image galleries with lightbox/modal
- ✅ Comparison tables (before/after)
- ✅ Sticky navigation
- ✅ Call-to-action sections
- ✅ Hover effects and transitions
- ✅ Dark/light themes

### Professional Styling Elements
- Gold/black professional theme
- Modern gradient backgrounds
- Card-based layouts with shadows
- Typography with Google Fonts
- Animated elements on scroll
- Icon badges and highlights

---

## 📝 Example Request Format

```
I need an HTML page for [topic].

Source content: [path to Word doc or description]

Wix Images (uploaded and numbered):
1. https://static.wixstatic.com/media/... (Main banner)
2. https://static.wixstatic.com/media/... (Product diagram)
3. https://static.wixstatic.com/media/... (Comparison chart)
4. https://static.wixstatic.com/media/... (Installation photo)

Design: Tabbed layout with professional dark theme
Features needed: Stats grid, comparison tables, image gallery
```

---

## 🗂️ File Organization

### Recommended Structure
```
HTMLs/
├── [Topic]-Tabbed.html      # Multi-section pages
├── [Topic]-Single.html      # Single-page layouts
├── [Topic].html             # Original/source versions
└── [Source documents].docx  # Reference materials
```

### Naming Convention
- Use descriptive names: `Retrofit-Tabbed.html`
- Keep originals: `Retrofit.html` (original), `Retrofit-Tabbed.html` (enhanced)
- Date versions if needed: `Retrofit-v2-2026.html`

---

## 🔗 Embedding in Wix

### iFrame Embed Method
```html
<iframe 
    src="https://your-render-site.onrender.com/HTMLs/Retrofit-Tabbed.html"
    width="100%"
    height="800px"
    frameborder="0"
    style="border: none;"
></iframe>
```

### Wix HTML Element
1. Add HTML iFrame element to Wix page
2. Set source to Render-hosted URL
3. Adjust height to fit content
4. Enable scrolling if needed

---

## ⚡ Quick Reference

### Request Checklist
- [ ] Source content provided (doc path or text)
- [ ] All images uploaded to Wix
- [ ] Image URLs listed with numbers/descriptions
- [ ] Layout preference specified
- [ ] Theme/color preference noted
- [ ] Special features requested

### Common Image Placements
| Section | Image Type | Purpose |
|---------|-----------|---------|
| Header | Hero/banner | Visual impact |
| Overview | Diagram/infographic | Explain concept |
| Products | Product photos | Show items |
| Process | Step illustrations | How it works |
| Data | Charts/graphs | Visualize stats |
| Gallery | Multiple images | Detail views |
| CTA | Background | Atmosphere |

---

## 📊 Image Mapping Example (Retrofit Project)

```
Image 1  → Overview section (main diagram)
Image 2  → Overview gallery (industrial example)
Image 3  → Overview gallery (commercial example)
Image 4  → Economiser tab (system diagram)
Image 5  → Economiser tab (animation)
Image 6  → Economiser tab (installation photo)
Image 7  → Burner Control tab (system diagram)
Image 8  → Burner Control tab (panel photo)
Image 10 → Burner Control tab (optimization)
Image 11 → HVAC tab (animation diagram)
Image 12 → HVAC tab (control system)
Image 13 → HVAC tab (installation)
Image 14 → Refrigeration tab (cabinet diagram)
Image 15 → Refrigeration tab (retrofitted cabinet)
Image 16 → Refrigeration tab (savings animation)
Image 17 → LED tab (before/after)
Image 18 → LED tab (installation)
Image 19 → LED tab (comparison)
```

---

## 🚀 Weekly Workflow

1. **Monday**: Gather new content/images for the week
2. **Upload**: Batch upload images to Wix Media Manager
3. **Document**: Create numbered list of image URLs
4. **Request**: Send content + image list to Cursor
5. **Review**: Check generated HTML, request adjustments
6. **Deploy**: Push to GitHub → Render auto-deploys
7. **Embed**: Update Wix pages with new content links

---

*Last Updated: January 2026*
