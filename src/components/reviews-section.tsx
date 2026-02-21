"use client";

import { Star, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { GoogleReviewsWidget } from '@/components/google-reviews-widget';

const googleReviewsUrl = process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL;

interface Review {
  id: number;
  name: string;
  country: string;
  rating: number;
  date: string;
  comment: string;
  avatar: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: 'Sarah Mitchell',
    country: 'Australia',
    rating: 5,
    date: 'December 2024',
    comment: 'Absolute legend who delivered my scooter! Phone holder was spot on.',
    avatar: '🇦🇺',
  },
  {
    id: 2,
    name: 'Jake Thompson',
    country: 'USA',
    rating: 5,
    date: 'December 2024',
    comment: 'Best rental experience in Southeast Asia. Guy was patient while I practiced (first timer). Phone holder saved my life for navigation. Get the waterproof bag!',
    avatar: '🇺🇸',
  },
  {
    id: 3,
    name: 'Maria Santos',
    country: 'Philippines',
    rating: 5,
    date: 'November 2024',
    comment: 'Sobrang bait nung nag-deliver! Hinintay pa ako mag-practice. Honda Click ang swabe, may USB charger pa. Nag-extend ako 3 days kasi ayaw ko na ibalik haha. Surf rack perfect sa board ko!',
    avatar: '🇵🇭',
  },
  {
    id: 4,
    name: 'Emma Zhang',
    country: 'Singapore',
    rating: 4,
    date: 'November 2024',
    comment: 'Great service! Minor scratches but ran perfectly. Friendly delivery guy gave me a lesson. Phone holder pre-installed. Only issue: limited helmet sizes.',
    avatar: '🇸🇬',
  },
  {
    id: 5,
    name: 'Lars Andersson',
    country: 'Sweden',
    rating: 5,
    date: 'October 2024',
    comment: 'Jättebra! Delivery guy was hilarious, recommended amazing mango shake place. Flat tire on day 7, fixed in 30 minutes. Phone mount super sturdy.',
    avatar: '🇸🇪',
  },
  {
    id: 6,
    name: 'Camila Rodrigues',
    country: 'Brazil',
    rating: 5,
    date: 'October 2024',
    comment: 'Perfeito! Muito gentil.',
    avatar: '🇧🇷',
  },
  {
    id: 7,
    name: 'David Kim',
    country: 'South Korea',
    rating: 5,
    date: 'September 2024',
    comment: '정말 좋았어요! 직원분이 영어 못해도 친절하게 도와주셨어요. 오프라인 지도도 같이 다운받아주시고. 폰 홀더 이미 설치되어 있었고, 연비도 좋았어요. 5일동안 기름 두번만 넣었어요!',
    avatar: '🇰🇷',
  },
  {
    id: 8,
    name: 'Tom O\'Connor',
    country: 'Ireland',
    rating: 5,
    date: 'September 2024',
    comment: 'Brilliant craic! Chatted for ages about surf spots. Showed me how to mount my GoPro. Scooter ran like a dream even in the rain. Fair play!',
    avatar: '🇮🇪',
  },
  {
    id: 9,
    name: 'Amelie Dubois',
    country: 'France',
    rating: 4,
    date: 'August 2024',
    comment: 'Très bien! Le scooter était un peu petit pour moi mais ça allait. Support téléphone très pratique. Prolongation par WhatsApp super facile. Moins une étoile car le siège devient très chaud au soleil.',
    avatar: '🇫🇷',
  },
  {
    id: 10,
    name: 'Chris Anderson',
    country: 'Canada',
    rating: 5,
    date: 'August 2024',
    comment: 'Guy gave me a full tutorial - gas tank, steering lock, adjusted mirrors. Phone mount clutch for finding beaches. Helmet actually fit properly!',
    avatar: '🇨🇦',
  },
  {
    id: 11,
    name: 'Priya Patel',
    country: 'India',
    rating: 5,
    date: 'July 2024',
    comment: 'बहुत प्यारे और धैर्यवान! मैं डरी हुई थी पर उन्होंने मुझे हिम्मत दी। फोन होल्डर बहुत बढ़िया - खराब सड़कों पर भी नहीं हिला! Magpupungko तक बिना किसी परेशानी चलाया। वाटरप्रूफ बैग ने मेरा कैमरा बचाया!',
    avatar: '🇮🇳',
  },
  {
    id: 12,
    name: 'Marcus Silva',
    country: 'Portugal',
    rating: 5,
    date: 'July 2024',
    comment: 'Serviço impecável! O cara era super engraçado e ajustou o banco pra mim. Yamaha Fazzio muito confortável até Pilar. Quando devolvi, ele lembrou de mim e perguntou da viagem. Toque pessoal incrível!',
    avatar: '🇵🇹',
  },
];

export function ReviewsSection() {
  const { t } = useLanguage();

  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  // Review Schema for SEO
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Palm Riders",
    "url": "https://siargaoscooterrentals.com",
    "telephone": "+639457014440",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Blue Corner House, Barangay Pablacion 5",
      "addressLocality": "General Luna",
      "postalCode": "8419",
      "addressRegion": "Surigao del Norte",
      "addressCountry": "PH"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": averageRating.toFixed(1),
      "reviewCount": reviews.length,
      "bestRating": "5",
      "worstRating": "1"
    },
    "review": reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.name
      },
      "datePublished": review.date,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating,
        "bestRating": "5",
        "worstRating": "1"
      },
      "reviewBody": review.comment
    }))
  };

  return (
    <section id="reviews" className="py-20 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
      {/* Review Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent dark:from-teal-400 dark:to-emerald-400">
            {t('reviews.title')}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">
            {t('reviews.subtitle')}
          </p>

          {/* Average Rating - only when using static reviews */}
          {!process.env.NEXT_PUBLIC_ELFSIGHT_WIDGET_ID && (
            <>
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.floor(averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('reviews.basedOn')}
              </p>
            </>
          )}
        </div>

        {/* Live Google Reviews Widget (when configured) or static reviews fallback */}
        {process.env.NEXT_PUBLIC_ELFSIGHT_WIDGET_ID ? (
          <GoogleReviewsWidget />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-slate-200 dark:border-slate-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{review.avatar}</div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{review.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{review.country}</p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                ))}
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">{review.date}</span>
              </div>

              {/* Comment */}
              <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                "{review.comment}"
              </p>
            </div>
          ))}
        </div>
        )}

        {/* View on Google link - show when GBP URL is set (widget or static) */}
        {googleReviewsUrl && (
          <div className="mt-8 text-center">
            <a
              href={googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-teal-700 dark:text-teal-400 font-semibold hover:underline"
            >
              {t('reviews.viewOnGoogle')}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
