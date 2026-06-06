# Sustainability News Finder Skill - Usage Guide

## Overview

The **Sustainability News Finder** skill enables Claude to generate comprehensive, professionally formatted monthly sustainability news reports in HTML blog format. The skill covers European sustainability developments, circular economy initiatives, policy updates, funding programs, and organizational success stories.

## What This Skill Does

When you upload this skill to Claude, it will:

1. **Research Current Sustainability News**: Use web search to find the latest developments in:
   - EU sustainability regulations and policies
   - Circular economy initiatives
   - Funding programs (Horizon Europe, LIFE, etc.)
   - Sustainable technology innovations
   - Country-specific developments (Netherlands, UK, Spain, Portugal, and others)
   - Organizational achievements

2. **Generate Professional HTML Reports**: Create visually engaging, fully formatted news roundups with:
   - Clean, modern design with sustainability-themed colors
   - Responsive layout (mobile-friendly)
   - Interactive navigation
   - Data visualizations and statistics
   - Organization spotlights with metrics
   - Timeline graphics for policy updates
   - Print-friendly formatting

3. **Follow Best Practices**: Ensure:
   - Copyright compliance (proper paraphrasing and attribution)
   - Accessibility (screen reader compatible, high contrast)
   - Accurate information from authoritative sources
   - Professional writing style
   - Comprehensive coverage of key topics

## How to Use This Skill

### Installation

1. Upload the `sustainability-news-finder.skill` file to Claude
2. The skill will be available for use immediately

### Example Requests

Here are some ways you can use the skill:

**Monthly News Roundup:**
```
"Can you create the January 2026 sustainability news roundup?"
```

**Topic-Specific Reports:**
```
"Generate a report on circular economy developments in Europe for December 2025"
```

**Country-Focused Updates:**
```
"Create a sustainability news update focusing on the Netherlands and UK"
```

**Funding Opportunities:**
```
"Make a report highlighting new EU funding opportunities for circular economy projects"
```

**Organization Features:**
```
"Create a news blog featuring companies doing innovative circular economy work"
```

### What You'll Get

When you request a sustainability news report, Claude will:

1. **Research** the latest information using web search
2. **Verify** facts from authoritative sources (EU Commission, CORDIS, national agencies)
3. **Generate** a complete HTML file with:
   - Professional design and layout
   - All content embedded (no external dependencies)
   - Proper citations and links
   - Visual elements and data displays
   - Organization spotlights
4. **Provide** the file ready to:
   - Open in any web browser
   - Share via email
   - Upload to websites
   - Convert to PDF
   - Archive for reference

## Content Coverage

The skill automatically covers these key areas:

### 1. Policy & Regulation
- New EU directives (CSRD, ESPR, CBAM, etc.)
- National sustainability laws
- Implementation timelines
- Compliance requirements

### 2. Funding Programs
- Horizon Europe calls and awards
- LIFE Programme projects
- Cohesion Policy investments
- National funding schemes

### 3. Circular Economy
- Business model innovations
- Recycling technologies
- Material recovery
- Product lifecycle initiatives

### 4. Sustainable Technology
- Low-energy electronics
- Energy-efficient products
- Retrofit solutions (ETL-listed)
- Green innovations

### 5. Country Highlights
- Netherlands: Digital product passports, high-tech circularity
- UK: ETL schemes, retrofit programs
- Spain: España Circular 2030 initiatives
- Portugal: Circular business models
- Other EU countries as relevant

### 6. Organization Spotlights
- Company profiles
- Measurable achievements
- Impact metrics
- Success stories

## Features

### Professional Design
- Sustainability-themed color palette (greens, blues, earth tones)
- Clear visual hierarchy
- Responsive layout for all devices
- Print-optimized styles

### Rich Content
- Executive summaries
- Top story highlights
- Statistical dashboards
- Timeline graphics
- Data visualizations
- Quote callouts
- Organization features with metrics

### Accessibility
- High contrast text
- Screen reader compatible
- Keyboard navigation
- Alt text for images
- Proper heading structure

### Documentation
- Authoritative source citations
- Links to official documents
- Proper attribution
- Publication dates

## Customization Options

You can customize the reports by:

**Specifying Time Periods:**
```
"Create the Q4 2025 sustainability roundup"
"Generate December 2025 news"
```

**Focusing on Topics:**
```
"Focus on renewable energy and low-carbon technology"
"Emphasize circular economy and waste reduction"
```

**Highlighting Regions:**
```
"Include extra coverage of Scandinavian countries"
"Focus on Western Europe"
```

**Featuring Organizations:**
```
"Include a spotlight on [Company Name]"
"Feature 3 organizations doing innovative circular economy work"
```

**Adjusting Length:**
```
"Create a brief summary (top 5 stories)"
"Generate a comprehensive deep-dive report"
```

## Technical Details

### Output Format
- **File Type**: HTML (single file)
- **Styling**: Embedded CSS (no external dependencies)
- **Fonts**: Google Fonts CDN links included
- **Images**: Can be embedded as base64 or linked
- **File Size**: Typically 50-200 KB depending on content

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

### Sources Used
The skill draws from:
- European Commission official sites
- CORDIS (EU research database)
- CINEA (climate & energy agency)
- National government websites
- Industry publications
- Think tanks and research institutes

## Best Practices for Using the Skill

1. **Be Specific About Time Periods**: Mention the month/year or quarter for targeted results

2. **Request Updates for Emerging Topics**: The skill can cover new developments as they happen

3. **Combine with Uploaded Documents**: Upload your own research or data files for Claude to incorporate

4. **Iterate on the Output**: Request adjustments to focus, length, or specific sections

5. **Use for Regular Updates**: Request monthly reports to track sustainability trends over time

## Example Use Cases

### 1. Corporate Sustainability Teams
Monthly reports for stakeholders showing industry developments and regulatory changes

### 2. Policy Researchers
Tracking EU sustainability legislation and funding programs

### 3. Greentech Startups
Monitoring funding opportunities and market developments

### 4. NGOs and Advocacy Groups
Documenting circular economy progress and policy impacts

### 5. Media and Journalists
Background research for sustainability coverage

### 6. Educational Institutions
Teaching materials on current sustainability initiatives

## Troubleshooting

**If the report seems outdated:**
- Request "latest news" or specify "January 2026"
- Claude will use web search to find current information

**If specific countries are missing:**
- Explicitly request coverage: "Include Germany and France"

**If you need more detail on a topic:**
- Ask for expansion: "Can you add more detail on the CBAM implementation?"

**If the HTML doesn't display correctly:**
- Ensure you're opening the file in a modern browser
- Check that JavaScript is enabled (though the basic template doesn't require it)

## Future Enhancements

This skill can be extended to:
- Generate PDF versions automatically
- Create chart/graph visualizations from data
- Email newsletter formats
- Social media summary posts
- Integration with content management systems

## Support and Feedback

To improve this skill:
- Share examples of reports you'd like to see
- Provide feedback on coverage areas
- Suggest additional data sources
- Report any issues with formatting or content

## File Structure

The packaged skill includes:

```
sustainability-news-finder.skill
├── SKILL.md                          # Main skill instructions
├── assets/
│   └── news-template.html           # HTML template
└── references/
    ├── visual-guidelines.md         # Design specifications
    ├── styling-guide.md             # CSS framework
    └── data-sources.md              # Authoritative sources
```

## Getting Started

**Quick Start:**
1. Upload the skill to Claude
2. Simply say: "Create this month's sustainability news roundup"
3. Claude will research and generate your report
4. Download the HTML file and open it in your browser

That's it! The skill handles everything else automatically.

---

**Created for**: Greenways Market and sustainability professionals
**Version**: 1.0
**Last Updated**: January 2026
**Skill Type**: News Generation & Research
