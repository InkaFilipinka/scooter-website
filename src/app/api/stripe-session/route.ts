import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-12-15.clover',
  });
}

/** GET ?session_id=cs_xxx - returns amount_paid (pesos) and session_id for PDF/receipts */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    if (!sessionId) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
    const amountTotal = session.amount_total ?? 0;
    const amountPaidPesos = Math.round(amountTotal / 100);
    return NextResponse.json({
      amount_paid: amountPaidPesos,
      session_id: session.id,
    });
  } catch (error) {
    console.error('Stripe session retrieve error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session' },
      { status: 500 }
    );
  }
}
