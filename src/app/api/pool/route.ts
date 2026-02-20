import { NextRequest, NextResponse } from 'next/server';
import { getPool, setPool } from '@/lib/pool';

const MAX_AVAILABLE = 4;

// GET - Return current available scooters
export async function GET() {
  try {
    const pool = await getPool();
    return NextResponse.json(pool);
  } catch (error) {
    console.error('Error fetching pool:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pool' },
      { status: 500 }
    );
  }
}

// PATCH - Update available scooters (admin)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    let available = typeof body.available === 'number' ? body.available : parseInt(body.available, 10);
    if (isNaN(available)) {
      return NextResponse.json(
        { error: 'available must be a number' },
        { status: 400 }
      );
    }
    available = Math.max(0, Math.min(MAX_AVAILABLE, Math.round(available)));
    await setPool(available);

    return NextResponse.json({ available });
  } catch (error) {
    console.error('Error updating pool:', error);
    return NextResponse.json(
      { error: 'Failed to update pool' },
      { status: 500 }
    );
  }
}
