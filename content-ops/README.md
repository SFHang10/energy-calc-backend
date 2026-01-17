# Content Operations Workflow

This folder is the source-of-truth workspace for content before it is published.

## Folder Purpose

- `drafts/`  : raw notes, rough content, research, early HTML drafts
- `review/`  : content under review (fact check, formatting, image checks)
- `ready/`   : approved content ready to publish
- `assets/`  : local images, diagrams, source files
- `manifests/`: mapping files for Wix uploads and publish tracking

## Publish Flow (Short)

1. Create content in `drafts/`
2. Move to `review/` and complete the checklist
3. Move to `ready/`
4. Publish:
   - Add/Update `wix-integration/member-content/content-catalog.json`
   - Upload images to Wix and update `manifests/wix-media-manifest.json`
   - Push to GitHub (Render deploys)

## Publish Checklist Script

Run before publishing:
```
node scripts/publish-checklist.js
```

## Publish Checklist (Quick)

- Content accuracy verified
- Images uploaded to Wix (static URLs recorded)
- URLs and tags set in content catalog
- Previewed in Wix or via Render link
