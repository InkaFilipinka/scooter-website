# 🌴 Palm Riders - Siargao Scooter Rentals

A modern, tropical-themed website for scooter rentals in Siargao del Norte, Philippines.

## ✨ Features

- 🛵 **Fleet Management**: Browse Honda Beat, Honda Click, and Yamaha Fazzio scooters
- 📍 **Google Maps Integration**: Interactive map for delivery location selection
- 💰 **Smart Pricing**: Automatic calculation with ₱6.5/km delivery fee
- 🏄 **Surf Rack Add-on**: Optional surf rack for ₱250
- 💬 **WhatsApp Business API**: Automated booking notifications
- 📧 **Email Notifications**: Customer confirmations and business alerts
- 📱 **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- 🎨 **Tropical Theme**: Beautiful green and blue gradient designs
- 💾 **Booking Persistence**: LocalStorage integration for booking management

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Google Reviews widget (Elfsight) - optional, loads when section is in view
# Get your widget ID: https://elfsight.com/google-reviews-widget/
# NEXT_PUBLIC_ELFSIGHT_WIDGET_ID=elfsight-app-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Google Business Profile URL - for "View on Google" link (from your GBP dashboard)
# NEXT_PUBLIC_GOOGLE_REVIEWS_URL=https://g.page/your-business or https://www.google.com/maps/place/...

# WhatsApp Business Cloud API (Meta)
WHATSAPP_BUSINESS_PHONE_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
BUSINESS_WHATSAPP_NUMBER=639457014440
```

### 2. Google Maps Setup
See `GOOGLE_MAPS_SETUP.md` for detailed instructions on:
- Creating a Google Cloud project
- Enabling required APIs
- Getting your API key
- Setting up billing

### 3. WhatsApp Business Setup
See `WHATSAPP_BUSINESS_SETUP.md` for step-by-step guide on:
- Creating Meta Business account
- Setting up WhatsApp Business API
- Getting credentials
- Testing notifications
- **Cost**: FREE for first 1,000 conversations/month!

### 4. Email Notifications Setup
See `EMAILJS_SETUP.md` for instructions on:
- Creating EmailJS account
- Setting up email templates
- Configuring the service

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Maps**: Google Maps JavaScript API
- **Notifications**:
  - WhatsApp Business Cloud API
  - EmailJS
- **HTTP Client**: Axios
- **Package Manager**: Bun

## 🏗️ Project Structure

```
siargao-scooter-rental/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── send-whatsapp/     # WhatsApp API endpoint
│   │   ├── admin/                 # Admin dashboard
│   │   ├── page.tsx               # Main landing page
│   │   └── layout.tsx
│   └── components/
│       ├── booking-form.tsx       # Booking form with validation
│       ├── scooter-card.tsx       # Scooter display cards
│       ├── map-picker.tsx         # Google Maps location picker
│       ├── navigation.tsx         # Navigation bar
│       └── ui/                    # shadcn/ui components
├── public/                        # Static assets
├── .env.local                     # Environment variables (not in git)
├── GOOGLE_MAPS_SETUP.md          # Maps setup guide
├── WHATSAPP_BUSINESS_SETUP.md    # WhatsApp setup guide
└── EMAILJS_SETUP.md              # Email setup guide
```

## 🎯 Key Features Explained

### Booking System
- Real-time price calculation
- Date validation (no past dates)
- Delivery distance calculation via Google Maps Distance Matrix API
- Payment options: Full payment or deposit (1 day rent)
- Payment methods: Credit Card, Crypto, GCash

### Notification System
- **WhatsApp Business**:
  - Business receives detailed booking notification
  - Customer receives confirmation message
  - Fully automated via API
- **Email**:
  - Customer confirmation emails
  - Business notification emails
  - Customizable templates

### Google Maps Integration
- Autocomplete search for addresses
- Interactive map marker placement
- Road distance calculation (not straight-line)
- Round-trip delivery cost calculation

## 🎨 Customization

### Scooter Models
Edit scooter data in `src/app/page.tsx`:

```typescript
const scooters = [
  {
    id: "honda-beat",
    name: "Honda Beat",
    price: 350,
    features: ["Automatic", "Fuel Efficient", ...],
  },
  // Add more scooters...
];
```

### Pricing
- Daily rates: Edit `price` in scooter data
- Delivery cost: Update in `booking-form.tsx` (currently ₱6.5/km)
- Surf rack: Update in `booking-form.tsx` (currently ₱250)

### Contact Information
Update in `src/app/page.tsx`:
- Phone number: +63 945 701 4440
- Business address: Blue Corner House, General Luna
- Operating hours: 8:00 AM - 8:00 PM

## 🧪 Testing

### Test Booking Flow
1. Fill out the booking form
2. Select delivery location on map
3. Submit booking
4. Check:
   - Browser console for success messages
   - WhatsApp for notifications
   - Email inbox for confirmations
   - LocalStorage for saved booking data

### Test Checklist
- ✅ All scooters display correctly
- ✅ Prices calculate accurately
- ✅ Map picker works
- ✅ Form validation works
- ✅ WhatsApp notifications send
- ✅ Email notifications send
- ✅ Mobile responsive design

## 📱 Deployment

### Using Netlify

1. Build the project:
```bash
bun run build
```

2. Deploy:
- Connect to Netlify
- Set environment variables in Netlify dashboard
- Deploy as Next.js site

See `netlify.toml` for deployment configuration.

## 💰 Cost Estimate

**Monthly costs for ~200 bookings:**

| Service | Cost |
|---------|------|
| WhatsApp Business API | FREE (up to 1,000 conversations) |
| EmailJS | FREE (up to 200 emails) or $6/month |
| Google Maps API | ~$5-10/month (with free tier) |
| Hosting (Netlify) | FREE or $19/month (Pro) |
| **Total** | **~$5-15/month** |

## 🆘 Troubleshooting

### WhatsApp not sending
- Check `.env.local` credentials
- Verify phone number format (no spaces, + prefix)
- Check Meta dashboard for API errors

### Google Maps not loading
- Verify API key is correct
- Check API is enabled in Google Cloud Console
- Ensure billing is enabled

### Bookings not saving
- Check browser console for errors
- Verify localStorage is enabled
- Clear cache and try again

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Google Maps API](https://developers.google.com/maps/documentation)
- [EmailJS Docs](https://www.emailjs.com/docs/)

## 🤝 Support

For setup help or issues:
- Check the detailed setup guides in this repo
- Review troubleshooting sections
- Contact Same support at support@same.new

## 📄 License

Private project for Palm Riders Scooter Rentals.

---

Built with ❤️ for exploring Siargao on two wheels 🛵🌴
