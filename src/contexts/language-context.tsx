"use client";
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
type Language = 'en' | 'tl';
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);
// Translations object
const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.scooters': { en: 'Scooters', tl: 'Mga Scooter' },
  'nav.services': { en: 'Services', tl: 'Mga Serbisyo' },
  'nav.reviews': { en: 'Reviews', tl: 'Mga Review' },
  'nav.faq': { en: 'FAQ', tl: 'FAQ' },
  'nav.blog': { en: 'Blog', tl: 'Blog' },
  'nav.book': { en: 'Book Now', tl: 'Mag-book Ngayon' },
  // Hero
  'hero.title': { en: 'Explore Siargao on Two Wheels', tl: 'Libutin ang Siargao sa Dalawang Gulong' },
  'hero.subtitle': { en: 'The Most Convenient Scooter Rental in Siargao', tl: 'Ang Pinaka-Convenient na Scooter Rental sa Siargao' },
  'hero.serving': { en: 'Book your scooter in minutes and select your pickup spot on Google Maps. We deliver anywhere in Siargao including General Luna, Dapa, Del Carmen and all island locations. Fast, flexible and hassle-free rentals for travelers.', tl: 'Mag-book ng scooter sa loob ng ilang minuto at piliin ang pickup spot sa Google Maps. Nagdedeliver kami kahit saan sa Siargao kasama ang General Luna, Dapa, Del Carmen at lahat ng island locations. Mabilis, flexible at walang hassle na rentals para sa mga traveler.' },
  'hero.bookButton': { en: 'Book Your Scooter Now', tl: 'Mag-book ng Scooter Ngayon' },
  // Scooters Section
  'scooters.title': { en: 'Our Fleet', tl: 'Aming Mga Scooter' },
  'scooters.subtitle': { en: 'Choose from our selection of well-maintained scooters', tl: 'Pumili mula sa aming mga maayos na scooter' },
  'scooters.perDay': { en: '/day', tl: '/araw' },
  'scooters.bookNow': { en: 'Book Now', tl: 'Mag-book' },
  // Services
  'services.title': { en: 'Our Services', tl: 'Aming Mga Serbisyo' },
  'services.subtitle': { en: 'Convenient delivery and pickup options', tl: 'Convenient na delivery at pickup' },
  'services.airport': { en: 'Airport Pickup & Drop-off', tl: 'Airport Pickup at Drop-off' },
  'services.airportDesc': { en: "We'll meet you at Siargao Airport and handle the drop-off when you leave. No hassle, just ride!", tl: 'Sasalubungin ka namin sa Siargao Airport at kami na ang mag-drop-off pag-alis mo. Walang hassle!' },
  'services.delivery': { en: 'Island-wide Delivery', tl: 'Delivery sa Buong Isla' },
  'services.deliveryDesc': { en: 'Delivery and pickup service available at 6.5 pesos per kilometer. We come to you anywhere in Siargao del Norte - General Luna, Dapa, Del Carmen and beyond!', tl: 'May delivery at pickup service sa 6.5 pesos bawat kilometro. Pupuntahan ka namin kahit saan sa Siargao del Norte - General Luna, Dapa, Del Carmen at iba pa!' },
  'services.fleet': { en: 'Well-Maintained Fleet', tl: 'Maayos na Mga Scooter' },
  'services.fleetDesc': { en: 'All our scooters are regularly serviced and in excellent condition for your safe journey around the island.', tl: 'Lahat ng aming mga scooter ay regular na siniservisyo at nasa magandang kondisyon para sa iyong ligtas na biyahe sa isla.' },
  // Booking Form
  'booking.title': { en: 'Book Your Ride', tl: 'Mag-book ng Iyong Sakay' },
  'booking.name': { en: 'Full Name', tl: 'Buong Pangalan' },
  'booking.email': { en: 'Email', tl: 'Email' },
  'booking.phone': { en: 'Phone Number', tl: 'Numero ng Telepono' },
  'booking.scooter': { en: 'Scooter Model', tl: 'Modelo ng Scooter' },
  'booking.selectScooter': { en: 'Select a scooter', tl: 'Pumili ng scooter' },
  'booking.startDate': { en: 'Start Date', tl: 'Petsa ng Simula' },
  'booking.endDate': { en: 'End Date', tl: 'Petsa ng Katapusan' },
  'booking.delivery': { en: 'Need Delivery Service for 6.5 PHP per km?', tl: 'Kailangan ba ng Delivery Service (6.5 PHP bawat km)?' },
  'booking.deliveryNo': { en: "No, I'll pick it up from Palm Riders", tl: 'Hindi, kukunin ko sa Palm Riders' },
  'booking.deliveryYes': { en: 'Yes', tl: 'Oo' },
  'booking.surfRack': { en: 'Add Surf Rack? (FREE!)', tl: 'Magdagdag ng Surf Rack? (LIBRE!)' },
  'booking.surfRackNo': { en: 'No, thanks', tl: 'Hindi, salamat' },
  'booking.surfRackYes': { en: 'Yes, add surf rack 🏄', tl: 'Oo, magdagdag ng surf rack 🏄' },
  'booking.total': { en: 'Estimated Total', tl: 'Tinatayang Kabuuan' },
  'booking.submit': { en: '🏝️ Submit Booking & Pay 🌴', tl: '🏝️ Magpadala ng Booking at Magbayad 🌴' },
  // Payment
  'payment.option': { en: 'Payment Option', tl: 'Pagpipilian sa Pagbabayad' },
  'payment.full': { en: 'Pay in Full', tl: 'Bayaran ng Buo' },
  'payment.fullDesc': { en: 'Complete payment now - Total:', tl: 'Kumpletuhin ang bayad ngayon - Kabuuan:' },
  'payment.deposit': { en: 'Pay Deposit to Reserve', tl: 'Magbayad ng Deposito para Mag-reserve' },
  'payment.depositDesc': { en: 'Reserve now with deposit (1 day rent):', tl: 'Mag-reserve ngayon gamit ang deposito (1 araw na upa):' },
  'payment.method': { en: 'Payment Method', tl: 'Paraan ng Pagbabayad' },
  'payment.selectMethod': { en: 'Select payment method', tl: 'Pumili ng paraan ng pagbabayad' },
  'payment.creditCard': { en: 'Credit Card', tl: 'Credit Card' },
  'payment.crypto': { en: 'Cryptocurrency', tl: 'Cryptocurrency' },
  'payment.gcash': { en: 'GCash', tl: 'GCash' },
  // Pricing
  'pricing.title': { en: 'Transparent Pricing', tl: 'Malinaw na Presyo' },
  'pricing.daily': { en: 'Daily Rental Rates', tl: 'Presyo ng Pag-upa' },
  'pricing.dailyAmount': { en: 'From 250 pesos per day', tl: 'Mula 250 pesos bawat araw' },
  'pricing.deliveryService': { en: 'Delivery Service', tl: 'Delivery Service' },
  'pricing.deliveryAmount': { en: '6.5 pesos per kilometer', tl: '6.5 pesos bawat kilometro' },
  // Booking
  'booking.weAccept': { en: 'We Accept', tl: 'Tumatanggap Kami' },
  'booking.subtitle': { en: "Fill out the form below and we'll get back to you shortly", tl: 'Punan ang form at babalikan ka namin' },
  // Contact
  'contact.title': { en: 'Get In Touch', tl: 'Makipag-ugnayan' },
  'contact.subtitle': { en: 'Have questions? Need immediate assistance? Contact us directly!', tl: 'May tanong? Kailangan ng tulong? Kontakin kami!' },
  'contact.whatsapp': { en: 'WhatsApp Us', tl: 'Mag-WhatsApp' },
  'contact.whatsappDesc': { en: 'Instant replies, fast booking', tl: 'Mabilis na reply, mabilis na booking' },
  'contact.whatsappClick': { en: 'Click to chat now →', tl: 'Click para mag-chat →' },
  'contact.call': { en: 'Call Us', tl: 'Tumawag' },
  'contact.callDesc': { en: 'Speak with our team directly', tl: 'Makipag-usap sa amin' },
  'contact.callTap': { en: 'Tap to call →', tl: 'Tap para tumawag →' },
  'contact.hours': { en: 'Operating Hours', tl: 'Oras ng Operasyon' },
  'contact.mondayToSunday': { en: 'Monday - Sunday 📅', tl: 'Lunes - Linggo 📅' },
  'contact.time': { en: '8:00 AM - 8:00 PM', tl: '8:00 AM - 8:00 PM' },
  'contact.responseTime': { en: 'Response Time ⚡', tl: 'Oras ng Pagsagot ⚡' },
  'contact.responseTimeDesc': { en: 'Usually within 15 minutes', tl: 'Karaniwang 15 minuto' },
  // Reviews
  'reviews.title': { en: 'What Our Customers Say', tl: 'Ano ang Sabi ng Aming mga Customer' },
  'reviews.subtitle': { en: 'Real reviews from real riders', tl: 'Tunay na reviews mula sa tunay na riders' },
  'reviews.basedOn': { en: 'Based on 12 reviews', tl: 'Base sa 12 reviews' },
  'reviews.avgRating': { en: 'Average Rating', tl: 'Average na Rating' },
  'reviews.happyRiders': { en: 'Happy Riders', tl: 'Masayang Riders' },
  'reviews.countries': { en: 'Countries', tl: 'mga Bansa' },
  'reviews.satisfaction': { en: 'Satisfaction', tl: 'Kasiyahan' },
  // FAQ
  'faq.title': { en: 'Frequently Asked Questions', tl: 'Mga Madalas Itanong' },
  'faq.subtitle': { en: 'Everything you need to know about renting with us', tl: 'Lahat ng kailangan mong malaman tungkol sa pag-upa' },
  'faq.stillQuestions': { en: 'Still have questions?', tl: 'May iba pang tanong?' },
  'faq.help247': { en: "Contact us during opening times and we'll help you!", tl: 'Kontakin kami sa opening hours at tutulungan ka namin!' },
  'faq.chatWhatsApp': { en: 'Chat on WhatsApp', tl: 'Mag-chat sa WhatsApp' },
  // Footer
  'footer.address': { en: 'Address', tl: 'Address' },
  'footer.contact': { en: 'Contact', tl: 'Kontak' },
  'footer.explore': { en: 'Explore the beautiful island of Siargao at your own pace', tl: 'Libutin ang magandang isla ng Siargao sa iyong sariling bilis' },
  'footer.adminLogin': { en: 'Admin Login', tl: 'Admin Login' },
  'footer.rights': { en: 'All rights reserved.', tl: 'Lahat ng karapatan ay nakalaan.' },
};
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  useEffect(() => {
    // Load language from localStorage
    const saved = localStorage.getItem('language') as Language;
    if (saved === 'en' || saved === 'tl') {
      setLanguageState(saved);
    }
  }, []);
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };
  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
