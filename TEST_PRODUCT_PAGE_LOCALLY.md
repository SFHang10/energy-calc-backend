# Testing Product Page Locally

## Quick Test Instructions

### Step 1: Start the Server Locally

Open a terminal in `C:\Users\steph\Documents\energy-cal-backend` and run:

```bash
node server-new.js
```

Or if you have npm scripts:
```bash
npm start
```

The server should start on port 4000 (or whatever PORT is set).

### Step 2: Test the Product Page

Once the server is running, open your browser and go to:

```
http://localhost:4000/product-page-v2.html?product=sample_3
```

This should:
- ✅ Load the product page (no 404 error)
- ✅ Display the Bosch Dishwasher product
- ✅ Show the "← Back" button in the breadcrumb
- ✅ Allow you to click back to return

### Step 3: Test from Audit Widget

1. Open the audit widget:
   ```
   http://localhost:4000/energy-audit-widget-v3-embedded-test.html
   ```

2. Select a product and click "🛒 View in Shop"

3. It should navigate to the product page on the same page (not new tab)

4. Click the "← Back" button to return

---

## Alternative: Test Without Server

If you just want to see if the HTML file works, you can:

1. Open `product-page-v2.html` directly in your browser (file://)
2. But it won't be able to fetch product data from the API
3. You'll see "Loading product..." but it won't load

**So you need the server running for full functionality.**

---

## What Changed

I added an explicit route in `server-new.js` for `product-page-v2.html` so it doesn't get caught by the catch-all 404 handler.

**The change is in:** `server-new.js` (around line 508)

**You need to:**
1. Restart your local server (if it's running)
2. Or start it if it's not running
3. Then test the URL

---

## Troubleshooting

### If you get 404:
- Make sure the server is running
- Check the console for errors
- Verify `product-page-v2.html` exists in the directory

### If product doesn't load:
- Check browser console (F12) for API errors
- Verify `/api/product-widget/sample_3` endpoint works
- Check server logs for errors

---

**Ready to test!** Just start the server and try the URL.



