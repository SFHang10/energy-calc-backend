# Member Content Images

## Folder Structure

Place images for member content pages in this folder structure:

```
images/
└── member-content/
    ├── energy-efficiency-basics/
    │   ├── efficient-building-1.jpg
    │   ├── smart-thermostat.jpg
    │   ├── led-lighting.jpg
    │   ├── led-retrofit.jpg
    │   ├── smart-lighting-controls.jpg
    │   ├── hvac-system.jpg
    │   └── thermostat-control.jpg
    ├── advanced-energy-analysis/
    │   └── (images for this page)
    ├── green-building-materials/
    │   └── (images for this page)
    ├── led-lighting-solutions/
    │   └── (images for this page)
    └── hvac-optimization/
        └── (images for this page)
```

## Image Requirements

- **Format:** JPG, PNG, or WebP
- **Recommended Size:** 1200px width minimum
- **File Size:** Keep under 500KB per image for fast loading
- **Naming:** Use descriptive, lowercase names with hyphens (e.g., `led-retrofit-installation.jpg`)

## How to Add Images

1. Create the folder for your content page (e.g., `energy-efficiency-basics/`)
2. Add your images to that folder
3. Update the HTML file to reference the images:
   ```html
   <img src="../images/member-content/energy-efficiency-basics/your-image.jpg" alt="Description">
   ```

## Image Paths

Images are referenced relative to the HTML file location:
- HTML file: `wix-integration/member-content/energy-efficiency-basics.html`
- Image path: `../images/member-content/energy-efficiency-basics/image.jpg`
- The `../` goes up one level from `member-content/` to `wix-integration/`, then into `images/`

## Server Configuration

The server will automatically serve images from this folder through the static file middleware.








