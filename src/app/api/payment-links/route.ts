import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

interface PaymentLink {
  id: string;
  amount: number;
  description: string;
  customerName?: string;
  customerEmail?: string;
  createdAt: string;
  expiresAt?: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  paidAt?: string;
  paymentMethod?: string;
  transactionId?: string;
}

// Generate a unique payment link ID
function generatePaymentId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `PAY-${timestamp}-${random}`.toUpperCase();
}

// GET - Retrieve all payment links or a specific one
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    const store = getStore('payment-links');

    if (id) {
      // Get specific payment link
      const link = await store.get(id, { type: 'json' }) as PaymentLink | null;

      if (!link) {
        return NextResponse.json(
          { error: 'Payment link not found' },
          { status: 404 }
        );
      }

      // Check if expired
      if (link.expiresAt && new Date(link.expiresAt) < new Date() && link.status === 'pending') {
        link.status = 'expired';
        await store.setJSON(id, link);
      }

      return NextResponse.json({ paymentLink: link });
    }

    // Get all payment links
    const { blobs } = await store.list();
    const links: PaymentLink[] = [];

    for (const blob of blobs) {
      const link = await store.get(blob.key, { type: 'json' }) as PaymentLink;
      if (link) {
        // Check if expired
        if (link.expiresAt && new Date(link.expiresAt) < new Date() && link.status === 'pending') {
          link.status = 'expired';
          await store.setJSON(blob.key, link);
        }
        links.push(link);
      }
    }

    // Sort by creation date (newest first)
    links.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ paymentLinks: links });
  } catch (error) {
    console.error('Error fetching payment links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment links' },
      { status: 500 }
    );
  }
}

// POST - Create a new payment link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description, customerName, customerEmail, expiresInHours } = body;

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const id = generatePaymentId();
    const now = new Date();

    const paymentLink: PaymentLink = {
      id,
      amount: Number(amount),
      description: description || '',
      customerName: customerName || '',
      customerEmail: customerEmail || '',
      createdAt: now.toISOString(),
      expiresAt: expiresInHours
        ? new Date(now.getTime() + expiresInHours * 60 * 60 * 1000).toISOString()
        : undefined,
      status: 'pending',
    };

    const store = getStore('payment-links');
    await store.setJSON(id, paymentLink);

    // Generate the payment URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://siargaoscooterrentals.com';
    const paymentUrl = `${baseUrl}/pay/${id}`;

    return NextResponse.json({
      success: true,
      paymentLink,
      paymentUrl,
    });
  } catch (error) {
    console.error('Error creating payment link:', error);
    return NextResponse.json(
      { error: 'Failed to create payment link' },
      { status: 500 }
    );
  }
}

// PATCH - Update a payment link (mark as paid, cancelled, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, paymentMethod, transactionId } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Payment link ID required' },
        { status: 400 }
      );
    }

    const store = getStore('payment-links');
    const link = await store.get(id, { type: 'json' }) as PaymentLink | null;

    if (!link) {
      return NextResponse.json(
        { error: 'Payment link not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (status) {
      link.status = status;
      if (status === 'paid') {
        link.paidAt = new Date().toISOString();
      }
    }
    if (paymentMethod) link.paymentMethod = paymentMethod;
    if (transactionId) link.transactionId = transactionId;

    await store.setJSON(id, link);

    return NextResponse.json({
      success: true,
      paymentLink: link,
    });
  } catch (error) {
    console.error('Error updating payment link:', error);
    return NextResponse.json(
      { error: 'Failed to update payment link' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a payment link
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Payment link ID required' },
        { status: 400 }
      );
    }

    const store = getStore('payment-links');
    await store.delete(id);

    return NextResponse.json({
      success: true,
      message: 'Payment link deleted',
    });
  } catch (error) {
    console.error('Error deleting payment link:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment link' },
      { status: 500 }
    );
  }
}
