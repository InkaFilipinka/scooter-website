import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'PHP', bookingId, customerEmail, customerName, paymentMethod } = await request.json();

    const secretKey = process.env.PAYMONGO_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: 'PayMongo not configured' },
        { status: 500 }
      );
    }

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // PayMongo uses centavos (multiply by 100)
    const amountInCentavos = Math.round(amount * 100);

    // Create PaymentIntent with PayMongo
    // PayMongo supports: card, gcash, grab_pay, paymaya
    const paymentIntentData = {
      data: {
        attributes: {
          amount: amountInCentavos,
          currency: currency.toUpperCase(),
          payment_method_allowed: [paymentMethod === 'gcash' ? 'gcash' : 'card'],
          description: `Palm Riders - Booking ${bookingId}`,
          statement_descriptor: 'Palm Riders Siargao',
          metadata: {
            bookingId,
            customerEmail,
            customerName,
          },
        },
      },
    };

    // Create Payment Intent
    const response = await axios.post(
      'https://api.paymongo.com/v1/payment_intents',
      paymentIntentData,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(secretKey).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const paymentIntent = response.data.data;

    // For GCash, create a source
    if (paymentMethod === 'gcash') {
      const sourceData = {
        data: {
          attributes: {
            amount: amountInCentavos,
            currency: 'PHP',
            type: 'gcash',
            redirect: {
              success: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?booking=${bookingId}`,
              failed: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/failed?booking=${bookingId}`,
            },
          },
        },
      };

      const sourceResponse = await axios.post(
        'https://api.paymongo.com/v1/sources',
        sourceData,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(secretKey).toString('base64')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return NextResponse.json({
        paymentIntentId: paymentIntent.id,
        clientKey: paymentIntent.attributes.client_key,
        checkoutUrl: sourceResponse.data.data.attributes.redirect.checkout_url,
        sourceId: sourceResponse.data.data.id,
      });
    }

    // For card payments
    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      clientKey: paymentIntent.attributes.client_key,
    });

  } catch (error) {
    console.error('❌ PayMongo payment error:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('PayMongo API Error:', error.response.data);
      return NextResponse.json(
        { error: 'Payment creation failed', details: error.response.data },
        { status: error.response.status }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
