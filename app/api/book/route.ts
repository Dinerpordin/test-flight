import { NextResponse } from 'next/server';

// Booking endpoint has been decommissioned.
// This platform is now a metasearch referral engine.
// All bookings are completed on the partner site (Kiwi.com).
export async function POST() {
  return NextResponse.json(
    { error: 'Direct booking is no longer supported. Use the referral link to book on our partner site.' },
    { status: 410 }
  );
}

export async function GET() {
  return NextResponse.json(
    { error: 'Gone. This endpoint has been decommissioned.' },
    { status: 410 }
  );
}
