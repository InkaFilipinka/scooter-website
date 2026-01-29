# WhatsApp Business API Setup Guide for Palm Riders

This guide will help you set up automated WhatsApp notifications for your scooter rental bookings.

## 🎯 What You'll Get

When a customer books a scooter:
1. **Business receives** WhatsApp notification with full booking details
2. **Customer receives** WhatsApp confirmation message automatically
3. All integrated with email notifications

## 📊 Cost Estimate

- **Meta WhatsApp Cloud API**: FREE for first 1,000 conversations/month
- After that: ~$0.01-0.05 per conversation (very cheap!)
- For 100-200 bookings/month: **Essentially FREE**

---

## Option 1: Meta WhatsApp Business Cloud API (Recommended)

### Why This Option?
- ✅ **FREE** for first 1,000 conversations/month
- ✅ Official WhatsApp API
- ✅ Most reliable and feature-rich
- ✅ No monthly subscription

### Step 1: Create Meta Business Account

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click **"Get Started"** in the top right
3. Log in with your Facebook account
4. Complete the registration

### Step 2: Create a WhatsApp Business App

1. Go to [Meta for Developers Apps](https://developers.facebook.com/apps)
2. Click **"Create App"**
3. Select **"Business"** as the app type
4. Fill in the app details:
   - **App Name**: "Palm Riders Notifications"
   - **App Contact Email**: contact@siargaoscooterrentals.com
5. Click **"Create App"**

### Step 3: Add WhatsApp Product

1. In your app dashboard, find **"WhatsApp"** in the products list
2. Click **"Set Up"**
3. Choose **"Business Account"** (or create one)
4. Click **"Continue"**

### Step 4: Get Your Test Number (Optional - For Testing)

1. In the WhatsApp section, you'll see a **Test Phone Number**
2. Click **"Send Message"** to test
3. Add your phone number (+63 945 701 4440) to receive test messages
4. Send a test message to verify it works

### Step 5: Get a Production Phone Number

You have two options:

#### Option A: Use Your Existing Business Number (Recommended)
1. In WhatsApp settings, click **"Add Phone Number"**
2. Enter your business number: **+63 945 701 4440**
3. You'll receive a verification code via SMS
4. Enter the code to verify

⚠️ **IMPORTANT**: Once you add this number, you CANNOT use it with regular WhatsApp anymore. It becomes a Business API number only.

#### Option B: Get a New Number for WhatsApp Business
1. Get a new Philippine phone number
2. Follow the same steps above
3. Keep your existing number for regular WhatsApp

### Step 6: Get Your Credentials

1. In your WhatsApp Business app dashboard, go to **"Getting Started"**
2. Copy these values:

   - **Phone Number ID**: Found under "Send and receive messages"
     - Example: `102938475647382`

   - **WhatsApp Business Account ID**: Found in the left sidebar
     - Example: `103847562938475`

3. Click **"Temporary Access Token"** and copy it
   - Example: `EAABsbCS...` (very long string)

⚠️ **Note**: Temporary tokens expire in 24 hours. We'll generate a permanent one later.

### Step 7: Generate Permanent Access Token

1. Go to **"Tools"** → **"Access Token"** in the left sidebar
2. Click **"Generate New Token"**
3. Select your app: **"Palm Riders Notifications"**
4. Select permissions:
   - ✅ `whatsapp_business_messaging`
   - ✅ `whatsapp_business_management`
5. Click **"Generate Token"**
6. **SAVE THIS TOKEN SECURELY** - you won't see it again!

### Step 8: Configure Your Project

1. Open your project's `.env.local` file
2. Replace the placeholder values:

```env
# Meta WhatsApp Business Cloud API
WHATSAPP_BUSINESS_PHONE_ID=your_phone_number_id_here
WHATSAPP_ACCESS_TOKEN=your_permanent_access_token_here
BUSINESS_WHATSAPP_NUMBER=639457014440
```

Example:
```env
WHATSAPP_BUSINESS_PHONE_ID=102938475647382
WHATSAPP_ACCESS_TOKEN=EAABsbCS1234...very_long_token
BUSINESS_WHATSAPP_NUMBER=639457014440
```

### Step 9: Test Your Setup

1. Restart your development server: `bun run dev`
2. Fill out a test booking on your website
3. Check your WhatsApp (business number) for the notification
4. The customer's number should also receive a confirmation

### Step 10: Go Live (After Testing)

1. In your Meta app dashboard, go to **"App Review"**
2. Submit your app for review (required for production)
3. Fill out the business verification form
4. Wait for approval (usually 1-3 days)
5. Once approved, your app is LIVE! 🎉

---

## Option 2: Twilio WhatsApp API (Alternative)

### Why This Option?
- ✅ Very easy to set up
- ✅ Excellent documentation and support
- ✅ Pay-as-you-go pricing
- ❌ Costs start immediately (no free tier like Meta)

### Cost
- ~$0.005 per message (half a cent)
- For 200 bookings × 2 messages = $2/month

### Step 1: Create Twilio Account

1. Go to [Twilio.com](https://www.twilio.com/)
2. Click **"Sign Up"**
3. Complete the registration
4. Verify your email and phone number

### Step 2: Set Up WhatsApp Sandbox (For Testing)

1. In Twilio Console, go to **"Messaging"** → **"Try it out"** → **"Send a WhatsApp message"**
2. Follow the instructions to join the sandbox:
   - Send a WhatsApp message to the Twilio number
   - Send the code shown (e.g., "join abc-xyz")
3. You'll receive a confirmation message

### Step 3: Get a Production WhatsApp Number

1. Go to **"Messaging"** → **"WhatsApp"** → **"Senders"**
2. Click **"+ New Sender"**
3. Choose **"Use your own number"** or **"Get a new number"**
4. Follow the verification process
5. Submit for WhatsApp Business approval

### Step 4: Get Your Credentials

1. Go to **"Account"** → **"API Keys & Tokens"**
2. Copy:
   - **Account SID**: `ACxxxxxxxxxxxxxxxxx`
   - **Auth Token**: Click to reveal and copy

### Step 5: Configure Your Project

1. Open `.env.local`
2. Comment out Meta credentials and add Twilio:

```env
# Option 2: Twilio WhatsApp API
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
BUSINESS_WHATSAPP_NUMBER=639457014440
```

3. Update the API route file `src/app/api/send-whatsapp/route.ts`:

Replace the Meta API code with Twilio code (we can provide this if you choose Twilio)

---

## 🧪 Testing Your Integration

### Test Checklist

1. ✅ Fill out booking form with test data
2. ✅ Check browser console for success messages
3. ✅ Verify WhatsApp notification received on business number
4. ✅ Verify customer receives WhatsApp confirmation
5. ✅ Check email notifications also work

### Test Message Example

Business will receive:
```
🛵 NEW BOOKING - PALM RIDERS 🌴

📋 Booking ID: BK-1234567890

👤 CUSTOMER INFO
Name: Juan Dela Cruz
Email: juan@example.com
Phone: +63 917 123 4567

🛵 RENTAL INFO
Scooter: Honda Click
Start: Jan 15, 2025
End: Jan 18, 2025
Delivery: Yes (5km away)
Surf Rack: Yes (+₱250)

💰 PAYMENT
Option: Pay in Full
Method: GCash
Amount to Pay: ₱1,789
Total Cost: ₱1,789

⚡ Please contact customer to confirm!
```

Customer will receive:
```
Hi Juan Dela Cruz! 👋

Thank you for booking with Palm Riders! 🌴🛵

Your booking (BK-1234567890) has been received:
• Honda Click
• Jan 15, 2025 to Jan 18, 2025
• Amount: ₱1,789

We'll contact you shortly to confirm your reservation.

Questions? Reply to this message or call +63 945 701 4440

See you soon! 🏝️
```

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to Git (it's already in `.gitignore`)
2. **Rotate tokens** every 90 days for security
3. **Use environment variables** for all credentials
4. **Monitor usage** in Meta/Twilio dashboard to detect issues

---

## 💰 Cost Breakdown (Meta Cloud API)

| Conversations | Cost/Month |
|---------------|------------|
| 0-1,000       | FREE       |
| 1,001-10,000  | $0.01 each |
| 10,001+       | $0.005 each|

**For 200 bookings/month:**
- 200 notifications to business = 200 conversations
- 200 confirmations to customers = 200 conversations
- **Total: 400 conversations/month = FREE** ✅

---

## 🆘 Troubleshooting

### Error: "Phone number not verified"
- Make sure you completed phone verification in Meta dashboard
- Add test numbers in WhatsApp settings → Configuration

### Error: "Invalid access token"
- Token may have expired (temp tokens last 24 hours)
- Generate a permanent access token (Step 7)

### Error: "Message not delivered"
- Check if customer's number is in correct format (no spaces, + prefix)
- Verify customer has WhatsApp installed
- Make sure your app is approved for production

### Messages not sending
- Check `.env.local` has correct credentials
- Restart dev server after changing `.env.local`
- Check browser console and terminal for error messages

---

## 📚 Additional Resources

- [Meta WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Twilio WhatsApp API Docs](https://www.twilio.com/docs/whatsapp)
- [WhatsApp Message Templates](https://developers.facebook.com/docs/whatsapp/message-templates)

---

## ✅ Next Steps

After setup:
1. Test thoroughly with real phone numbers
2. Monitor first few bookings closely
3. Consider creating message templates for approval (required for marketing)
4. Set up webhook for delivery receipts and replies

Need help? Contact Same support or check the docs!
