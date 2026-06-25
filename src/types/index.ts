import type { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  roles: ('customer' | 'provider' | 'admin')[];
  activeRole: 'customer' | 'provider' | 'admin';
  pinHash: string;
  languagePref: 'bn' | 'hi' | 'en';
  town: string;
  isActive: boolean;
  referralCode: string;
  referredBy?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Address {
  id: string;
  label: 'home' | 'office' | 'other';
  houseNo: string;
  streetPara: string;
  landmark: string;
  area: string;
  town: string;
  pinCode: string;
  isDefault: boolean;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  isVerified: boolean;
  verificationNote?: string;
  experienceYears: string;
  categoryIds: string[];
  serviceIds: string[];
  serviceTown: string;
  serviceAreas: string[];
  serviceRange: 'local_area' | 'full_town' | 'nearby_villages';
  isOnline: boolean;
  avgRating: number;
  totalJobs: number;
  totalEarnings: number;
  workingDays: number[];
  workingHoursStart: string;
  workingHoursEnd: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ServiceCategory {
  id: string;
  nameBn: string;
  nameEn: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Service {
  id: string;
  categoryId: string;
  nameBn: string;
  nameEn: string;
  descriptionBn: string;
  descriptionEn?: string;
  basePrice: number;
  durationMinutes: number;
  isActive: boolean;
}

export interface BookingService {
  serviceId: string;
  nameBn: string;
  price: number;
}

export interface BookingAddress {
  houseNo: string;
  streetPara: string;
  landmark: string;
  area: string;
  town: string;
  pinCode: string;
}

export interface BookingExtra {
  id: string;
  itemName: string;
  quantity: number;
  price: number;
  addedAt: Timestamp;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  providerId?: string;
  providerName?: string;
  providerPhone?: string;
  status: string;
  address: BookingAddress;
  services: BookingService[];
  scheduledDate: string;
  scheduledSlot: string;
  customerNote?: string;
  otpCode: string;
  subtotal: number;
  platformFee: number;
  discount: number;
  couponCode?: string;
  extraCharges: number;
  total: number;
  commissionPercent: number;
  commissionAmount: number;
  providerEarnings: number;
  paymentMethod: 'cash' | 'upi';
  paymentStatus: string;
  paymentUtr?: string;
  providerAcceptedAt?: Timestamp;
  providerStartedAt?: Timestamp;
  providerArrivedAt?: Timestamp;
  serviceStartedAt?: Timestamp;
  completedAt?: Timestamp;
  cancelledAt?: Timestamp;
  cancelledBy?: 'customer' | 'provider' | 'admin';
  cancellationReason?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  providerId: string;
  rating: number;
  tags: string[];
  comment?: string;
  createdAt: Timestamp;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  maxDiscount: number;
  validFrom: Timestamp;
  validTo: Timestamp;
  usageLimit: number;
  timesUsed: number;
  applicableCategories: string[];
  isActive: boolean;
}

export interface Settlement {
  id: string;
  providerId: string;
  providerName: string;
  periodStart: string;
  periodEnd: string;
  totalCashCollected: number;
  totalUpiEarned: number;
  commissionOwed: number;
  netAmount: number;
  status: 'pending' | 'settled';
  settledAt?: Timestamp;
  settlementReference?: string;
}

export interface PlatformConfig {
  commissionPercent: number;
  platformFee: number;
  upiId: string;
  serviceTowns: string[];
  cancellationFee: number;
  referralReward: number;
  supportPhone: string;
  supportEmail: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'booking_update' | 'provider_assigned' | 'payment' | 'promo';
  bookingId?: string;
  isRead: boolean;
  createdAt: Timestamp;
}
