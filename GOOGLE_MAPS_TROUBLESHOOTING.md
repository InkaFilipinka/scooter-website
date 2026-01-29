# 🔧 Google Maps Troubleshooting Guide

If you're seeing "Map Failed to Load", follow these steps:

## ✅ Step 1: Enable Maps JavaScript API

This is the **most common issue**.

1. Go to: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com
2. Make sure you're in the correct project
3. Click the blue **"ENABLE"** button
4. Wait 1-2 minutes for it to activate

## ✅ Step 2: Set Up Billing

Google Maps requires billing info, but offers **$200 free credit per month** (more than enough!).

1. Go to: https://console.cloud.google.com/billing
2. Click "Link a billing account" or "Create billing account"
3. Enter your credit card info (you won't be charged unless you exceed $200/month)
4. Link the billing account to your project

## ✅ Step 3: Check API Key Restrictions

If you added restrictions to your API key, it might be blocking the site.

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click on your API key
3. Under "Application restrictions":
   - For testing: Choose **"None"**
   - For production: Choose "HTTP referrers" and add:
     - `localhost/*` (for local development)
     - `*.same.app/*` (for Same preview)
     - `yourdomain.com/*` (your actual domain)

## ✅ Step 4: Verify API Key in Project

1. Check that `.env.local` has your API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCY5PM-q1N7YgQc4Bxw37hIQxGg7vO04oQ
   ```
2. Make sure there are no extra spaces or quotes
3. Restart the dev server after any changes

## 🔍 Check Browser Console for Errors

1. Right-click on the page → "Inspect" → "Console" tab
2. Look for red error messages
3. Common errors and solutions:

### "Google Maps JavaScript API error: ApiNotActivatedMapError"
→ **Solution:** Enable Maps JavaScript API (Step 1)

### "Google Maps JavaScript API error: ApiTargetBlockedMapError"
→ **Solution:** Set up billing (Step 2)

### "Google Maps JavaScript API error: RefererNotAllowedMapError"
→ **Solution:** Fix API key restrictions (Step 3)

### "Google Maps JavaScript API error: InvalidKeyMapError"
→ **Solution:** Check your API key is correct in `.env.local`

## 🆘 Still Not Working?

### Option A: Use Manual Distance Input
The booking form now has a **manual distance input field** as a fallback:
1. Skip the map picker button
2. Scroll down to "Or enter distance manually"
3. Type in the approximate distance in kilometers

### Option B: Create a New API Key
Sometimes starting fresh helps:
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "API Key"
3. Copy the new key
4. Replace it in `.env.local`
5. Restart the server

## 📊 Quick Checklist

- [ ] Maps JavaScript API is enabled
- [ ] Billing account is linked to the project
- [ ] API key has no restrictions (or correct restrictions)
- [ ] API key is correctly added to `.env.local`
- [ ] Dev server was restarted after updating `.env.local`
- [ ] No errors in browser console

## 💰 Cost Estimate

With Google's **$200 free credit per month**:
- **Map loads**: ~28,000 free loads/month
- **For a small scooter rental**: You'll likely use $5-10/month
- **Your cost**: $0 (well within free tier)

## 📞 Need More Help?

Check the official Google Maps documentation:
https://developers.google.com/maps/documentation/javascript/error-messages
