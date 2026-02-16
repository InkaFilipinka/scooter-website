import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '@netlify/blobs';

// Booking shape matches form + admin (allow extra fields from form)
interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  scooter: string;
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

// GET - List all bookings or get one by id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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

    const store = getStore('bookings');
    await store.setJSON(body.id, body);

    return NextResponse.json({ success: true, booking: body });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

// PATCH - Update a booking (e.g. status, paidAt)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, paidAt, paymentStatus } = body;

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
