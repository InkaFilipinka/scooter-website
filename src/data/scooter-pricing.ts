export interface PricingTier {
  minDays: number;
  maxDays: number | null;
  label: string;
  labelTl: string;
}

export interface ScooterPricing {
  id: string;
  name: string;
  image: string;
  features: string[];
  alt: string;
  // Pricing tiers (price per day)
  pricing: {
    days28Plus: number;  // 28+ days - Best Rate
    days20Plus: number;  // 20-27 days
    days10Plus: number;  // 10-19 days
    days3Plus: number;   // 3-9 days
    day1: number;        // 1-2 days
  };
}

export const pricingTiers: PricingTier[] = [
  { minDays: 28, maxDays: null, label: '28+ days (Best Rate)', labelTl: '28+ araw (Pinakamababang Presyo)' },
  { minDays: 20, maxDays: 27, label: '20-27 days', labelTl: '20-27 araw' },
  { minDays: 10, maxDays: 19, label: '10-19 days', labelTl: '10-19 araw' },
  { minDays: 3, maxDays: 9, label: '3-9 days', labelTl: '3-9 araw' },
  { minDays: 1, maxDays: 2, label: '1-2 days', labelTl: '1-2 araw' },
];

export const scooterPricing: ScooterPricing[] = [
  {
    id: 'honda-beat',
    name: 'Honda Beat',
    image: '/images/honda-beat.webp',
    features: ['Automatic', 'Fuel Efficient', 'Comfortable Seat', 'Under-seat Storage'],
    alt: 'Honda Beat scooter for rent in Siargao - automatic transmission, fuel efficient, perfect for island exploration',
    pricing: {
      days28Plus: 250,
      days20Plus: 275,
      days10Plus: 325,
      days3Plus: 375,
      day1: 425,
    },
  },
  {
    id: 'honda-click',
    name: 'Honda Click',
    image: '/images/honda-click.webp',
    features: ['160cc Engine', 'ABS Brakes', 'Digital Display', 'Spacious Storage'],
    alt: 'Honda Click 160cc scooter rental Siargao - premium features with ABS brakes and digital display',
    pricing: {
      days28Plus: 300,
      days20Plus: 325,
      days10Plus: 375,
      days3Plus: 425,
      day1: 475,
    },
  },
  {
    id: 'yamaha-fazzio',
    name: 'Yamaha Fazzio',
    image: '/images/yamaha-fazzio.webp',
    features: ['Stylish Design', '125cc Engine', 'LED Lights', 'USB Charging'],
    alt: 'Yamaha Fazzio 125cc scooter rental Siargao - stylish design with LED lights and USB charging port',
    pricing: {
      days28Plus: 325,
      days20Plus: 375,
      days10Plus: 425,
      days3Plus: 450,
      day1: 500,
    },
  },
];

// Helper function to get price per day based on rental duration
export function getPricePerDay(scooterId: string, days: number): number {
  const scooter = scooterPricing.find(s => s.id === scooterId);
  if (!scooter) return 0;

  if (days >= 28) return scooter.pricing.days28Plus;
  if (days >= 20) return scooter.pricing.days20Plus;
  if (days >= 10) return scooter.pricing.days10Plus;
  if (days >= 3) return scooter.pricing.days3Plus;
  return scooter.pricing.day1;
}

// Helper function to get the pricing tier label
export function getPricingTierLabel(days: number): string {
  if (days >= 28) return '28+ days (Best Rate)';
  if (days >= 20) return '20-27 days';
  if (days >= 10) return '10-19 days';
  if (days >= 3) return '3-9 days';
  return '1-2 days';
}

// Get the lowest price (for display on cards)
export function getLowestPrice(scooterId: string): number {
  const scooter = scooterPricing.find(s => s.id === scooterId);
  if (!scooter) return 0;
  return scooter.pricing.days28Plus;
}

// Get all pricing tiers for a scooter (for display)
export function getAllPricingTiers(scooterId: string): { tier: string; price: number }[] {
  const scooter = scooterPricing.find(s => s.id === scooterId);
  if (!scooter) return [];

  return [
    { tier: '28+ days', price: scooter.pricing.days28Plus },
    { tier: '20+ days', price: scooter.pricing.days20Plus },
    { tier: '10+ days', price: scooter.pricing.days10Plus },
    { tier: '3+ days', price: scooter.pricing.days3Plus },
    { tier: '1 day', price: scooter.pricing.day1 },
  ];
}
