# Wix Media Manager Permission Troubleshooting

## Current Status
- ✅ Permission "Read Media Manager" is **added** in Developer Console
- ❌ Permission is **NOT granted** to installed app instance
- ❌ API calls return 403 Forbidden

## The Problem
The installed app instance only shows:
```
["SCOPE.DEV_CENTER.APP-INSTANCE-READ-BASIC-INFO"]
```

But it should also have:
```
["SCOPE.DC-MEDIA.READ-MEDIAMANAGER"]
```

## Possible Solutions

### Solution 1: Check Permission Scope Name
The permission in Developer Console might be named differently than what the API expects.

**Check in Developer Console:**
1. Go to: `https://manage.wix.com/apps/0933a02d-5312-42a8-9e67-28dfcf2aedde/dev-center-permissions`
2. Look at the "Read Media Manager" permission
3. Check the exact scope name - it should show something like `SCOPE.DC-MEDIA.READ-MEDIAMANAGER`

### Solution 2: Uninstall and Reinstall
Sometimes permissions need a fresh installation:

1. In Wix Studio → "Manage Apps" → "Greenways Market Place" → "Delete app"
2. Then reinstall via API or "Test App"
3. This should trigger permission approval

### Solution 3: Use Fallback Videos (Temporary)
The system already has fallback videos, so it will work even without Wix API access. We can:
- Use fallback videos for now
- Fix permissions later
- System will automatically switch to Wix videos once permissions work

### Solution 4: Check if Permission Needs Approval
Some permissions require explicit approval. Check:
- Wix Studio → "Manage Apps" → "Greenways Market Place"
- Look for any approval prompts or notifications

## Next Steps
1. Check the exact permission scope name in Developer Console
2. Try uninstalling and reinstalling the app
3. Or proceed with fallback videos for now

