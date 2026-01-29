"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  questionTl: string;
  answerTl: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    question: 'Do I need an international driver\'s license?',
    questionTl: 'Kailangan ko ba ng international driver\'s license?',
    answer: 'Yes, an international driver\'s license (IDP) or a valid Philippine driver\'s license is required. If you\'re a tourist, we highly recommend getting an IDP from your home country before traveling to the Philippines.',
    answerTl: 'Oo, kailangan ang international driver\'s license (IDP) o valid na Philippine driver\'s license. Kung turista ka, inirerekomenda naming kumuha ng IDP sa iyong bansa bago pumunta sa Pilipinas.',
  },
  {
    id: 2,
    question: 'What happens if the scooter breaks down?',
    questionTl: 'Ano ang mangyayari kung masira ang scooter?',
    answer: 'We provide 24/7 roadside assistance! If you experience any mechanical issues, call us immediately and we\'ll either fix it on-site or provide a replacement scooter at no extra charge. We maintain our fleet regularly to minimize breakdowns.',
    answerTl: 'Nagbibigay kami ng 24/7 roadside assistance! Kung may problema sa makina, tumawag agad at aayusin namin o bibigyan ka ng kapalit na scooter nang libre. Regular naming ina-maintain ang aming mga scooter.',
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
    question: 'Is insurance included in the rental?',
    questionTl: 'Kasama ba ang insurance sa upa?',
    answer: 'Basic coverage is included for mechanical failures. However, we strongly recommend adding our Premium Insurance Package (₱200/day) which covers accidents, theft, and damages. You\'re responsible for damages without insurance.',
    answerTl: 'Kasama ang basic coverage para sa mechanical failures. Pero inirerekomenda namin ang Premium Insurance Package (₱200/bawat araw) na sumasaklaw sa aksidente, pagnanakaw, at damages. Ikaw ang responsable sa damages kung walang insurance.',
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
    answer: 'We provide the scooter with a full tank of gas. You should return it with a full tank as well. If you return it with less fuel, we\'ll charge ₱100 per liter for the missing fuel. Gas stations are widely available in General Luna and other towns.',
    answerTl: 'Punong tangke ang binibigay namin. Dapat punong tangke din ang ibalik. Kung kulang ang gas, singil namin ay ₱100 bawat litro. Maraming gas station sa General Luna at ibang bayan.',
  },
  {
    id: 8,
    question: 'How does delivery work?',
    questionTl: 'Paano gumagana ang delivery?',
    answer: 'We offer island-wide delivery at ₱6.50 per kilometer (round trip). Simply select your location on the map during booking, and we\'ll bring the scooter to you. Popular delivery areas include Cloud 9, General Luna town, and Pacifico. Delivery is typically within 1-2 hours of booking confirmation.',
    answerTl: 'Nag-aalok kami ng delivery sa buong isla sa ₱6.50 bawat kilometro (round trip). Piliin lang ang iyong lokasyon sa map habang nag-book, at dadalhan ka namin. Karaniwang area ay Cloud 9, General Luna town, at Pacifico. Delivery ay 1-2 oras pagkatapos ng booking confirmation.',
  },
  {
    id: 9,
    question: 'What payment methods do you accept?',
    questionTl: 'Anong payment methods ang tinatanggap ninyo?',
    answer: 'We accept Credit Cards (Visa, Mastercard), GCash, and Cryptocurrency (USDC/BUSD on Polygon, Ethereum, or BSC). You can pay in full or pay a deposit to reserve your scooter. Full payment is required upon pickup if you choose the deposit option.',
    answerTl: 'Tumatanggap kami ng Credit Cards (Visa, Mastercard), GCash, at Cryptocurrency (USDC/BUSD sa Polygon, Ethereum, o BSC). Pwede kang magbayad ng buo o magbayad ng deposit para mag-reserve. Kailangan ang full payment sa pickup kung pipiliin mo ang deposit option.',
  },
  {
    id: 10,
    question: 'What are your operating hours?',
    questionTl: 'Ano ang inyong operating hours?',
    answer: 'We\'re open 7 days a week from 7:00 AM to 9:00 PM. Pickups and returns can be arranged within these hours. For emergencies or roadside assistance, we\'re available 24/7 via WhatsApp at +63 945 701 4440.',
    answerTl: 'Bukas kami 7 days a week mula 7:00 AM hanggang 9:00 PM. Pwedeng mag-pickup at mag-return sa loob ng oras na ito. Para sa emergency o roadside assistance, available kami 24/7 sa WhatsApp: +63 945 701 4440.',
  },
  {
    id: 11,
    question: 'Can I cancel or modify my booking?',
    questionTl: 'Pwede ko bang i-cancel o baguhin ang booking?',
    answer: 'Yes! Free cancellation or modification up to 24 hours before pickup. Cancellations within 24 hours are subject to a 50% fee. No-shows forfeit the full deposit. Contact us via WhatsApp or email to make changes.',
    answerTl: 'Oo! Libre ang cancellation o modification hanggang 24 oras bago ang pickup. Ang cancellation na mas mababa sa 24 oras ay may 50% fee. Ang no-show ay mawawalan ng full deposit. Kontakin kami sa WhatsApp o email para sa changes.',
  },
  {
    id: 12,
    question: 'Is there a security deposit?',
    questionTl: 'May security deposit ba?',
    answer: 'Yes, we require a ₱5,000 security deposit (cash or hold on credit card) at pickup. This covers potential damages or violations. The deposit is fully refundable upon returning the scooter in good condition. With Premium Insurance, the deposit is reduced to ₱2,000.',
    answerTl: 'Oo, kailangan ng ₱5,000 security deposit (cash o hold sa credit card) sa pickup. Ito ay para sa damages o violations. Fully refundable ito kung maibalik ang scooter na maayos. Sa Premium Insurance, ang deposit ay ₱2,000 na lang.',
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
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow"
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
                <div className="px-6 pb-5 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-700 pt-4">
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
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <span className="text-xl">💬</span>
            {t('faq.chatWhatsApp')}
          </a>
        </div>
      </div>
    </section>
  );
}
