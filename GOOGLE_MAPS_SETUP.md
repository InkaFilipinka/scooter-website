# 🗺️ Google Maps Setup Guide

The delivery location picker requires a Google Maps API key to function. Follow these steps to get it working:

## 📋 Quick Setup Steps

### 1. Get Your Free API Key

Visit the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/) and follow these steps:

1. **Sign in** with your Google account
2. **Create a new project** or select an existing one
3. **Enable the Maps JavaScript API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Maps JavaScript API"
   - Click "Enable"
4. **Create an API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy your new API key

### 2. Add to Your Project

1. Open the `.env.local` file in your project root
2. Replace the API key with your own:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

### 3. Restart the Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
bun run dev
```

## 💰 Pricing Information

- Google Maps offers **$200 free credit per month**
- This is enough for approximately **28,000 map loads per month**
- For a small scooter rental business, this should be more than sufficient
- No charges unless you exceed the free tier

## 🔒 Security (Optional but Recommended)

To protect your API key from unauthorized use:

1. Go to "APIs & Services" → "Credentials"
2. Click on your API key
3. Under "Application restrictions":
   - Select "HTTP referrers (websites)"
   - Add your domain: `yourdomain.com/*`
   - Add `localhost` for development: `localhost/*`

## ✅ Testing

1. Go to your booking form
2. Select "Yes, deliver to me"
3. Click "Click to Select Location on Map"
4. The map should load showing Siargao
5. Click anywhere on the map to select a delivery location
6. The distance and delivery cost will be calculated automatically

## 🆘 Troubleshooting

**Map shows error message:**
- Make sure your API key is valid
- Check that "Maps JavaScript API" is enabled
- Verify the key is properly added to `.env.local`
- Restart the dev server after adding the key

**Map loads but can't click:**
- This is normal - just click anywhere on the map to select a location

**Distance calculation seems wrong:**
- The system calculates straight-line distance (as the crow flies)
- Real road distance may vary slightly

## 📝 Current Demo Key

The project currently includes a demo API key that **may not work**. This is why you need to get your own free key.

---

**Need help?** Check the [Google Maps Platform Documentation](https://developers.google.com/maps/documentation) or contact support.
