"use client";

import { Check } from "lucide-react";
import { getLowestPrice, getAllPricingTiers } from "@/data/scooter-pricing";

interface Scooter {
  id: string;
  name: string;
  image: string;
  price: number;
  features: string[];
  alt?: string;
}

function getResponsiveImage(src: string) {
  switch (src) {
    case "/images/honda-beat.webp":
      return {
        src: "/images/honda-beat-376.webp",
        srcSet:
          "/images/honda-beat-376.webp 376w, /images/honda-beat-752.webp 752w, /images/honda-beat.webp 800w",
      };
    case "/images/honda-click.webp":
      return {
        src: "/images/honda-click-376.webp",
        srcSet: "/images/honda-click-376.webp 376w, /images/honda-click.webp 685w",
      };
    case "/images/yamaha-fazzio.webp":
      return {
        src: "/images/yamaha-fazzio-256.webp",
        srcSet:
          "/images/yamaha-fazzio-256.webp 256w, /images/yamaha-fazzio-512.webp 512w, /images/yamaha-fazzio.webp 800w",
        sizes: "(min-width: 1024px) 256px, (min-width: 768px) 256px, 50vw",
      };
    default:
      return { src };
  }
}

export function ScooterCard({ scooter }: { scooter: Scooter }) {
  const lowestPrice = getLowestPrice(scooter.id);
  const pricingTiers = getAllPricingTiers(scooter.id);
  const imgProps = getResponsiveImage(scooter.image);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-teal-100 hover:border-teal-300 flex flex-col h-full">
      <div className="relative h-64 bg-white">
        <img
          src={imgProps.src}
          srcSet={imgProps.srcSet}
          sizes={imgProps.sizes ?? "(min-width: 1024px) 376px, (min-width: 768px) 33vw, 100vw"}
          alt={scooter.alt || `${scooter.name} scooter available for rent in Siargao`}
          className="w-full h-full object-contain"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute top-3 right-3 text-3xl">🌴</div>
        <div className="absolute top-3 left-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          Best Rate: ₱{lowestPrice}/day
        </div>
      </div>
      <div className="p-6 relative flex flex-col flex-1">
        <div className="absolute top-0 right-4 text-2xl -mt-3">🥥</div>
        <h3 className="text-2xl font-bold mb-3 text-slate-800">{scooter.name}</h3>

        <div className="mb-4 p-3 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border border-teal-200">
          <div className="text-xs font-semibold text-slate-700 mb-2">Daily Rates (by rental length):</div>
          <div className="space-y-1">
            {pricingTiers.map((tier, index) => (
              <div
                key={tier.tier}
                className={`flex justify-between text-sm ${index === 0 ? 'font-bold text-teal-700' : 'text-slate-600'}`}
              >
                <span>{tier.tier} {index === 0 && '✨'}</span>
                <span>₱{tier.price}/day</span>
              </div>
            ))}
          </div>
        </div>

        <ul className="space-y-2 mb-6 flex-1">
          {scooter.features.map((feature, index) => (
            <li key={index} className="flex items-center text-slate-600">
              <Check className="w-5 h-5 text-emerald-500 mr-2 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <a
          href="#book"
          className="block w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white text-center font-bold py-3 px-6 rounded-lg transition-all shadow-md hover:shadow-lg mt-auto"
        >
          Book Now 🏖️
        </a>
      </div>
    </div>
  );
}