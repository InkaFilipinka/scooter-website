export interface AddOn {
  id: string;
  name: string;
  nameTl: string;
  description: string;
  descriptionTl: string;
  price: number;
  icon: string;
  perDay: boolean;
  isFree?: boolean;
}

export const addOns: AddOn[] = [
  // FREE ADD-ONS
  {
    id: 'extra-helmet',
    name: 'Extra Helmet',
    nameTl: 'Extra Helmet',
    description: 'Free helmet for your passenger',
    descriptionTl: 'Libreng helmet para sa passenger',
    price: 0,
    icon: '🪖',
    perDay: false,
    isFree: true,
  },
  {
    id: 'driving-lesson',
    name: 'Free 30-Min Driving Lesson',
    nameTl: 'Libreng 30-Min Driving Lesson',
    description: 'Perfect for beginners - we teach you to ride!',
    descriptionTl: 'Para sa mga baguhan - tuturuan ka naming mag-ride!',
    price: 0,
    icon: '🎓',
    perDay: false,
    isFree: true,
  },
  {
    id: 'phone-holder',
    name: 'Phone Holder',
    nameTl: 'Phone Holder',
    description: 'Secure mount for navigation (included with all rentals)',
    descriptionTl: 'Secure mount para sa navigation (kasama sa lahat ng rental)',
    price: 0,
    icon: '📱',
    perDay: false,
    isFree: true,
  },
  // PAID ADD-ONS
  {
    id: 'waterproof-bag',
    name: 'Waterproof Bag (5L)',
    nameTl: 'Waterproof Bag (5L)',
    description: 'Keep your belongings dry',
    descriptionTl: 'Para hindi mabasa ang gamit',
    price: 250,
    icon: '🎒',
    perDay: false,
  },
  {
    id: 'sim-card-8gb',
    name: 'Filipino SIM Card (8GB)',
    nameTl: 'Filipino SIM Card (8GB)',
    description: '8GB data, valid for 15 days',
    descriptionTl: '8GB data, valid for 15 days',
    price: 450,
    icon: '📶',
    perDay: false,
  },
  {
    id: 'sim-card-15gb',
    name: 'Filipino SIM Card (15GB)',
    nameTl: 'Filipino SIM Card (15GB)',
    description: '15GB data, valid for 30 days',
    descriptionTl: '15GB data, valid for 30 days',
    price: 700,
    icon: '📶',
    perDay: false,
  },
  {
    id: 'gopro',
    name: 'GoPro Camera',
    nameTl: 'GoPro Camera',
    description: 'Capture your adventures',
    descriptionTl: 'Record ng adventure',
    price: 500,
    icon: '📹',
    perDay: true,
  },
  {
    id: 'surf-rack',
    name: 'Surf Rack',
    nameTl: 'Surf Rack',
    description: 'Carry your surfboard safely (FREE!)',
    descriptionTl: 'Para sa surfboard (LIBRE!)',
    price: 0,
    icon: '🏄',
    perDay: false,
    isFree: true,
  },
];
