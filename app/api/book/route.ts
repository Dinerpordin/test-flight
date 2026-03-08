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

    // Step 1: Fetch the offer to get the real passenger ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const offerRes = await (duffel.offers as any).get(offerId);
    const offerData = offerRes.data;
    const passengerId = offerData.passengers?.[0]?.id;

    if (!passengerId) {
      return NextResponse.json(
        { error: 'Could not retrieve passenger ID from offer' },
        { status: 400 }
      );
    }

    // Step 2: Create the order with the real passenger ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = await (duffel.orders as any).create({
      selected_offers: [offerId],
      passengers: [{
        ...passenger,
        id: passengerId,
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
    // Extract detailed Duffel error if available
    let message = 'Booking failed';
    if (error instanceof Error) {
      message = error.message;
    }
    // Duffel SDK wraps errors — try to get the errors array
    const duffelErr = error as any;
    if (duffelErr?.errors?.length) {
      message = duffelErr.errors.map((e: any) => e.message).join('; ');
    }
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
