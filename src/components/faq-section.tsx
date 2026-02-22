"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface FAQ {
  id: number;
  anchor?: string; // For deep links (e.g. Google Ads site links)
  question: string;
  answer: string;
  questionTl: string;
  answerTl: string;
}

const faqs: FAQ[] = [
  {
    id: 0,
    question: '⭐ How does it work?',
    questionTl: '⭐ Paano ito gumagana?',
    answer: `Step 1: Choose your scooter
Pick from Honda Beat, Honda Click, or Yamaha Fazzio. Clear prices, from ₱250/day. Every rental includes helmet, phone holder, full tank, and more.

Step 2: Pick your location on Google Maps
Select exactly where you want your scooter—airport, hotel, resort, surf spot, or anywhere on the island. Most rentals don't offer this! Pin your spot and we deliver there.

Step 3: Delivery and return
Fast delivery to your chosen location. Flexible return—drop off anywhere on the island. Simple!`,
    answerTl: `Step 1: Pumili ng scooter
Honda Beat, Honda Click, o Yamaha Fazzio. Malinaw ang presyo, mula ₱250/araw. Kasama ang helmet, phone holder, punong tangke, at marami pa.

Step 2: Piliin ang lokasyon sa Google Maps
Kung saan mo gusto ang scooter—airport, hotel, resort, surf spot, o kahit saan sa isla. Piliin ang spot at idedeliver namin doon.

Step 3: Delivery at return
Mabilis na delivery sa napili mong lugar. Flexible ang return—i-drop off kahit saan sa isla. Simple!`,
  },
  {
    id: 1,
    question: 'Is a deposit required?',
    questionTl: 'Kailangan ba ng deposit?',
    answer: 'No deposit is required. You can book and pay in full online, or pay when you collect your scooter. Simple and hassle-free.',
    answerTl: 'Hindi kailangan ng deposit. Pwede kang mag-book at magbayad ng buo online, o magbayad kapag kukunin mo ang scooter. Simple at walang hassle.',
  },
  {
    id: 2,
    question: 'What happens if the scooter breaks down?',
    questionTl: 'Ano ang mangyayari kung masira ang scooter?',
    answer: 'Contact us during our opening times (9:00 AM to 10:00 PM) and we will collect the scooter and provide a replacement at no extra charge. We maintain our fleet regularly to minimize breakdowns.',
    answerTl: 'Kontakin kami sa aming opening hours (9:00 AM hanggang 10:00 PM) at kukunin namin ang scooter at bibigyan ka ng kapalit nang libre. Regular naming ina-maintain ang aming mga scooter.',
  },
  {
    id: 14,
    question: '🪖 Is safety equipment included?',
    questionTl: '🪖 Kasama ba ang safety equipment?',
    answer: 'Free helmets and phone holders are included with every rental.',
    answerTl: 'Libreng helmet at phone holder kasama sa bawat upa.',
  },
  {
    id: 15,
    question: '📍 Do you offer pickup and delivery?',
    questionTl: '📍 Nag-aalok ba kayo ng pickup at delivery?',
    answer: 'We deliver islandwide. Just pick a location on the map or let our GPS do it for you, and we will deliver to that exact location.',
    answerTl: 'Nagdedeliver kami sa buong isla. Piliin lang ang lokasyon sa map o hayaan ang aming GPS na gawin ito para sa iyo, at idedeliver namin sa eksaktong lugar na iyon.',
  },
  {
    id: 3,
    question: 'Where can I ride the scooter?',
    questionTl: 'Saan ako pwedeng mag-ride ng scooter?',
    answer: 'You can ride anywhere on Siargao island! Popular destinations include Cloud 9, Sugba Lagoon, Magpupungko Rock Pools, Pacifico Beach, and the Three Islands. We provide a free route map with the best spots and safest roads.',
    answerTl: 'Pwede kang mag-ride kahit saan sa Siargao island! Popular na destinasyon ay Cloud 9, Sugba Lagoon, Magpupungko Rock Pools, Pacifico Beach, at Three Islands. Libre naming bibigyan ng map ng pinakamahusay na lugar.',
  },
  {
    id: 4,
    anchor: 'faq-insurance',
    question: 'What insurance options are available?',
    questionTl: 'Anong insurance options ang available?',
    answer: 'We offer 3 insurance options: Free (included with every rental), Basic at ₱50/day, and Premium at ₱100/day. Basic and Premium provide additional coverage for accidents and damages. Premium offers higher coverage limits. We strongly recommend at least Basic insurance.',
    answerTl: 'May 3 options: Libre (kasama sa bawat upa), Basic na ₱50/araw, at Premium na ₱100/araw. Ang Basic at Premium ay may dagdag na coverage para sa aksidente at damages. Mas mataas ang coverage ng Premium. Inirerekomenda naming ang kahit Basic insurance.',
  },
  {
    id: 5,
    question: 'What\'s included with the scooter rental?',
    questionTl: 'Ano ang kasama sa pag-upa ng scooter?',
    answer: 'Every rental includes: 1 helmet, basic toolkit, phone holder, and a full tank of gas. We also provide a map of Siargao with recommended routes and safety tips. Additional items like extra helmets, surf racks, and waterproof bags are available for rent.',
    answerTl: 'Bawat upa ay may kasamang: 1 helmet, basic toolkit, phone holder, at punong tangke ng gas. Mayroon ding libreng map ng Siargao kasama ang safety tips. May extra helmet, surf rack, at waterproof bag na pwedeng upahan.',
  },
  {
    id: 6,
    question: 'Can I extend my rental period?',
    questionTl: 'Pwede ko bang i-extend ang rental period?',
    answer: 'Absolutely! Just contact us via WhatsApp or phone at least 24 hours before your return date. Extensions are subject to scooter availability and can be added to your existing booking seamlessly.',
    answerTl: 'Syempre! I-contact lang kami sa WhatsApp o phone 24 oras bago ang return date. Ang extension ay depende sa availability ng scooter at madaling maidagdag sa iyong booking.',
  },
  {
    id: 7,
    question: 'What is your fuel policy?',
    questionTl: 'Ano ang fuel policy ninyo?',
    answer: 'We provide the scooter with a full tank of gas. You should return it with a full tank as well. If you return it with fuel bars missing on the fuel gauge, we charge ₱70 per bar missing. Gas stations are widely available in General Luna and other towns.',
    answerTl: 'Punong tangke ang binibigay namin. Dapat punong tangke din ang ibalik. Kung may bar na kulang sa fuel gauge, singil namin ay ₱70 bawat bar. Maraming gas station sa General Luna at ibang bayan.',
  },
  {
    id: 8,
    question: 'How does delivery work?',
    questionTl: 'Paano gumagana ang delivery?',
    answer: 'We offer island-wide delivery at ₱12.50 per kilometer (round trip). Simply select your location on the map during booking, and we\'ll bring the scooter to you. Popular delivery areas include Cloud 9, General Luna town, and Pacifico. Delivery is typically within 1-2 hours of booking confirmation.',
    answerTl: 'Nag-aalok kami ng delivery sa buong isla sa ₱12.50 bawat kilometro (round trip). Piliin lang ang iyong lokasyon sa map habang nag-book, at dadalhan ka namin. Karaniwang area ay Cloud 9, General Luna town, at Pacifico. Delivery ay 1-2 oras pagkatapos ng booking confirmation.',
  },
  {
    id: 9,
    anchor: 'faq-payments',
    question: 'What payment methods do you accept?',
    questionTl: 'Anong payment methods ang tinatanggap ninyo?',
    answer: 'We accept Cash, Credit Cards (Visa, Mastercard), GCash, and Cryptocurrency (USDC/BUSD on Polygon, Ethereum, or BSC). You can pay in full online or pay when you collect your scooter.',
    answerTl: 'Tumatanggap kami ng Cash, Credit Cards (Visa, Mastercard), GCash, at Cryptocurrency (USDC/BUSD sa Polygon, Ethereum, o BSC). Pwede kang magbayad ng buo online o magbayad kapag kukunin mo ang scooter.',
  },
  {
    id: 10,
    question: 'What are your operating hours?',
    questionTl: 'Ano ang inyong operating hours?',
    answer: 'We\'re open 7 days a week from 9:00 AM to 10:00 PM. Pickups and returns can be arranged within these hours. For breakdowns, contact us during opening times and we will collect the scooter and provide a replacement. WhatsApp: +63 945 701 4440.',
    answerTl: 'Bukas kami 7 days a week mula 9:00 AM hanggang 10:00 PM. Pwedeng mag-pickup at mag-return sa loob ng oras na ito. Para sa breakdown, kontakin kami sa opening times at kukunin namin ang scooter at bibigyan ng kapalit. WhatsApp: +63 945 701 4440.',
  },
  {
    id: 11,
    question: 'Can I cancel or modify my booking?',
    questionTl: 'Pwede ko bang i-cancel o baguhin ang booking?',
    answer: 'Yes! Free cancellation or modification up to 24 hours before pickup. Cancellations within 24 hours are subject to a 50% daily fee. No-shows may incur charges. Contact us via WhatsApp or email to make changes.',
    answerTl: 'Oo! Libre ang cancellation o modification hanggang 24 oras bago ang pickup. Ang cancellation na mas mababa sa 24 oras ay may 50% daily fee. Ang no-show ay maaaring magkaroon ng singil. Kontakin kami sa WhatsApp o email para sa changes.',
  },
  {
    id: 13,
    question: 'Do I need an international driver\'s license?',
    questionTl: 'Kailangan ko ba ng international driver\'s license?',
    answer: 'Yes, an international driver\'s license (IDP) or a valid Philippine driver\'s license is required. If you\'re a tourist, we highly recommend getting an IDP from your home country before traveling to the Philippines.',
    answerTl: 'Oo, kailangan ang international driver\'s license (IDP) o valid na Philippine driver\'s license. Kung turista ka, inirerekomenda naming kumuha ng IDP sa iyong bansa bago pumunta sa Pilipinas.',
  },
];

export function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(null);
  const { language, t } = useLanguage();

  const toggleFAQ = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  // FAQ Schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section id="faq" className="py-20 bg-white dark:bg-slate-900">
      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-emerald-400">
            {t('faq.title')}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              id={faq.anchor}
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow ${faq.anchor ? 'scroll-mt-24' : ''}`}
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 pr-8">
                  {language === 'tl' ? faq.questionTl : faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 transition-transform ${
                    openId === faq.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openId === faq.id && (
                <div className="px-6 pb-5 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-4 whitespace-pre-line">
                  {language === 'tl' ? faq.answerTl : faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center p-8 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-slate-800 dark:to-slate-700 rounded-xl border-2 border-teal-200 dark:border-teal-800">
          <h3 className="text-2xl font-bold mb-3 text-slate-800 dark:text-slate-200">
            {t('faq.stillQuestions')}
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            {t('faq.help247')}
          </p>
          <a
            href="https://wa.me/639457014440"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <span className="text-xl">💬</span>
            {t('faq.chatWhatsApp')}
          </a>
        </div>
      </div>
    </section>
  );
}
