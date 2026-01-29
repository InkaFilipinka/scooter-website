import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json();

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // ntfy.sh topic - hardcoded to ensure it works
    const ntfyTopic = 'palmriders-bookings-live';

    // Get current Philippine time
    const philippineTime = new Date().toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Build notification message
    const messageBody = `📧 NEW MESSAGE FROM WEBSITE

👤 FROM:
Name: ${data.name}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : 'Phone: Not provided'}

💬 MESSAGE:
${data.message}

🕐 Received: ${philippineTime}

Reply via email or WhatsApp!`;

    // Send notification via ntfy.sh
    try {
      await fetch(`https://ntfy.sh/${ntfyTopic}`, {
        method: 'POST',
        headers: {
          'Title': `📧 New Message: ${data.name}`,
          'Priority': 'high',
          'Tags': 'envelope,incoming_envelope',
          'Click': data.phone
            ? `https://wa.me/${data.phone.replace(/[^0-9]/g, '')}`
            : `mailto:${data.email}`,
          'Actions': `view, Reply via Email, mailto:${data.email}?subject=Re: Your Palm Riders Inquiry&body=Hi ${data.name},%0A%0AThank you for contacting Palm Riders!%0A%0A`,
        },
        body: messageBody,
      });

      console.log('✅ Contact form notification sent via ntfy.sh');
    } catch (ntfyError) {
      console.error('⚠️ ntfy.sh failed:', ntfyError);
    }

    // Log to console as backup
    console.log('═══════════════════════════════════════');
    console.log('📧 NEW CONTACT FORM SUBMISSION');
    console.log('═══════════════════════════════════════');
    console.log(messageBody);
    console.log('═══════════════════════════════════════');

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      timestamp: philippineTime,
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
