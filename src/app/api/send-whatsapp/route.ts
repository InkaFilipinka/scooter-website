import { NextRequest, NextResponse } from 'next/server';

interface BookingData {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  scooterName: string;
  startDate: string;
  endDate: string;
  pickupTime?: string;
  delivery: string;
  insurance?: string;
  surfRack: string;
  addOns?: string;
  paymentOption: string;
  paymentMethod: string;
  amountToPay: number;
  totalCost: number;
}

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingData = await request.json();

    // Check if we're in TEST MODE (no Meta API credentials)
    const phoneNumberId = process.env.WHATSAPP_BUSINESS_PHONE_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const isTestMode = !phoneNumberId || !accessToken ||
                       phoneNumberId === 'your_phone_number_id_here' ||
                       accessToken === 'your_access_token_here';

    // Format the notification message
    const messageText = `🛵 NEW BOOKING - PALM RIDERS 🌴

📋 Booking ID: ${bookingData.bookingId}

👤 CUSTOMER INFO
Name: ${bookingData.customerName}
Email: ${bookingData.customerEmail}
Phone: ${bookingData.customerPhone}

🛵 RENTAL DETAILS
Scooter: ${bookingData.scooterName}
Start: ${bookingData.startDate}
End: ${bookingData.endDate}
${bookingData.pickupTime ? `Pickup Time: ${bookingData.pickupTime}` : ''}
Delivery: ${bookingData.delivery}
${bookingData.insurance ? `Insurance: ${bookingData.insurance}` : ''}
Surf Rack: ${bookingData.surfRack}
${bookingData.addOns ? `Add-ons: ${bookingData.addOns}` : ''}

💰 PAYMENT
Option: ${bookingData.paymentOption}
Method: ${bookingData.paymentMethod || 'Pay at Pickup'}
Amount Now: ₱${bookingData.amountToPay}
Total Cost: ₱${bookingData.totalCost}

⚡ Contact customer to confirm!`;

    if (isTestMode) {
      // ============================================
      // TEST MODE: Use ntfy.sh for free notifications
      // ============================================
      console.log('📱 TEST MODE: Sending notification via ntfy.sh');

      // ntfy.sh topic - hardcoded to ensure it works
      const ntfyTopic = 'palmriders-bookings-live';

      try {
        // Send push notification via ntfy.sh (FREE, no signup!)
        await fetch(`https://ntfy.sh/${ntfyTopic}`, {
          method: 'POST',
          headers: {
            'Title': `🛵 New Booking: ${bookingData.customerName}`,
            'Priority': 'high',
            'Tags': 'scooter,money_with_wings',
            'Click': `https://wa.me/${bookingData.customerPhone.replace(/[^0-9]/g, '')}`,
          },
          body: messageText,
        });

        console.log('✅ ntfy.sh notification sent!');
      } catch (ntfyError) {
        console.log('⚠️ ntfy.sh failed, logging to console:', ntfyError);
      }

      // Also log to console for debugging
      console.log('═══════════════════════════════════════');
      console.log('📱 NEW BOOKING NOTIFICATION (TEST MODE)');
      console.log('═══════════════════════════════════════');
      console.log(messageText);
      console.log('═══════════════════════════════════════');

      // Generate WhatsApp click-to-chat link for manual follow-up
      const customerPhone = bookingData.customerPhone.replace(/[^0-9]/g, '');
      const whatsappLink = `https://wa.me/${customerPhone}?text=${encodeURIComponent(
        `Hi ${bookingData.customerName}! 👋 Thank you for your Palm Riders booking (${bookingData.bookingId}). Your ${bookingData.scooterName} is confirmed for ${bookingData.startDate}. See you soon! 🌴🛵`
      )}`;

      console.log('📲 WhatsApp Link to contact customer:');
      console.log(whatsappLink);
      console.log('═══════════════════════════════════════');

      return NextResponse.json({
        success: true,
        testMode: true,
        message: 'Notification sent (TEST MODE)',
        whatsappLink,
      });
    }

    // ============================================
    // PRODUCTION MODE: Use Meta WhatsApp Cloud API
    // ============================================
    const businessNumber = process.env.BUSINESS_WHATSAPP_NUMBER;

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: businessNumber,
          type: 'text',
          text: {
            body: messageText,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('WhatsApp API Error:', errorData);
      throw new Error('WhatsApp API request failed');
    }

    console.log('✅ WhatsApp notification sent successfully');

    return NextResponse.json({
      success: true,
      message: 'WhatsApp notification sent successfully',
    });

  } catch (error) {
    console.error('❌ Error sending notification:', error);

    return NextResponse.json(
      { error: 'Failed to send notification', testMode: true },
      { status: 200 } // Return 200 to not break the booking flow
    );
  }
}
