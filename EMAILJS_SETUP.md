# EmailJS Setup Guide for Palm Riders

This guide will help you set up automated email notifications for your scooter rental bookings.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Create Email Service

1. In your EmailJS dashboard, click "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail recommended)
4. Follow the prompts to connect your **contact@siargaoscooterrentals.com** email
5. Copy the **Service ID** (you'll need this later)

## Step 3: Create Email Templates

### Template 1: Business Notification
**⚠️ IMPORTANT:** If your business email still shows the old short version (without add-ons, insurance, amount paid, amount left to pay), edit this template in EmailJS and **replace the entire email body** with only this line: `{{message}}` — then Save. The app sends the full content in `message`; the template must display it.

1. Go to "Email Templates" → open your business template (Template ID used in the app)
2. **Subject:** 🛵 New Booking Request - {{booking_id}}
3. **Body:** Delete everything in the body and type only:
```
{{message}}
```
4. Save. The app sends the complete email (booking details, customer, rental info, daily rate, insurance, total / amount paid / amount left to pay, add-ons) in `message`.

4. Save and copy the **Template ID**

### Template 2: Customer Confirmation
1. Create another template
2. Name it: "Booking Confirmation"
3. Use this template:

**Subject:** ✅ Your Palm Riders Booking Confirmation - {{booking_id}}

**Body:**
```
Dear {{customer_name}},

Thank you for choosing Palm Riders! 🌴🛵

BOOKING CONFIRMATION
-------------------
Booking ID: {{booking_id}}
Scooter: {{scooter_name}}
Rental Period: {{start_date}} - {{end_date}}
Delivery: {{delivery}}
Surf Rack: {{surf_rack}}

PAYMENT DETAILS
--------------
Payment Option: {{payment_option}}
Payment Method: {{payment_method}}
Amount to Pay: ₱{{amount_to_pay}}
Total Cost: ₱{{total_cost}}

We will contact you shortly at {{customer_phone}} to confirm your booking and arrange payment.

PICKUP LOCATION
--------------
Blue Corner House
Barangay Pablacion 5
General Luna, 8419
Surigao del Norte

CONTACT US
----------
Phone/WhatsApp: +63 945 701 4440
Email: contact@siargaoscooterrentals.com

Looking forward to helping you explore Siargao!

Best regards,
Palm Riders Team
```

4. Save and copy this **Template ID**

## Step 4: Get Public Key

1. Go to "Account" → "General"
2. Find your **Public Key**
3. Copy it

## Step 5: Update the Code

Open `/src/components/booking-form.tsx` and update these lines (around line 129):

```typescript
const SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your EmailJS service ID
const TEMPLATE_ID_CUSTOMER = 'YOUR_CUSTOMER_TEMPLATE_ID'; // Template for customer
const TEMPLATE_ID_BUSINESS = 'YOUR_BUSINESS_TEMPLATE_ID'; // Template for business notification
const PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // Replace with your EmailJS public key
```

Replace with your actual IDs from EmailJS.

## Step 6: Test

1. Restart your dev server: `bun run dev`
2. Fill out a test booking
3. Check your inbox at **contact@siargaoscooterrentals.com**
4. The customer should also receive a confirmation email

## Troubleshooting

- **Emails not sending**: Check browser console for errors
- **Wrong email address**: Make sure templates use `{{business_email}}` or hardcode `contact@siargaoscooterrentals.com`
- **Spam folder**: Check spam/junk folders
- **Free tier limits**: EmailJS free tier allows 200 emails/month

## Cost

- **Free tier**: 200 emails/month
- **Paid plans**: Start at $6/month for 1,000 emails

With bookings, you send 2 emails per booking (customer + business), so:
- Free tier = ~100 bookings/month
- Paid tier = ~500 bookings/month

---

Need help? Contact Same support or check [EmailJS Documentation](https://www.emailjs.com/docs/)
