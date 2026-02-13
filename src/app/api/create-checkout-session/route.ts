import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Lazy initialization - only create Stripe instance when actually needed
function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-12-15.clover',
  });
}

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      currency = 'php',
      bookingId,
      customerEmail,
      customerName,
      scooterName,
      startDate,
      endDate,
      days
    } = await request.json();

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get the origin for success/cancel URLs
    const origin = request.headers.get('origin') || 'https://siargaoscooterrentals.com';

    // Create a Checkout Session with Stripe
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Scooter Rental - ${scooterName}`,
              description: `${days} day${days > 1 ? 's' : ''} rental (${startDate} - ${endDate})`,
              images: ['https://siargaoscooterrentals.com/images/hero-poster.webp'],
            },
            unit_amount: Math.round(amount * 100), // Stripe uses cents/centavos
          },
          quantity: 1,
        },
      ],
      metadata: {
        bookingId,
        customerEmail,
        customerName,
        scooterName,
        startDate,
        endDate,
      },
      success_url: `${origin}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${origin}/booking-cancelled?booking_id=${bookingId}`,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // Session expires in 30 minutes
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('❌ Stripe checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
