# MetaMask USDC Payment Setup Guide

## 🎯 Overview

Your website now accepts **USDC (USD Coin)** payments directly to your MetaMask wallet with **ZERO fees**!

### Why USDC?
- ✅ **Stablecoin** - Always = $1 USD (no volatility)
- ✅ **Zero Platform Fees** - No Coinbase/Stripe commission fees
- ✅ **6% Processing Fee** - Transparent fee that covers your conversion costs
- ✅ **Instant Settlement** - Money goes directly to your wallet
- ✅ **Easy to Convert** - Can sell USDC for PHP on any exchange
- ✅ **Transparent** - All transactions on blockchain

### 💡 About the 6% Built-in Fee

Your website **automatically adds 6%** to all USDC payment amounts. This fee covers YOUR costs when converting USDC to PHP.

**What it covers:**
- Binance/exchange trading fees (~2-3%)
- Bid-ask spread when selling USDC (~2-3%)
- Withdrawal fees to bank/GCash (~1%)
- Buffer for rate fluctuations (~1%)

**Example:**
- Customer booking: ₱1,500
- Exchange rate: $1 = ₱56
- Base calculation: 1,500 ÷ 56 = 26.79 USDC
- **With 6% added: 26.79 × 1.06 = 28.40 USDC**
- **Customer sees and pays: $28.40 USDC**
- You receive: 28.40 USDC
- Cash out on Binance: ~₱1,500 (after all conversion fees)
- **Net result: You get the full ₱1,500!** ✅

**Customer Experience:**
- They see the final USDC amount: "$28.40 USDC ≈ ₱1,500"
- The 6% is already included in the price shown
- Clean, simple pricing - no breakdown or extra line items

### Your Wallet Address
```
0xf608f1e29c469F6F352F33DD605E1dB68B832B4a
```

---

## 🔗 Supported Networks

Customers can pay on any of these networks:

| Network | Gas Fee | Speed | Recommended |
|---------|---------|-------|-------------|
| **Polygon** | ~$0.01 | Fast | ⭐ **YES** |
| **BSC** | ~$0.10 | Fast | ✅ Good |
| **Ethereum** | ~$5-20 | Medium | ❌ Too expensive |

**Recommendation**: Tell customers to use **Polygon** for lowest fees!

---

## 📱 How It Works (Customer Side)

1. Customer fills out booking form
2. Selects "Crypto" as payment method
3. Clicks "Submit Booking & Pay"
4. MetaMask modal opens
5. Customer selects network (Polygon recommended)
6. Customer clicks "Connect MetaMask"
7. MetaMask extension opens
8. Customer approves connection
9. Customer reviews transaction details
10. Customer clicks "Send USDC"
11. MetaMask confirms transaction
12. Transaction is broadcast to blockchain
13. Payment confirmed! ✅

---

## 💰 How to Receive Payments

### Step 1: Get MetaMask Wallet

If you don't have MetaMask yet:

1. Install MetaMask browser extension: https://metamask.io/download/
2. Create a new wallet or import existing one
3. **SAVE YOUR SEED PHRASE SECURELY** (never share it!)
4. Your wallet address is already configured: `0xf608f1e29c469F6F352F33DD605E1dB68B832B4a`

### Step 2: Add Networks to MetaMask

#### Add Polygon Network

1. Open MetaMask
2. Click network dropdown (top left)
3. Click "Add Network"
4. Enter these details:
   - **Network Name**: Polygon Mainnet
   - **RPC URL**: https://polygon-rpc.com
   - **Chain ID**: 137
   - **Currency Symbol**: MATIC
   - **Block Explorer**: https://polygonscan.com

5. Click "Save"

#### Add BSC Network (Optional)

1. Open MetaMask
2. Click "Add Network"
3. Enter:
   - **Network Name**: BNB Smart Chain
   - **RPC URL**: https://bsc-dataseed.binance.org
   - **Chain ID**: 56
   - **Currency Symbol**: BNB
   - **Block Explorer**: https://bscscan.com

### Step 3: Add USDC Token to View Balance

By default, MetaMask doesn't show USDC. Add it manually:

#### On Polygon:

1. Switch to Polygon network in MetaMask
2. Click "Import tokens"
3. Enter USDC contract address:
   ```
   0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359
   ```
4. Token symbol should auto-fill as "USDC"
5. Click "Add Custom Token"
6. Now you can see your USDC balance!

#### On BSC:

1. Switch to BSC network
2. Click "Import tokens"
3. Enter:
   ```
   0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d
   ```

---

## 💵 Converting USDC to PHP

### Option 1: Use Binance (Recommended)

1. Create account at https://binance.com
2. Complete KYC verification
3. Send USDC from MetaMask to Binance:
   - Get your Binance USDC deposit address (Polygon network)
   - In MetaMask, send USDC to that address
4. On Binance, convert USDC to USDT or BUSD
5. Sell USDT for PHP using P2P trading
6. Withdraw PHP to your bank account or GCash

### Option 2: Use PDAX (Philippine Exchange)

1. Sign up at https://pdax.ph
2. Verify your account
3. Send USDC to PDAX
4. Sell USDC for PHP
5. Withdraw to bank account

### Option 3: Keep as USDC

- USDC holds its value ($1 = 1 USDC)
- Use it for international payments
- Send it to vendors who accept crypto

---

## 📊 Checking Incoming Payments

### View Transaction on Blockchain Explorer

When customer pays, you'll receive:
1. Email notification with transaction hash
2. WhatsApp notification

To verify payment:

**On Polygon:**
1. Go to https://polygonscan.com
2. Paste your wallet address: `0xf608f1e29c469F6F352F33DD605E1dB68B832B4a`
3. Click "ERC-20 Token Txns" tab
4. See all USDC transactions

**In MetaMask:**
1. Open MetaMask
2. Switch to Polygon network
3. Make sure USDC token is added (see Step 3 above)
4. See your USDC balance increase

---

## 🧪 Testing

### Before Going Live

1. Ask a friend to send you $1 USDC on Polygon testnet
2. Or buy $5 USDC yourself and test the payment flow
3. Make a test booking on your site
4. Pay with MetaMask
5. Verify you received the USDC

### Test Networks (Free Test Crypto)

You can test on testnets first:
- **Polygon Mumbai Testnet** (free test MATIC & USDC)
- Get test tokens from faucets
- Same process as mainnet, but with fake money

---

## 💡 Pro Tips

### 1. Get Some MATIC for Gas Fees

To move USDC on Polygon network, you need a tiny bit of MATIC for gas fees:
- Buy $5 worth of MATIC on Binance
- Send to your MetaMask wallet on Polygon network
- This will cover hundreds of transactions

### 2. Monitor Your Wallet

- Check MetaMask daily for new payments
- Set up wallet notifications on PolygonScan
- Keep track in a spreadsheet

### 3. Security Best Practices

- ✅ Never share your seed phrase
- ✅ Use hardware wallet (Ledger/Trezor) for large amounts
- ✅ Enable MetaMask password
- ✅ Bookmark https://polygonscan.com (avoid phishing sites)
- ✅ Double-check wallet addresses when sending

### 4. Tax Reporting

- Keep records of all crypto transactions
- USDC payments may be taxable as income
- Consult with a tax professional in Philippines
- Use tools like Koinly or CoinTracker for tax reports

---

## 🔄 Converting USDC to PHP - Detailed Steps

### Using Binance (Lowest Fees)

1. **Create Binance Account**
   - Go to https://binance.com
   - Sign up with email
   - Complete KYC (upload ID)
   - Enable 2FA for security

2. **Get Binance USDC Deposit Address**
   - Go to Wallet → Fiat and Spot
   - Click "Deposit"
   - Search for "USDC"
   - **Important**: Select "Polygon" network
   - Copy the deposit address

3. **Send USDC from MetaMask to Binance**
   - Open MetaMask
   - Switch to Polygon network
   - Click on USDC token
   - Click "Send"
   - Paste Binance deposit address
   - Enter amount
   - Review gas fee (~$0.01)
   - Confirm transaction
   - Wait 1-2 minutes for confirmation

4. **Sell USDC for PHP on Binance P2P**
   - Go to P2P Trading
   - Select "Sell"
   - Choose USDC
   - Choose PHP
   - Select payment method (GCash, Bank Transfer)
   - Find a buyer with good rating
   - Complete the trade
   - Receive PHP in your GCash or bank

**Fees**:
- Polygon gas: ~$0.01
- Binance P2P: 0% fee
- Total cost: Almost nothing!

---

## 📈 Price Tracking

### PHP to USD Rate - **REAL-TIME AUTOMATIC!** ⚡

Your website now fetches **real-time exchange rates** automatically!

**How it works:**
1. Website checks multiple free APIs (ExchangeRate-API, CoinGecko, etc.)
2. Gets current PHP to USD rate every 5 minutes
3. Calculates exact USDC amount customer should pay
4. Shows current rate in payment modal
5. Customers always pay the correct amount!

**Example with real rates:**

If current rate is **1 USD = ₱57.50**:
- Booking Total: ₱1,500
- Calculated with 6%: (1,500 ÷ 57.50) × 1.06 = **27.66 USDC**
- Customer sees: **"$27.66 USDC ≈ ₱1,500"**
- Rate shown: "$1 = ₱57.50 🔄"

Simple and clean! The 6% is already included in the USDC amount shown.

**Benefits:**
- ✅ Always accurate pricing
- ✅ No manual rate updates needed
- ✅ Customers trust the transparency
- ✅ Updates every 5 minutes
- ✅ Falls back to cached rate if APIs down

**Checking the rate yourself:**
- https://www.xe.com/
- https://www.google.com/search?q=usd+to+php
- Or just check your payment modal - it shows the current rate!

---

## 🆘 Troubleshooting

### Customer Can't Connect MetaMask

**Issue**: "MetaMask is not installed"
- **Solution**: Tell customer to install MetaMask browser extension

**Issue**: "Wrong network"
- **Solution**: Customer needs to add Polygon network to MetaMask

### Payment Not Showing Up

**Check**:
1. Is it on the correct network? (Polygon/BSC/Ethereum)
2. Wait 1-2 minutes for blockchain confirmation
3. Check PolygonScan with your wallet address
4. Make sure USDC token is added to MetaMask

### Insufficient USDC Balance (Customer)

**Issue**: Customer doesn't have enough USDC
- **Solution**: Customer needs to:
  1. Buy USDC on Binance/Coinbase
  2. Send to their MetaMask wallet
  3. Make sure it's on Polygon network

### Insufficient Gas (Customer)

**Issue**: "Insufficient funds for gas"
- **Solution**: Customer needs tiny amount of MATIC/BNB for gas
  - For Polygon: Buy $2 of MATIC
  - For BSC: Buy $2 of BNB
  - Send to MetaMask wallet

---

## 📞 Customer Support FAQs

### "I don't have MetaMask"

Tell customer:
1. Download from https://metamask.io/download/
2. It's free and takes 2 minutes to set up
3. Very safe and widely used
4. Or they can pay with GCash/Credit Card instead

### "I don't have USDC"

Tell customer:
1. Buy USDC on Binance or Coinbase
2. Or use GCash/Credit Card payment instead
3. USDC is usually cheaper (no fees!)

### "Why use crypto?"

Benefits:
- ✅ Zero payment processing fees
- ✅ Instant settlement
- ✅ No chargebacks
- ✅ Works internationally
- ✅ Private and secure

---

## 🎓 Learn More

- **What is USDC?** https://www.circle.com/en/usdc
- **What is MetaMask?** https://metamask.io/learn/
- **What is Polygon?** https://polygon.technology/
- **Crypto taxes in PH** https://www.bir.gov.ph/

---

## ✅ Go Live Checklist

Before accepting real payments:

- [ ] MetaMask wallet is set up
- [ ] Polygon network is added
- [ ] USDC token is added to view balance
- [ ] Have some MATIC for gas fees (~$5 worth)
- [ ] Tested receiving USDC from a friend
- [ ] Know how to check balance on PolygonScan
- [ ] Have Binance/PDAX account ready to cash out
- [ ] Wallet address verified: `0xf608f1e29c469F6F352F33DD605E1dB68B832B4a`

---

## 💰 Summary

**Your Advantages**:
- 0% fees (vs 3-4% with cards)
- Instant settlement
- No chargebacks
- Global payments

**Customer Advantages**:
- Lower fees
- Fast and secure
- Private
- Works anywhere in the world

**Total Setup Time**: 15 minutes
**Ongoing Effort**: Check wallet daily, cash out weekly

---

Need help? Contact Same support or check the resources above!
