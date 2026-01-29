"use client";
import { useState, useEffect } from "react";
const MESSENGER_URL = "https://m.me/61585650875574";
const NTFY_TOPIC = "palmriders-bookings-live";
// Send notification directly to ntfy.sh
const sendNotification = async () => {
  try {
    const time = new Date().toLocaleString('en-PH', {
      timeZone: 'Asia/Manila',
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: `💬 Messenger Contact!
Someone clicked Messenger to contact you!
📍 Source: Floating Button
🕐 Time: ${time}
Check your Facebook Messenger!`,
    });
    console.log('✅ Messenger click notification sent');
  } catch (error) {
    console.log('Notification failed:', error);
  }
};
// Handle click with delayed navigation
const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  sendNotification();
  setTimeout(() => {
    window.open(MESSENGER_URL, '_blank');
  }, 500);
};
// Facebook Messenger icon component
function MessengerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.91 1.444 5.508 3.729 7.206V22l3.405-1.868c.91.251 1.873.387 2.866.387 5.523 0 10-4.145 10-9.276S17.523 2 12 2zm.994 12.494l-2.546-2.715-4.969 2.715 5.467-5.803 2.609 2.715 4.906-2.715-5.467 5.803z" />
    </svg>
  );
}
export function FacebookMessengerFloat() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  if (!isVisible) return null;
  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-2">
      {/* Tooltip */}
      <div
        className={`bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
          isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
        }`}
      >
        <p className="text-sm font-semibold whitespace-nowrap">Message us on Messenger!</p>
      </div>
      {/* Messenger Button */}
      <a
        href={MESSENGER_URL}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-bounce-slow"
        aria-label="Chat with us on Facebook Messenger"
      >
        <MessengerIcon className="w-8 h-8 text-white" />
        {/* Pulse animation ring */}
        <span className="absolute w-14 h-14 rounded-full bg-blue-500 opacity-40 animate-ping" />
      </a>
    </div>
  );
}
