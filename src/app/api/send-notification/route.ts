import { NextRequest, NextResponse } from 'next/server';

type NotificationType = 'whatsapp_click' | 'messenger_click' | 'phone_click' | 'email_click' | 'custom';

interface NotificationData {
  type: NotificationType;
  source?: string; // e.g., 'floating_button', 'contact_section', 'footer'
  customerInfo?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  message?: string;
  timestamp?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: NotificationData = await request.json();

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

    // Build notification message based on type
    let title = '';
    let emoji = '';
    let messageBody = '';
    let priority = 'default';
    let tags = 'bell';

    switch (data.type) {
      case 'whatsapp_click':
        title = 'WhatsApp Contact!';
        emoji = '💬';
        tags = 'speech_balloon,green_circle';
        priority = 'high';
        messageBody = `Someone clicked WhatsApp to contact you!

📍 Source: ${data.source || 'Website'}
🕐 Time: ${philippineTime}

${data.customerInfo?.name ? `👤 Name: ${data.customerInfo.name}` : ''}
${data.customerInfo?.phone ? `📱 Phone: ${data.customerInfo.phone}` : ''}

Check your WhatsApp for their message!`;
        break;

      case 'messenger_click':
        title = 'Messenger Contact!';
        emoji = '💬';
        tags = 'speech_balloon,blue_circle';
        priority = 'high';
        messageBody = `Someone clicked Messenger to contact you!

📍 Source: ${data.source || 'Website'}
🕐 Time: ${philippineTime}

${data.customerInfo?.name ? `👤 Name: ${data.customerInfo.name}` : ''}

Check your Facebook Messenger!`;
        break;

      case 'phone_click':
        title = 'Phone Call Incoming!';
        emoji = '📞';
        tags = 'telephone_receiver';
        priority = 'urgent';
        messageBody = `Someone is calling your business number!

📍 Source: ${data.source || 'Website'}
🕐 Time: ${philippineTime}

Be ready to answer!`;
        break;

      case 'email_click':
        title = 'Email Inquiry!';
        emoji = '📧';
        tags = 'envelope';
        priority = 'default';
        messageBody = `Someone clicked to email you!

📍 Source: ${data.source || 'Website'}
🕐 Time: ${philippineTime}

Check your inbox soon!`;
        break;

      case 'custom':
        title = 'Website Notification';
        emoji = '🔔';
        tags = 'bell';
        messageBody = data.message || 'You have a new notification from your website.';
        break;

      default:
        title = 'Website Activity';
        emoji = '🌐';
        messageBody = `Activity detected on your website at ${philippineTime}`;
    }

    // Send notification via ntfy.sh
    try {
      await fetch(`https://ntfy.sh/${ntfyTopic}`, {
        method: 'POST',
        headers: {
          'Title': `${emoji} ${title}`,
          'Priority': priority,
          'Tags': tags,
        },
        body: messageBody,
      });

      console.log(`✅ ntfy.sh notification sent: ${data.type}`);
    } catch (ntfyError) {
      console.error('⚠️ ntfy.sh failed:', ntfyError);
      return NextResponse.json(
        { success: false, error: 'Failed to send notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      type: data.type,
      timestamp: philippineTime,
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}
