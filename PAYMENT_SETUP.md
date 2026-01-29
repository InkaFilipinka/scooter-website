# Payment Gateway Setup Guide for Palm Riders

This guide will help you set up **Credit Card**, **GCash**, and **Cryptocurrency** payments for your scooter rental business.

## 🎯 Overview

Your website supports three payment methods:

| Payment Method | Gateway | Best For | Setup Time |
|----------------|---------|----------|------------|
| **Credit Card** | Stripe | International customers | 15 min |
| **GCash** | PayMongo | Filipino customers | 20 min |
| **Crypto** | Coinbase Commerce | Crypto enthusiasts | 15 min |

---

## 💳 Option 1: Credit Card Payments (Stripe)

### Why Stripe?
- ✅ Most popular worldwide
- ✅ Supports 135+ currencies
- ✅ Excellent security and fraud protection
- ✅ Easy integration

### Cost
- **Transaction Fee**: 3.9% + ₱15 per successful card charge
- **No monthly fees**

### Setup Steps

#### 1. Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click **"Start now"**
3. Enter your business details:
   - Business name: **Palm Riders**
   - Country: **Philippines**
   - Email: **contact@siargaoscooterrentals.com**
4. Verify your email address

#### 2. Complete Business Profile

1. In Stripe Dashboard, go to **Settings** → **Business Settings**
2. Fill in:
   - Business type: **Individual** or **Company**
   - Business address: Blue Corner House, General Luna
   - Tax ID (if applicable)
3. Add bank account for payouts:
   - Philippine bank account details
   - For GCash, you can use GCash AMEX Virtual Pay

#### 3. Get API Keys

1. Go to **Developers** → **API keys**
2. Copy:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`)

⚠️ **Test Mode**: Use test keys first, then activate your account and get live keys

#### 4. Update .env.local

```env
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

#### 5. Activate Your Account

1. Complete all required information in Stripe Dashboard
2. Submit for review
3. Wait for approval (usually 1-2 days)
4. Switch to **Live mode** and get live API keys
5. Update `.env.local` with live keys

---

## 📱 Option 2: GCash Payments (PayMongo)

### Why PayMongo?
- ✅ Built for Philippines
- ✅ Native GCash integration
- ✅ Also supports credit/debit cards
- ✅ Local support team

### Cost
- **GCash**: 2.5% + ₱10 per transaction
- **Cards**: 3.5% + ₱15 per transaction
- **No monthly fees**

### Setup Steps

#### 1. Create PayMongo Account

1. Go to [https://paymongo.com](https://paymongo.com)
2. Click **"Get Started"**
3. Sign up with:
   - Business email: **contact@siargaoscooterrentals.com**
   - Business name: **Palm Riders**
4. Verify your email

#### 2. Complete Business Verification

1. In PayMongo Dashboard, complete the business verification:
   - Upload valid ID (Driver's License, Passport, etc.)
   - Business registration documents (if registered)
   - Proof of address
   - Bank account details for settlements

2. Wait for verification (usually 24-48 hours)

#### 3. Get API Keys

1. Go to **Developers** → **API Keys**
2. Copy:
   - **Public Key** (starts with `pk_test_...`)
   - **Secret Key** (starts with `sk_test_...`)

#### 4. Enable GCash

1. In PayMongo Dashboard, go to **Settings** → **Payment Methods**
2. Enable **GCash**
3. Complete GCash-specific requirements if any

#### 5. Update .env.local

```env
PAYMONGO_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_PAYMONGO_PUBLIC_KEY=pk_test_your_public_key_here
```

#### 6. Test GCash Payment

1. Use PayMongo test credentials:
   - Test GCash Number: Any valid Philippine number
   - Test OTP: `111111`
2. Make a test booking and pay via GCash
3. Check PayMongo dashboard for test payment

#### 7. Go Live

1. Complete all compliance requirements
2. Switch to **Live mode** in PayMongo
3. Get live API keys
4. Update `.env.local` with live keys

---

## ₿ Option 3: Cryptocurrency Payments (MetaMask - Direct to Wallet)

### Why MetaMask Direct Payments?
- ✅ **Zero platform fees** - only blockchain gas fees (~$0.01)
- ✅ Accept USDC stablecoin (no price volatility!)
- ✅ Money goes directly to YOUR wallet
- ✅ No chargebacks
- ✅ Global customers
- ✅ **Real-time exchange rate** - automatic PHP to USD conversion
- ✅ Multi-chain support (Polygon, BSC, Ethereum)

### Cost
- **Platform Fee**: **0%** (FREE!)
- **Gas Fee**: Paid by customer (~$0.01 on Polygon)
- **No monthly fees**

### Real-Time Exchange Rate
Your website automatically fetches the current PHP to USD exchange rate:
- Updates every 5 minutes
- Uses multiple free APIs for reliability
- Shows customer the exact rate being used
- No manual updates needed!

**Example:**
- Customer booking: ₱1,500
- Current rate: $1 = ₱57.25
- Auto-calculated: 1,500 ÷ 57.25 = **26.20 USDC**
- Customer pays exactly: 26.20 USDC

### Setup Steps

#### 1. Create Coinbase Account

1. Go to [https://www.coinbase.com](https://www.coinbase.com)
2. Click **"Sign up"**
3. Create personal account first
4. Verify email and phone number
5. Complete identity verification (upload ID)

#### 2. Create Coinbase Commerce Account

1. Go to [https://commerce.coinbase.com](https://commerce.coinbase.com)
2. Click **"Get Started"**
3. Link your Coinbase account
4. Complete business profile:
   - Business name: **Palm Riders**
   - Website: Your website URL
   - Description: Scooter rental in Siargao

#### 3. Get API Key

1. In Coinbase Commerce Dashboard, go to **Settings** → **API keys**
2. Click **"Create an API key"**
3. Copy the API key (keep it secure!)

#### 4. Set Up Webhook (Optional but Recommended)

1. In Settings → **Webhook subscriptions**
2. Add webhook URL: `https://your-domain.com/api/coinbase-webhook`
3. Select events to monitor
4. Copy the webhook secret

#### 5. Update .env.local

```env
COINBASE_COMMERCE_API_KEY=your_api_key_here
NEXT_PUBLIC_COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret_here
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

#### 6. Configure Settlement

1. In Coinbase Commerce, go to **Settings** → **Settlement**
2. Choose:
   - **Keep in crypto**: Receive Bitcoin, Ethereum, etc.
   - **Convert to fiat**: Auto-convert to USD/PHP and deposit to bank

#### 7. Test Crypto Payment

1. Make a test booking
2. Select "Crypto" as payment method
3. You'll get redirected to Coinbase Commerce
4. Use testnet or small amount for testing
5. Confirm payment is recorded

---

## 🔐 Security Best Practices

1. **Never commit API keys to Git**
   - `.env.local` is already in `.gitignore`
   - Never share keys publicly

2. **Use test keys first**
   - Test thoroughly before going live
   - Switch to live keys only when ready

3. **Enable webhook signatures**
   - Verify webhook authenticity
   - Prevent fraudulent requests

4. **Monitor transactions**
   - Check dashboards daily
   - Set up email alerts for suspicious activity

5. **Keep keys secure**
   - Use environment variables
   - Rotate keys periodically

---

## 💰 Cost Comparison

For a **₱1,500 scooter rental** (3 days @ ₱450/day + delivery):

| Payment Method | Transaction Fee | You Receive |
|----------------|-----------------|-------------|
| **Credit Card (Stripe)** | ₱73.50 (3.9% + ₱15) | ₱1,426.50 |
| **GCash (PayMongo)** | ₱47.50 (2.5% + ₱10) | ₱1,452.50 |
| **Crypto (Coinbase)** | ₱15.00 (1%) | ₱1,485.00 |

**Recommendation**: Enable all three for customer flexibility!

---

## 🧪 Testing Payment Integration

### Test Credit Cards (Stripe)

```
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
ZIP: Any valid ZIP
```

### Test GCash (PayMongo)

```
Phone: Any valid PH number
OTP: 111111
```

### Test Crypto (Coinbase Commerce)

Use testnet or small amount (0.0001 BTC) for testing

---

## 🚀 Going Live Checklist

### Before Accepting Real Payments:

- [ ] All payment gateways fully verified
- [ ] Test successful transaction for each method
- [ ] Test failed transaction handling
- [ ] Webhook endpoints configured
- [ ] Email/WhatsApp notifications working
- [ ] Booking system saves payment status
- [ ] Refund policy documented
- [ ] Terms & conditions updated
- [ ] SSL certificate installed (HTTPS)
- [ ] Privacy policy includes payment data

---

## 📊 Payment Flow Diagram

```
Customer submits booking
        ↓
Selects payment method
        ↓
    ┌───┴───┐
    │       │       │
 Credit   GCash   Crypto
 Card      │       │
    │       │       │
 Stripe  PayMongo Coinbase
    │       │       │
    └───┬───┘
        ↓
Payment Success/Failure
        ↓
Update booking status
        ↓
Send confirmations
(Email + WhatsApp)
```

---

## 🆘 Troubleshooting

### Stripe Issues

**Error: "Invalid API Key"**
- Check if key starts with `sk_test_` or `sk_live_`
- Verify key is copied correctly in `.env.local`
- Restart dev server after changing `.env.local`

**Payment declined**
- Use test card: 4242 4242 4242 4242
- Check if account is activated
- Verify business verification is complete

### PayMongo Issues

**GCash redirect not working**
- Check if GCash is enabled in dashboard
- Verify webhook URL is correct
- Ensure redirect URLs are HTTPS in production

**API authentication failed**
- Base64 encode your secret key
- Check key is active and not revoked

### Coinbase Commerce Issues

**Webhook not receiving events**
- Verify webhook URL is publicly accessible
- Check webhook secret is correct
- Review webhook logs in Coinbase dashboard

**Payment not confirming**
- Blockchain confirmations can take time
- Check transaction on blockchain explorer
- Wait for required confirmations (usually 3-6)

---

## 📞 Support Contacts

- **Stripe Support**: [https://support.stripe.com](https://support.stripe.com)
- **PayMongo Support**: support@paymongo.com
- **Coinbase Commerce**: [https://commerce.coinbase.com/support](https://commerce.coinbase.com/support)

---

## 📚 Additional Resources

- [Stripe PHP Documentation](https://stripe.com/docs/api)
- [PayMongo API Reference](https://developers.paymongo.com/reference)
- [Coinbase Commerce API](https://commerce.coinbase.com/docs)
- [PCI Compliance Guide](https://www.pcisecuritystandards.org)

---

## ✅ Quick Start Summary

1. **Sign up** for all three payment providers
2. **Verify** your business with each platform
3. **Get API keys** (test keys first)
4. **Update** `.env.local` with all credentials
5. **Test** each payment method thoroughly
6. **Go live** and switch to production keys
7. **Monitor** transactions in each dashboard

Need help? Contact Same support or check the documentation!
