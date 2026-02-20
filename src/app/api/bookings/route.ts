import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';
import { decrementPool, getPool, setPool } from '@/lib/pool';

// Booking shape matches form + admin (allow extra fields from form)
interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  scooter: string;
  quantity?: number;
  startDate: string;
  endDate: string;
  pickupLocation?: string;
  delivery: string;
  distance?: string;
  paymentOption: string;
  paymentMethod?: string;
  total: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  timestamp: string;
  paidAt?: string;
  paymentStatus?: string;
  [key: string]: unknown;
}

// GET - List all bookings, get one by id, or check availability for a date range
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const store = getStore('bookings');

    if (id) {
      const booking = await store.get(id, { type: 'json' }) as Booking | null;
      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
      }
      return NextResponse.json({ booking });
    }

    const { blobs } = await store.list();
    const bookings: Booking[] = [];

    for (const blob of blobs) {
      const b = await store.get(blob.key, { type: 'json' }) as Booking;
      if (b) bookings.push(b);
    }

    if (start && end) {
      const pool = await getPool();
      return NextResponse.json({
        available: pool.available,
        atCapacity: pool.available < 1,
      });
    }

    bookings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Booking;

    if (!body.id || !body.timestamp) {
      return NextResponse.json(
        { error: 'Booking id and timestamp are required' },
        { status: 400 }
      );
    }

    const quantity = Math.max(1, Math.min(4, body.quantity ?? 1));
    body.quantity = quantity;

    const pool = await getPool();
    if (pool.available < quantity) {
      return NextResponse.json(
        { error: `Only ${pool.available} scooter(s) available. Please reduce quantity or try different dates.` },
        { status: 400 }
      );
    }

    const afterDecrement = await decrementPool(quantity);
    if (!afterDecrement) {
      return NextResponse.json(
        { error: 'Not enough scooters available. Please try again.' },
        { status: 400 }
      );
    }

    try {
      const store = getStore('bookings');
      await store.setJSON(body.id, body);
      return NextResponse.json({ success: true, booking: body });
    } catch (createError) {
      await setPool(afterDecrement.available + quantity);
      throw createError;
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PATCH - Update a booking (e.g. status, paidAt, amount_paid, payment_method, payment_reference)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, paidAt, paymentStatus, amount_paid, payment_method, payment_reference } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Booking id required' },
        { status: 400 }
      );
    }

    const store = getStore('bookings');
    const booking = await store.get(id, { type: 'json' }) as Booking | null;

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (status) booking.status = status;
    if (paidAt) booking.paidAt = paidAt;
    if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;
    if (typeof amount_paid === 'number') booking.amount_paid = amount_paid;
    if (payment_method !== undefined) booking.payment_method = String(payment_method);
    if (payment_reference !== undefined) booking.payment_reference = String(payment_reference);

    await store.setJSON(id, booking);

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a booking
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Booking id required' },
        { status: 400 }
      );
    }

    const store = getStore('bookings');
    await store.delete(id);

    return NextResponse.json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}
