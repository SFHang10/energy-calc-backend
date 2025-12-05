# Wix Video Integration - Production Setup Guide

## Overview
The video system is now production-ready with automatic fallback. It will:
1. Try to fetch videos from your Greenways Buildings Wix site
2. Cache videos for 30 minutes to reduce API calls
3. Fall back to sample videos if Wix API is unavailable
4. Filter videos based on user interests/preferences

## Quick Start (Production Ready)

The system works **immediately** without any configuration - it will use fallback videos.

To enable Wix video fetching:

### Step 1: Get Wix App Token

1. Go to [Wix Developers](https://dev.wix.com/)
2. Create or select your app
3. Go to **Settings** → **OAuth** → **App Token**
4. Copy your App Token

### Step 2: Configure Environment Variables

Create or update your `.env` file in the project root:

```env
# Wix API Configuration
WIX_APP_TOKEN=your_app_token_here
WIX_SITE_ID=d9c9c6b1-f79a-49a3-8183-4c5a8e24a413
```

**Note:** `WIX_SITE_ID` is optional - it defaults to Greenways Buildings site ID.

### Step 3: Restart Server

```bash
node server-new.js
```

That's it! The system will now:
- ✅ Fetch videos from Wix automatically
- ✅ Cache them for 30 minutes
- ✅ Filter by user interests
- ✅ Fall back gracefully if Wix API fails

## How It Works

### Video Fetching Flow

```
User Request → Check Cache → Fetch from Wix → Filter by Interests → Return Videos
                      ↓ (if expired)              ↓ (if fails)
                  Use Cache                    Use Fallback Videos
```

### Caching Strategy

- **Cache Duration:** 30 minutes
- **Cache Type:** In-memory (for production, consider Redis)
- **Cache Invalidation:** Automatic after TTL

### Interest-Based Filtering

Videos are automatically filtered based on user interests:
- **Energy Saving Products** → `energy` category videos
- **Water Saving Products** → `water` category videos
- **Solar Products** → `solar` category videos
- **HVAC Systems** → `hvac` category videos
- **LED Lighting** → `lighting` category videos

## Video Format

Videos from Wix are automatically transformed to match the frontend format:

```javascript
{
  id: "wix-file-id",
  title: "Video Title",
  description: "Video description",
  thumbnail: "thumbnail-url",
  videoUrl: "direct-video-url",  // For Wix videos
  videoId: "wix-file-id",        // For Wix videos
  duration: "5:30",
  category: "energy",            // Auto-detected from labels
  tags: ["tag1", "tag2"],
  source: "wix"                  // or "fallback"
}
```

## Frontend Compatibility

The frontend automatically handles both:
- **YouTube videos** (using `videoId` with YouTube embed)
- **Wix videos** (using `videoUrl` for direct playback)

## Production Considerations

### Performance
- ✅ Videos are cached for 30 minutes
- ✅ API calls only when cache expires
- ✅ Graceful fallback prevents errors

### Scalability
For high-traffic production:
1. **Use Redis** for distributed caching
2. **Add rate limiting** to prevent API abuse
3. **Consider CDN** for video delivery

### Monitoring
Check server logs for:
- `✅ Fetched X videos from Wix` - Success
- `⚠️ WIX_APP_TOKEN not configured` - Using fallback
- `❌ Error fetching videos from Wix` - API error (fallback active)

## Troubleshooting

### Videos not loading from Wix?

1. **Check environment variables:**
   ```bash
   echo $WIX_APP_TOKEN  # Should show your token
   ```

2. **Check server logs:**
   - Look for `⚠️` or `❌` messages
   - Verify API token is valid

3. **Test API directly:**
   ```bash
   curl -X POST https://www.wixapis.com/site-media/v1/files/search \
     -H "Authorization: YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"mediaTypes":["VIDEO"]}'
   ```

### Videos showing but not playing?

- Wix videos use direct URLs, not YouTube embeds
- Check browser console for CORS errors
- Verify video URLs are accessible

## Next Steps

1. ✅ System is production-ready **now** (uses fallback)
2. ⏳ Add Wix credentials to enable real video fetching
3. ⏳ Test with your actual Wix videos
4. ⏳ Consider Redis caching for high traffic

## Support

The system is designed to **never fail** - it will always show videos (either from Wix or fallback), ensuring a smooth user experience.

