import { NextRequest, NextResponse } from 'next/server';
import { Duffel } from '@duffel/api';

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { offerId, passenger, totalAmount, totalCurrency } = body;

    if (!offerId || !passenger) {
      return NextResponse.json(
        { error: 'offerId and passenger are required' },
        { status: 400 }
      );
    }

    // Step 1: Create a hold order (no payment yet - Duffel will handle payment)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = await (duffel.orders as any).create({
      selected_offers: [offerId],
      passengers: [{
        ...passenger,
        id: 'pas_1', // placeholder, Duffel assigns real IDs
      }],
      payments: [{
        type: 'balance',
        currency: totalCurrency || 'GBP',
        amount: totalAmount,
      }],
      type: 'instant',
    });

    const orderData = order.data;

    return NextResponse.json({
      orderId: orderData.id,
      bookingReference: orderData.booking_reference,
      status: orderData.payment_status?.awaiting_payment ? 'awaiting_payment' : 'confirmed',
    });

  } catch (error: unknown) {
    console.error('[/api/book]', error);
    const message = error instanceof Error ? error.message : 'Booking failed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
