"use client";

import { ScooterCard } from "@/components/scooter-card";
import { ServiceCard } from "@/components/service-card";
import { BookingForm } from "@/components/booking-form";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { FacebookMessengerFloat } from "@/components/facebook-messenger-float";
import { ReviewsSection } from "@/components/reviews-section";
import { FAQSection } from "@/components/faq-section";
import { ContactForm } from "@/components/contact-form";
import { useLanguage } from "@/contexts/language-context";
import { MapPin, Bike, Plane, Truck, Clock } from "lucide-react";
import { trackWhatsAppClick, trackPhoneClick } from "@/components/google-analytics";
import { scooterPricing, getLowestPrice } from "@/data/scooter-pricing";

const NTFY_TOPIC = "palmriders-bookings-live";

// Send notification directly to ntfy.sh
const sendDirectNotification = async (type: string, source: string) => {
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

    let message = '';
    if (type === 'whatsapp_click') {
      message = `💬 WhatsApp Contact!\n\nSomeone clicked WhatsApp!\n\n📍 Source: ${source}\n🕐 Time: ${time}\n\nCheck your WhatsApp!`;
    } else if (type === 'messenger_click') {
      message = `💬 Messenger Contact!\n\nSomeone clicked Messenger!\n\n📍 Source: ${source}\n🕐 Time: ${time}\n\nCheck Facebook Messenger!`;
    } else if (type === 'phone_click') {
      message = `📞 Phone Call!\n\nSomeone is calling you!\n\n📍 Source: ${source}\n🕐 Time: ${time}\n\nAnswer the phone!`;
    }

    await fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: message,
    });
    console.log(`✅ ${type} notification sent`);
  } catch (error) {
    console.log('Notification failed:', error);
  }
};

// Handle contact click with 500ms delay for navigation
const handleContactClick = (
  e: React.MouseEvent<HTMLAnchorElement>,
  type: string,
  source: string,
  url: string,
  isNewTab: boolean = true
) => {
  e.preventDefault();

  if (type === 'whatsapp_click') trackWhatsAppClick();
  if (type === 'phone_click') trackPhoneClick();

  sendDirectNotification(type, source);

  setTimeout(() => {
    if (isNewTab) {
      window.open(url, '_blank');
    } else {
      window.location.href = url;
    }
  }, 500);
};

export default function Home() {
  const { t } = useLanguage();
  // Create scooters array with lowest price for display
  const scooters = scooterPricing.map(scooter => ({
    id: scooter.id,
    name: scooter.name,
    image: scooter.image,
    price: getLowestPrice(scooter.id), // Use lowest price for booking form compatibility
    features: scooter.features,
    alt: scooter.alt,
  }));

  return (
    <main className="min-h-screen">
      <WhatsAppFloat />
      <FacebookMessengerFloat />
      {/* Hero Section */}
      <section className="bg-white">
        {/* Hero Image */}
        <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/hero-poster.webp"
          >
            <source src="/videos/hero.webm" type="video/webm" />
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
</div>

        {/* Hero Text Below Image */}
        <div className="container mx-auto px-4 py-12 md:py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-slate-800 dark:text-slate-900">
            {t('hero.title')}
          </h1>
          <p className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto text-slate-700 dark:text-slate-900">
            {t('hero.subtitle')}
          </p>
          <p className="text-lg md:text-xl mb-8 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-900">
            <MapPin className="w-5 h-5 text-teal-600 dark:text-slate-900" />
            {t('hero.serving')}
          </p>
          <a
            href="#book"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            <span>🏝️</span>
            {t('hero.bookButton')}
          </a>
        </div>
      </section>

      {/* Scooters Section - #prices for Google Ads site links */}
      <section id="prices" className="py-20 bg-slate-50 dark:bg-slate-800 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-slate-200">{t('scooters.title')}</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">{t('scooters.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {scooters.map((scooter) => (
              <ScooterCard key={scooter.id} scooter={scooter} />
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-slate-200">{t('services.title')}</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">{t('services.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ServiceCard
              icon={<Plane className="w-12 h-12" />}
              title={t('services.airport')}
              description={t('services.airportDesc')}
            />
            <ServiceCard
              icon={<Truck className="w-12 h-12" />}
              title={t('services.delivery')}
              description={t('services.deliveryDesc')}
            />
            <ServiceCard
              icon={<Bike className="w-12 h-12" />}
              title={t('services.fleet')}
              description={t('services.fleetDesc')}
            />
          </div>
        </div>
      </section>

      {/* Pricing Info */}
      <section className="py-16 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 dark:from-teal-700 dark:via-cyan-700 dark:to-blue-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-6xl">🌴</div>
          <div className="absolute top-20 right-20 text-5xl">🥥</div>
          <div className="absolute bottom-10 left-1/4 text-7xl">🏖️</div>
          <div className="absolute bottom-20 right-10 text-6xl">🌊</div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h3 className="text-3xl font-bold mb-6 flex items-center justify-center gap-3">
            <span>🏝️</span>
            {t('pricing.title')}
            <span>🏝️</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border-2 border-white/30 shadow-lg">
              <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                <span>🛵</span>
                {t('pricing.daily')}
              </h4>
              <p className="text-lg">{t('pricing.dailyAmount')}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 border-2 border-white/30 shadow-lg">
              <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                <span>🚚</span>
                {t('pricing.deliveryService')}
              </h4>
              <p className="text-lg">{t('pricing.deliveryAmount')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section id="book" className="py-20 bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-3 text-slate-800 dark:text-slate-200">
              <span>🛵</span>
              {t('booking.title')}
              <span>🌴</span>
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">{t('booking.subtitle')}</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <BookingForm scooters={scooters} />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 dark:from-teal-800 dark:via-emerald-800 dark:to-cyan-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-20 text-7xl">🌴</div>
          <div className="absolute top-40 right-10 text-6xl">🥥</div>
          <div className="absolute bottom-10 left-10 text-8xl">🏝️</div>
          <div className="absolute bottom-40 right-20 text-6xl">🌊</div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 flex items-center justify-center gap-3">
              <span>🏖️</span>
              {t('contact.title')}
              <span>🏖️</span>
            </h2>
            <p className="text-xl mb-12 opacity-90">
              {t('contact.subtitle')}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Left Side - Contact Form */}
              <div className="order-2 lg:order-1">
                <ContactForm />
              </div>

              {/* Right Side - Quick Contact Options */}
              <div className="order-1 lg:order-2 space-y-4">
                {/* WhatsApp Card */}
                <a
                  href="https://wa.me/639457014440?text=Hi%20Palm%20Riders!%20I%27d%20like%20to%20rent%20a%20scooter"
                  onClick={(e) => handleContactClick(e, 'whatsapp_click', 'Contact Section', 'https://wa.me/639457014440?text=Hi%20Palm%20Riders!%20I%27d%20like%20to%20rent%20a%20scooter', true)}
                  className="bg-white text-slate-900 rounded-xl p-6 hover:shadow-2xl transition-all transform hover:scale-[1.02] group flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 transition-colors">
                    <svg
                      className="w-9 h-9 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold mb-1">{t('contact.whatsapp')}</h3>
                    <p className="text-slate-600 text-sm mb-1">{t('contact.whatsappDesc')}</p>
                    <span className="text-lg font-semibold text-green-600">+63 945 701 4440</span>
                  </div>
                </a>

                {/* Phone Card */}
                <a
                  href="tel:+639457014440"
                  onClick={(e) => handleContactClick(e, 'phone_click', 'Contact Section', 'tel:+639457014440', false)}
                  className="bg-white text-slate-900 rounded-xl p-6 hover:shadow-2xl transition-all transform hover:scale-[1.02] group flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 group-hover:from-cyan-600 group-hover:to-blue-600 transition-all shadow-lg">
                    <svg
                      className="w-9 h-9 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold mb-1">{t('contact.call')}</h3>
                    <p className="text-slate-600 text-sm mb-1">{t('contact.callDesc')}</p>
                    <span className="text-lg font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">+63 945 701 4440</span>
                  </div>
                </a>

                {/* Messenger Card */}
                <a
                  href="https://m.me/61585650875574"
                  onClick={(e) => handleContactClick(e, 'messenger_click', 'Contact Section', 'https://m.me/61585650875574', true)}
                  className="bg-white text-slate-900 rounded-xl p-6 hover:shadow-2xl transition-all transform hover:scale-[1.02] group flex items-center gap-4"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 group-hover:from-blue-600 group-hover:via-blue-700 group-hover:to-purple-700 transition-all shadow-lg">
                    <svg
                      className="w-9 h-9 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.91 1.444 5.508 3.729 7.206V22l3.405-1.868c.91.251 1.873.387 2.866.387 5.523 0 10-4.145 10-9.276S17.523 2 12 2zm.994 12.494l-2.546-2.715-4.969 2.715 5.467-5.803 2.609 2.715 4.906-2.715-5.467 5.803z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold mb-1">Messenger</h3>
                    <p className="text-slate-600 text-sm mb-1">Chat with us on Facebook</p>
                    <span className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Send a Message</span>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border-2 border-white/30">
              <h4 className="text-xl font-bold mb-3 flex items-center justify-center gap-2">
                <span>⏰</span>
                {t('contact.hours')}
                <span>☀️</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                <div>
                  <p className="font-semibold">{t('contact.mondayToSunday')}</p>
                  <p className="opacity-90">{t('contact.time')}</p>
                </div>
                <div>
                  <p className="font-semibold">{t('contact.responseTime')}</p>
                  <p className="opacity-90">{t('contact.responseTimeDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-800 via-slate-900 to-teal-900 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 text-6xl">🌴</div>
          <div className="absolute top-20 right-20 text-5xl">🥥</div>
          <div className="absolute bottom-10 left-1/4 text-7xl">🏝️</div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
              <span>🛵</span>
              Palm Riders
              <span>🌴</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Address */}
              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-3 text-teal-400">📍 Address</h4>
                <a
                  href="https://share.google/FPRmqYqvrZmQVVud4"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors block text-sm"
                >
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Blue Corner House<br />
                  <span className="ml-6">Barangay Pablacion 5</span><br />
                  <span className="ml-6">General Luna, 8419</span><br />
                  <span className="ml-6">Surigao del Norte</span>
                </a>
              </div>

              {/* Contact */}
              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-3 text-teal-400">📞 Contact</h4>
                <div className="text-slate-300 space-y-2 text-sm">
                  <div>
                    <a href="tel:+639457014440" className="hover:text-white transition-colors">
                      📞 +63 945 701 4440
                    </a>
                  </div>
                  <div>
                    <a
                      href="https://wa.me/639457014440"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-3 text-teal-400 flex items-center justify-center md:justify-start gap-2">
                  <Clock className="w-4 h-4" />
                  Opening Hours
                </h4>
                <div className="text-slate-300 space-y-1 text-sm">
                  <p className="font-medium text-white">Monday - Sunday</p>
                  <p className="text-lg font-bold text-teal-300">8:00 AM - 10:00 PM</p>
                  <p className="text-xs text-slate-400">Open 7 days a week</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="text-center md:text-left">
                <h4 className="font-semibold mb-3 text-teal-400">🌐 Follow Us</h4>
                <div className="flex flex-col space-y-2 text-sm">
                  {/* Facebook */}
                  <a
                    href="https://www.facebook.com/profile.php?id=61585650875574"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook</span>
                  </a>
                  {/* Instagram */}
                  <a
                    href="https://instagram.com/palmriders.siargao"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    <span>Instagram</span>
                  </a>
                  {/* Messenger */}
                  <a
                    href="https://m.me/61585650875574"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.91 1.444 5.508 3.729 7.206V22l3.405-1.868c.91.251 1.873.387 2.866.387 5.523 0 10-4.145 10-9.276S17.523 2 12 2zm.994 12.494l-2.546-2.715-4.969 2.715 5.467-5.803 2.609 2.715 4.906-2.715-5.467 5.803z"/>
                    </svg>
                    <span>Messenger</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-slate-700 pt-6 text-center">
              <p className="text-slate-400 text-sm mb-4">
                Explore the beautiful island of Siargao at your own pace
              </p>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                <a
                  href="/admin"
                  className="hover:text-slate-300 transition-colors"
                >
                  Admin Login
                </a>
                <span>|</span>
                <span>&copy; {new Date().getFullYear()} Palm Riders. All rights reserved.</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
