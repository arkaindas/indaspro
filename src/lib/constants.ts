export const SERVICE_CATEGORIES = [
  { id: 'electrician', nameBn: 'ইলেকট্রিশিয়ান', nameEn: 'Electrician', icon: '⚡', sortOrder: 1 },
  { id: 'plumber', nameBn: 'প্লাম্বার', nameEn: 'Plumber', icon: '🔧', sortOrder: 2 },
  { id: 'carpenter', nameBn: 'কাঠমিস্ত্রি', nameEn: 'Carpenter', icon: '🪚', sortOrder: 3 },
  { id: 'ac_appliance', nameBn: 'এসি ও যন্ত্র মেরামত', nameEn: 'AC & Appliance', icon: '❄️', sortOrder: 4 },
  { id: 'cleaning', nameBn: 'ঘর পরিষ্কার', nameEn: 'Home Cleaning', icon: '🧹', sortOrder: 5 },
  { id: 'pest_control', nameBn: 'পোকামাকড় দমন', nameEn: 'Pest Control', icon: '🐛', sortOrder: 6 },
  { id: 'beautician', nameBn: 'বিউটিশিয়ান', nameEn: 'Beautician', icon: '💅', sortOrder: 7 },
  { id: 'painter', nameBn: 'রঙমিস্ত্রি', nameEn: 'Painter', icon: '🎨', sortOrder: 8 },
];

export const SERVICES = [
  // Electrician
  { id: 'fan_installation', categoryId: 'electrician', nameBn: 'ফ্যান লাগানো', nameEn: 'Fan Installation', descriptionBn: 'সিলিং ফ্যান লাগানো, পুরানো ফ্যান খোলা সহ', basePrice: 249, durationMinutes: 45 },
  { id: 'switchboard_repair', categoryId: 'electrician', nameBn: 'সুইচবোর্ড মেরামত', nameEn: 'Switchboard Repair', descriptionBn: 'সুইচবোর্ড মেরামত বা পরিবর্তন', basePrice: 199, durationMinutes: 30 },
  { id: 'wiring_per_point', categoryId: 'electrician', nameBn: 'ওয়্যারিং (প্রতি পয়েন্ট)', nameEn: 'Wiring (per point)', descriptionBn: 'নতুন বৈদ্যুতিক পয়েন্ট স্থাপন', basePrice: 149, durationMinutes: 30 },
  { id: 'mcb_fuse', categoryId: 'electrician', nameBn: 'MCB/ফিউজ বদলানো', nameEn: 'MCB/Fuse Replacement', descriptionBn: 'MCB বা ফিউজ পরীক্ষা ও পরিবর্তন', basePrice: 129, durationMinutes: 20 },
  { id: 'inverter_ups', categoryId: 'electrician', nameBn: 'ইনভার্টার/UPS লাগানো', nameEn: 'Inverter/UPS Installation', descriptionBn: 'ইনভার্টার বা UPS স্থাপন ও সংযোগ', basePrice: 399, durationMinutes: 60 },
  // Plumber
  { id: 'tap_repair', categoryId: 'plumber', nameBn: 'কল মেরামত', nameEn: 'Tap Repair', descriptionBn: 'কল লিক বা জ্যাম মেরামত', basePrice: 149, durationMinutes: 30 },
  { id: 'pipe_leak', categoryId: 'plumber', nameBn: 'পাইপ লিক মেরামত', nameEn: 'Pipe Leak Fix', descriptionBn: 'পাইপ লিক সনাক্ত ও মেরামত', basePrice: 199, durationMinutes: 45 },
  { id: 'toilet_repair', categoryId: 'plumber', nameBn: 'টয়লেট মেরামত', nameEn: 'Toilet Repair', descriptionBn: 'ফ্লাশ, সিট বা পাইপ মেরামত', basePrice: 249, durationMinutes: 45 },
  { id: 'water_tank', categoryId: 'plumber', nameBn: 'জলের ট্যাংক পরিষ্কার', nameEn: 'Water Tank Cleaning', descriptionBn: 'ওভারহেড বা আন্ডারগ্রাউন্ড ট্যাংক পরিষ্কার', basePrice: 499, durationMinutes: 90 },
  // Carpenter
  { id: 'furniture_repair', categoryId: 'carpenter', nameBn: 'আসবাবপত্র মেরামত', nameEn: 'Furniture Repair', descriptionBn: 'চেয়ার, টেবিল, খাট মেরামত', basePrice: 199, durationMinutes: 45 },
  { id: 'door_fix', categoryId: 'carpenter', nameBn: 'দরজা মেরামত', nameEn: 'Door Fix', descriptionBn: 'দরজা ঠিক করা, কব্জা বদলানো', basePrice: 249, durationMinutes: 45 },
  { id: 'cupboard_install', categoryId: 'carpenter', nameBn: 'আলমারি লাগানো', nameEn: 'Cupboard Installation', descriptionBn: 'দেওয়ালে আলমারি বা শেল্ফ লাগানো', basePrice: 399, durationMinutes: 90 },
  // AC & Appliance
  { id: 'ac_service', categoryId: 'ac_appliance', nameBn: 'এসি সার্ভিসিং', nameEn: 'AC Service', descriptionBn: 'এসি পরিষ্কার, গ্যাস চার্জ, মেরামত', basePrice: 449, durationMinutes: 60 },
  { id: 'washing_machine', categoryId: 'ac_appliance', nameBn: 'ওয়াশিং মেশিন মেরামত', nameEn: 'Washing Machine Repair', descriptionBn: 'ওয়াশিং মেশিন সমস্যা সনাক্ত ও মেরামত', basePrice: 349, durationMinutes: 60 },
  { id: 'fridge_repair', categoryId: 'ac_appliance', nameBn: 'ফ্রিজ মেরামত', nameEn: 'Refrigerator Repair', descriptionBn: 'ফ্রিজ ঠান্ডা না হওয়া, গ্যাস লিক মেরামত', basePrice: 399, durationMinutes: 60 },
  { id: 'geyser_repair', categoryId: 'ac_appliance', nameBn: 'গিজার মেরামত', nameEn: 'Geyser Repair', descriptionBn: 'গিজার মেরামত ও সার্ভিসিং', basePrice: 299, durationMinutes: 45 },
  // Home Cleaning
  { id: 'full_home_clean', categoryId: 'cleaning', nameBn: 'সম্পূর্ণ ঘর পরিষ্কার', nameEn: 'Full Home Cleaning', descriptionBn: '2-3 BHK ঘর সম্পূর্ণ পরিষ্কার', basePrice: 999, durationMinutes: 180 },
  { id: 'bathroom_clean', categoryId: 'cleaning', nameBn: 'বাথরুম পরিষ্কার', nameEn: 'Bathroom Cleaning', descriptionBn: 'বাথরুম গভীর পরিষ্কার ও জীবাণুমুক্ত', basePrice: 299, durationMinutes: 45 },
  { id: 'kitchen_clean', categoryId: 'cleaning', nameBn: 'রান্নাঘর পরিষ্কার', nameEn: 'Kitchen Cleaning', descriptionBn: 'রান্নাঘর, চিমনি, সিংক গভীর পরিষ্কার', basePrice: 399, durationMinutes: 60 },
  { id: 'sofa_clean', categoryId: 'cleaning', nameBn: 'সোফা পরিষ্কার', nameEn: 'Sofa Cleaning', descriptionBn: 'সোফা শ্যাম্পু ক্লিনিং (5 সিটার পর্যন্ত)', basePrice: 599, durationMinutes: 90 },
  // Pest Control
  { id: 'cockroach_control', categoryId: 'pest_control', nameBn: 'তেলাপোকা দমন', nameEn: 'Cockroach Control', descriptionBn: 'জেল ও স্প্রে ট্রিটমেন্ট', basePrice: 499, durationMinutes: 60 },
  { id: 'termite_control', categoryId: 'pest_control', nameBn: 'উইপোকা দমন', nameEn: 'Termite Control', descriptionBn: 'উইপোকা দমন ট্রিটমেন্ট', basePrice: 799, durationMinutes: 90 },
  { id: 'mosquito_control', categoryId: 'pest_control', nameBn: 'মশা দমন', nameEn: 'Mosquito Control', descriptionBn: 'মশা দমন স্প্রে ও ফগিং', basePrice: 599, durationMinutes: 60 },
  // Beautician
  { id: 'facial', categoryId: 'beautician', nameBn: 'ফেসিয়াল', nameEn: 'Facial', descriptionBn: 'ক্লিনআপ ও ফেসিয়াল ট্রিটমেন্ট', basePrice: 399, durationMinutes: 60 },
  { id: 'waxing', categoryId: 'beautician', nameBn: 'ওয়াক্সিং', nameEn: 'Waxing', descriptionBn: 'ফুল আর্ম ও লেগ ওয়াক্সিং', basePrice: 299, durationMinutes: 45 },
  { id: 'bridal_makeup', categoryId: 'beautician', nameBn: 'বিয়ের মেকআপ', nameEn: 'Bridal Makeup', descriptionBn: 'সম্পূর্ণ বিয়ের মেকআপ প্যাকেজ', basePrice: 2999, durationMinutes: 180 },
  { id: 'mehendi', categoryId: 'beautician', nameBn: 'মেহেন্দি', nameEn: 'Mehendi', descriptionBn: 'হাতে মেহেন্দি ডিজাইন', basePrice: 499, durationMinutes: 60 },
  // Painter
  { id: 'room_painting', categoryId: 'painter', nameBn: 'ঘর রঙ করা', nameEn: 'Room Painting', descriptionBn: 'একটি ঘর রঙ করা (100 sq ft পর্যন্ত)', basePrice: 1499, durationMinutes: 480 },
  { id: 'waterproofing', categoryId: 'painter', nameBn: 'ওয়াটারপ্রুফিং', nameEn: 'Waterproofing', descriptionBn: 'ছাদ বা দেওয়াল ওয়াটারপ্রুফিং', basePrice: 1999, durationMinutes: 480 },
];

export const TIME_SLOTS = [
  { id: '08-10', labelBn: 'সকাল ৮-১০', labelEn: '8-10 AM', value: '08:00-10:00' },
  { id: '10-12', labelBn: 'সকাল ১০-১২', labelEn: '10-12 AM', value: '10:00-12:00' },
  { id: '12-14', labelBn: 'দুপুর ১২-২', labelEn: '12-2 PM', value: '12:00-14:00' },
  { id: '14-16', labelBn: 'বিকেল ২-৪', labelEn: '2-4 PM', value: '14:00-16:00' },
  { id: '16-18', labelBn: 'বিকেল ৪-৬', labelEn: '4-6 PM', value: '16:00-18:00' },
  { id: '18-20', labelBn: 'সন্ধ্যা ৬-৮', labelEn: '6-8 PM', value: '18:00-20:00' },
];

export const BOOKING_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PROVIDER_ON_WAY: 'provider_on_way',
  ARRIVED: 'arrived',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_PROVIDER: 'no_provider_found',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  VERIFIED: 'verified',
  REFUNDED: 'refunded',
} as const;

export const REVIEW_TAGS = [
  'সময়মতো',
  'ভালো কাজ',
  'ভদ্র ব্যবহার',
  'দাম ঠিক',
  'দেরি',
  'অসম্পূর্ণ',
  'বেশি টাকা',
];

export const CANCEL_REASONS_CUSTOMER = [
  'প্ল্যান বদলে গেছে',
  'অনেক দেরি হচ্ছে',
  'ভুল করে বুক হয়েছে',
  'অন্য জায়গা থেকে করিয়ে নিয়েছি',
  'অন্য কারণ',
];

export const CANCEL_REASONS_PROVIDER = [
  'দূরত্ব বেশি',
  'সময় নেই',
  'এই সেবা দিতে পারছি না',
  'অন্য কারণ',
];

export const PLATFORM_FEE = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE || 19);
export const COMMISSION_PERCENT = Number(process.env.NEXT_PUBLIC_COMMISSION_PERCENT || 12);
export const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || 'indaspro@okicici';
