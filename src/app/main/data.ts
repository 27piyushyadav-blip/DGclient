export type VenueService = {
  id?: string;
  name: string;
  price: string;
  description?: string | null;
  image?: string | null;
  categoryId?: string | null;
};

export type LayoutSectionType = 'services' | 'categories' | 'staff' | 'products';

export type LayoutSection = {
  type: LayoutSectionType;
  title: string;
  services: string[];
};

export type VenueLayout = {
  horizontal1?: LayoutSection;
  horizontal2?: LayoutSection;
  vertical1?: LayoutSection;
  vertical2?: LayoutSection | string[];
  horizontal?: string[];
  vertical?: string[];
  vertical2Name?: string;
};

export function normalizeLayout(rawLayout: any): {
  horizontal1: LayoutSection;
  horizontal2: LayoutSection;
  vertical1: LayoutSection;
  vertical2: LayoutSection;
} {
  const defaultSections = {
    horizontal1: { type: 'services' as const, title: 'Our Services', services: [] },
    horizontal2: { type: 'staff' as const, title: 'Our Staffs', services: [] },
    vertical1: { type: 'services' as const, title: 'Menu', services: [] },
    vertical2: { type: 'products' as const, title: 'Products', services: [] },
  };

  if (!rawLayout || typeof rawLayout !== 'object') {
    return defaultSections;
  }

  const getSection = (key: string, fallbackType: LayoutSectionType, fallbackTitle: string): LayoutSection => {
    const rawSec = rawLayout[key];
    if (rawSec && typeof rawSec === 'object') {
      return {
        type: rawSec.type || fallbackType,
        title: rawSec.title || fallbackTitle,
        services: Array.isArray(rawSec.services) ? rawSec.services : [],
      };
    }
    return { type: fallbackType, title: fallbackTitle, services: [] };
  };

  const hasOldKeys = ('horizontal' in rawLayout && Array.isArray(rawLayout.horizontal)) ||
                      ('vertical' in rawLayout && Array.isArray(rawLayout.vertical)) ||
                      ('vertical2' in rawLayout && Array.isArray(rawLayout.vertical2));

  const hasNewKeys = 'horizontal1' in rawLayout || 'horizontal2' in rawLayout || 'vertical1' in rawLayout || 'vertical2' in rawLayout;

  if (hasOldKeys && !hasNewKeys) {
    return {
      horizontal1: {
        type: 'services',
        title: 'Our Services',
        services: Array.isArray(rawLayout.horizontal) ? rawLayout.horizontal : [],
      },
      horizontal2: {
        type: 'staff',
        title: 'Our Staffs',
        services: [],
      },
      vertical1: {
        type: 'services',
        title: 'Menu',
        services: Array.isArray(rawLayout.vertical) ? rawLayout.vertical : [],
      },
      vertical2: {
        type: 'products',
        title: rawLayout.vertical2Name || 'Products',
        services: Array.isArray(rawLayout.vertical2) ? rawLayout.vertical2 : [],
      },
    };
  }

  return {
    horizontal1: getSection('horizontal1', 'services', 'Our Services'),
    horizontal2: getSection('horizontal2', 'staff', 'Our Staffs'),
    vertical1: getSection('vertical1', 'services', 'Menu'),
    vertical2: getSection('vertical2', 'products', 'Products'),
  };
}

export type VenueCategory = {
  id: string;
  name: string;
  imageUrl?: string | null;
  price?: string | null;
  layout?: VenueLayout | null;
  image: string;
  durationMinutes?: number;
};

export type VenueStaff = {
  id?: string;
  name: string;
  role: string;
  image: string;
  services?: any[];
  experienceYears?: number;
  rating?: any;
};

export type VenueReview = {
  name: string;
  comment: string;
  time: string;
};

export type VenueFeature = {
  title: string;
  description: string;
};

export type Venue = {
  videoUrl?: string;
  industry?: string;
  id: string;
  userId?: string; // This is the organisation.id from the organisation table
  name: string;
  hours: string;
  address: string;
  accent: string;
  glow: string;
  bgImage: string;
  tagline: string;
  description: string;
  services: VenueService[];
  categories: VenueCategory[];
  showCategories: boolean;
  products: VenueService[];
  staff: VenueStaff[];
  reviews: VenueReview[];
  features: VenueFeature[];
  phone?: string;
  defaultLayout?: VenueLayout | null;
  logo?: string;
};

export const filters = {
  suburbs: ["Ascotvale", "Brunswick", "Docklands"],
  countries: ["Chinese", "Vietnam", "India"],
  staff: ["Male Therapist", "Female Therapist"],
};

export const venues: Venue[] = [
  {
    id: "lomi-massage",
    name: "Lomi Massage",
    hours: "9AM - 5PM",
    address: "318 Ascotvale Rd, Ascotvale",
    accent: "from-amber-950 via-amber-800 to-stone-900",
    glow: "from-amber-300/80 via-orange-200/30 to-transparent",
    bgImage: "url('/images/massage-1.jpg')",
    tagline: "Relax & Rejuvenate",
    description: "Experience the healing touch of our professional therapists in a calm and beautifully designed space.",
    services: [
      { name: "Swedish Massage", price: "$80", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=900&auto=format&fit=crop" },
      { name: "Deep Tissue Massage", price: "$120", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=900&auto=format&fit=crop" },
      { name: "Aromatherapy Massage", price: "$100", image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=900&auto=format&fit=crop" },
      { name: "Hot Stone Massage", price: "$130", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=900&auto=format&fit=crop" },
      { name: "Thai Massage", price: "$110", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=900&auto=format&fit=crop" },
    ],
    products: [
      { name: "Lavender Massage Oil", price: "$25", image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=900&auto=format&fit=crop" },
      { name: "Herbal Body Balm", price: "$32", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=900&auto=format&fit=crop" },
      { name: "Aroma Candle Set", price: "$18", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=900&auto=format&fit=crop" },
      { name: "Relax Bath Salt", price: "$22", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=900&auto=format&fit=crop" },
      { name: "Neck Heat Wrap", price: "$28", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=900&auto=format&fit=crop" },
    ],
    staff: [
      { name: "Sony", role: "Massage Therapist", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop" },
      { name: "Jessi", role: "Massage Therapist", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=600&auto=format&fit=crop" },
      { name: "Sami", role: "Massage Therapist", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop" },
    ],
    reviews: [
      { name: "Daniel K.", comment: "Amazing experience. The ambiance was so relaxing and the massage was pure bliss.", time: "2 days ago" },
      { name: "Emma R.", comment: "Professional and friendly staff. I felt so refreshed after the deep tissue massage.", time: "1 week ago" },
      { name: "Michael T.", comment: "Best massage service in Ascotvale. Clean environment and excellent customer care.", time: "2 weeks ago" },
    ],
    features: [
      { title: "Hygienic Environment", description: "Clean and safe for your comfort" },
      { title: "Professional Therapists", description: "Certified & experienced" },
      // { title: "Easy Booking", description: "Quick & hassle-free" },
      // { title: "Satisfaction Guaranteed", description: "We care about your wellbeing" },
    ],
    categories: [],
    showCategories: false,
  },
  {
    id: "tranquil-touch",
    name: "Tranquil Touch",
    hours: "9AM - 5PM",
    address: "215 Brunswick Road, Ascotvale 3032",
    accent: "from-stone-950 via-amber-900 to-orange-950",
    glow: "from-orange-300/70 via-yellow-200/20 to-transparent",
    bgImage: "url('/images/massage-1.jpg')",
    tagline: "Restore Your Balance",
    description: "A peaceful wellness stop for guests looking for restorative treatments and premium body care.",
    services: [
      { name: "Swedish Massage", price: "$75", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=900&auto=format&fit=crop" },
      { name: "Oil Massage", price: "$120", image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=900&auto=format&fit=crop" },
      { name: "Foot Therapy", price: "$60", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=900&auto=format&fit=crop" },
      { name: "Thai Massage", price: "$110", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=900&auto=format&fit=crop" },
      { name: "Back Relief", price: "$95", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=900&auto=format&fit=crop" },
    ],
    products: [
      { name: "Warm Herbal Oil", price: "$24", image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=900&auto=format&fit=crop" },
      { name: "Foot Care Cream", price: "$19", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=900&auto=format&fit=crop" },
      { name: "Muscle Relief Gel", price: "$27", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=900&auto=format&fit=crop" },
      { name: "Spa Towel Pack", price: "$16", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=900&auto=format&fit=crop" },
      { name: "Essential Oil Blend", price: "$30", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=900&auto=format&fit=crop" },
    ],
    staff: [
      { name: "Mila", role: "Senior Therapist", image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop" },
      { name: "Chris", role: "Wellness Specialist", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop" },
      { name: "Ava", role: "Massage Therapist", image: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop" },
    ],
    reviews: [
      { name: "Nina P.", comment: "Such a cozy place and really attentive staff. I’ll definitely come back.", time: "3 days ago" },
      { name: "Sam W.", comment: "The oil massage was fantastic and the booking process was smooth.", time: "5 days ago" },
      { name: "Priya J.", comment: "Very calm vibe with excellent service quality.", time: "2 weeks ago" },
    ],
    features: [
      { title: "Quiet Rooms", description: "A peaceful atmosphere throughout" },
      { title: "Skilled Team", description: "Experienced bodywork specialists" },
      // { title: "Fast Booking", description: "Reserve your slot in minutes" },
      // { title: "Wellness Focused", description: "Personalized care in every session" },
    ],
    categories: [],
    showCategories: false,
  },
  {
    id: "blissful-escape",
    name: "Blissful Escape",
    hours: "10AM - 11PM",
    address: "109 Melrose Drive, Ascotvale 3032",
    accent: "from-zinc-950 via-amber-900 to-stone-900",
    glow: "from-orange-200/70 via-amber-100/30 to-transparent",
    bgImage: "url('/images/massage-1.jpg')",
    tagline: "Feel Completely Renewed",
    description: "Modern spa treatments, soft lighting, and therapeutic care designed for complete relaxation.",
    services: [
      { name: "Deep Tissue", price: "$125", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=900&auto=format&fit=crop" },
      { name: "Couples Massage", price: "$180", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=900&auto=format&fit=crop" },
      { name: "Aromatherapy", price: "$95", image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=900&auto=format&fit=crop" },
      { name: "Hot Stone", price: "$135", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=900&auto=format&fit=crop" },
      { name: "Head Massage", price: "$55", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=900&auto=format&fit=crop" },
    ],
    products: [
      { name: "Luxury Face Serum", price: "$38", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=900&auto=format&fit=crop" },
      { name: "Rose Aroma Mist", price: "$21", image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=900&auto=format&fit=crop" },
      { name: "Spa Robe", price: "$45", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=900&auto=format&fit=crop" },
      { name: "Hot Stone Kit", price: "$34", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=900&auto=format&fit=crop" },
      { name: "Scalp Care Oil", price: "$26", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=900&auto=format&fit=crop" },
    ],
    staff: [
      { name: "Zara", role: "Spa Therapist", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop" },
      { name: "Luca", role: "Bodywork Therapist", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop" },
      { name: "Mina", role: "Massage Therapist", image: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?q=80&w=600&auto=format&fit=crop" },
    ],
    reviews: [
      { name: "Alex G.", comment: "Stylish setup and genuinely great staff. Loved the whole experience.", time: "Yesterday" },
      { name: "Rita S.", comment: "Hot stone session was worth every dollar.", time: "4 days ago" },
      { name: "Jon C.", comment: "One of the best wellness spots around.", time: "1 week ago" },
    ],
    features: [
      { title: "Premium Oils", description: "High-quality spa products" },
      { title: "Extended Hours", description: "Late evening sessions available" },
      // { title: "Easy Reschedule", description: "Flexible booking support" },
      // { title: "Client First", description: "Comfort-focused service approach" },
    ],
    categories: [],
    showCategories: false,
  },
  {
    id: "pure-relaxation",
    name: "Pure Relaxation",
    hours: "12AM - 7PM",
    address: "88 Baker Street, Ascotvale 3032",
    accent: "from-neutral-950 via-amber-900 to-black",
    glow: "from-orange-300/70 via-amber-100/30 to-transparent",
    bgImage: "url('/images/massage-1.jpg')",
    tagline: "Unwind In Comfort",
    description: "A warm and welcoming massage studio offering tailored sessions and soothing treatments.",
    services: [
      { name: "Relaxing Massage", price: "$85", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=900&auto=format&fit=crop" },
      { name: "Oil Massage", price: "$120", image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=900&auto=format&fit=crop" },
      { name: "Body Scrub", price: "$90", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=900&auto=format&fit=crop" },
      { name: "Thai Massage", price: "$105", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=900&auto=format&fit=crop" },
      { name: "Hot Stone", price: "$130", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=900&auto=format&fit=crop" },
    ],
    products: [
      { name: "Body Scrub Jar", price: "$23", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=900&auto=format&fit=crop" },
      { name: "Cooling Eye Mask", price: "$14", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=900&auto=format&fit=crop" },
      { name: "Thai Balm", price: "$20", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=900&auto=format&fit=crop" },
      { name: "Coconut Body Oil", price: "$29", image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=900&auto=format&fit=crop" },
      { name: "Stone Therapy Set", price: "$36", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=900&auto=format&fit=crop" },
    ],
    staff: [
      { name: "Anya", role: "Massage Therapist", image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop" },
      { name: "Bella", role: "Spa Therapist", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop" },
      { name: "Noah", role: "Therapy Specialist", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop" },
      { name: "Noah", role: "Therapy Specialist", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop" },
    ],
    reviews: [
      { name: "Sophie T.", comment: "Very comfortable setting and a lovely team.", time: "2 days ago" },
      { name: "Ben H.", comment: "Great treatment quality and a super clean environment.", time: "6 days ago" },
      { name: "Leah M.", comment: "I left feeling completely relaxed.", time: "9 days ago" },
    ],
    features: [
      { title: "Relaxing Setup", description: "Soft lighting and peaceful rooms" },
      { title: "Friendly Team", description: "Warm and attentive professionals" },
      // { title: "Smooth Booking", description: "Quick service confirmation" },
      // { title: "Trusted Care", description: "Comfort and hygiene prioritized" },
    ],
    categories: [],
    showCategories: false,
  },
];

export function getVenueById(id: string) {
  return venues.find((venue) => venue.id === id);
}

const ACCENT_PRESETS = [
  "from-amber-950 via-amber-800 to-stone-900",
  "from-stone-950 via-amber-900 to-orange-950",
  "from-zinc-950 via-amber-900 to-stone-900",
  "from-neutral-950 via-amber-900 to-black"
];

const GLOW_PRESETS = [
  "from-amber-300/80 via-orange-200/30 to-transparent",
  "from-orange-300/70 via-yellow-200/20 to-transparent",
  "from-orange-200/70 via-amber-100/30 to-transparent",
  "from-orange-300/70 via-amber-100/30 to-transparent"
];

const BG_IMAGE_PRESETS = [
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=2070&auto=format&fit=crop"
];

export function mapOrgToVenue(org: any, index: number = 0): Venue {
  const accent = ACCENT_PRESETS[index % ACCENT_PRESETS.length];
  const glow = GLOW_PRESETS[index % GLOW_PRESETS.length];

  // Use organization's cover image as background, fall back to preset image
  const bgImageUrl = org.coverImageUrl || BG_IMAGE_PRESETS[index % BG_IMAGE_PRESETS.length];

  // Build hours string from operatingHours, picking first non-closed weekday
  let hours = "9AM - 5PM";
  if (org.operatingHours && Array.isArray(org.operatingHours) && org.operatingHours.length > 0) {
    const open = org.operatingHours.find((h: any) => !h.is_closed);
    if (open) {
      const fmt = (t: string) => {
        const [hStr, mStr] = t.split(":");
        const h = parseInt(hStr, 10);
        const suffix = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 === 0 ? 12 : h % 12;
        return mStr === "00" ? `${h12}${suffix}` : `${h12}:${mStr}${suffix}`;
      };
      hours = `${fmt(open.open)} - ${fmt(open.close)}`;
    }
  }

  const services = (org.services || []).map((s: any) => ({
    id: s.id || s._id || s.name,
    name: s.name,
    price: `$${s.basePrice || 0}`,
    description: s.description || null,
    image: s.imageUrl || null,
    categoryId: s.categoryId || null,
  }));

  const categories: VenueCategory[] = (org.categories || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    imageUrl: c.imageUrl || null,
    price: c.price || null,
    layout: c.layout || null,
  }));

  const staff = (org.experts || []).map((e: any) => ({
    id: e.id || e._id,
    name: e.name,
    role: e.specialization || "Wellness Professional",
    image: e.profilePicture || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
    services: e.services || [],
    experienceYears: e.experienceYears || 0,
    rating: e.rating || 0,
  }));

  // const staff = (org.experts || []).map((e: any) => {
  //   const rawPic = e.profilePicture;
  //   const hasValidPic = rawPic && typeof rawPic === 'string' && !rawPic.endsWith('/null') && !rawPic.endsWith('/undefined') && !rawPic.endsWith('/uploads/null');
  //   return {
  //     id: e.id || e._id,
  //     name: e.name,
  //     role: e.specialization || "Wellness Professional",
  //     image: hasValidPic ? rawPic : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
  //     services: e.services || [],
  //     experienceYears: e.experienceYears || 0,
  //   };
  // });

  const reviews = (org.reviews && org.reviews.length > 0)
    ? org.reviews.map((r: any) => ({
        name: r.name,
        comment: r.comment,
        time: r.time,
      }))
    : [
        { name: "Daniel K.", comment: "Amazing experience. The ambiance was so relaxing and the sessions were pure bliss.", time: "2 days ago" },
        { name: "Emma R.", comment: "Professional and friendly staff. I felt so refreshed after the service.", time: "1 week ago" }
      ];

  // Use real products if the org has any, otherwise use fallback mock products
  const products = (org.products && org.products.length > 0)
    ? org.products.map((p: any) => ({
        name: p.name,
        price: p.price,
        image: p.image || "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=900&auto=format&fit=crop",
      }))
    : [
        { name: "Lavender Massage Oil", price: "$25", image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=900&auto=format&fit=crop" },
        { name: "Herbal Body Balm", price: "$32", image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=900&auto=format&fit=crop" },
        { name: "Aroma Candle Set", price: "$18", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=900&auto=format&fit=crop" },
        { name: "Relax Bath Salt", price: "$22", image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=900&auto=format&fit=crop" },
        { name: "Neck Heat Wrap", price: "$28", image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=900&auto=format&fit=crop" },
        { name: "Essential Oil Blend", price: "$30", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=900&auto=format&fit=crop" },
      ];

  // Use real features if the org has any, otherwise use fallback
  const features = (org.features && org.features.length > 0)
    ? org.features
    : [
        { title: "Hygienic Environment", description: "Clean and safe for your comfort" },
        { title: "Professional Experts", description: "Certified & experienced" },
      ];

  return {
    id: org._id,
    userId: org.userId, // This is the organisation.id from the organisation table
    name: org.name,
    logo: org.logo || org.logoUrl ,
    videoUrl: org.introVideo || undefined,
    hours,
    address: [org.location, org.city, org.state].filter(Boolean).join(", ") || "Online",
    phone: org.phone || org.phoneNumber || "+1 (555) 019-2834",
    accent,
    glow,
    bgImage: `url('${bgImageUrl}')`,
    tagline: org.tagline || (org.description ? org.description.slice(0, 40) + "..." : `${org.name} Wellness`),
    description: org.description || `Welcome to ${org.name}. Contact us to book our premium services.`,
    services,
    categories,
    showCategories: org.showCategories || false,
    products,
    staff,
    reviews,
    features,
    defaultLayout: org.defaultLayout || null,
    industry: org.industry,
  };
}
