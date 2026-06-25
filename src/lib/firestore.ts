import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  onSnapshot,
  serverTimestamp,
  deleteField,
  Timestamp,
  type DocumentData,
  type QueryConstraint,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  User,
  Address,
  ProviderProfile,
  ServiceCategory,
  Service,
  Booking,
  Review,
  Coupon,
  Settlement,
  PlatformConfig,
} from '@/types';

export const usersCol = () => collection(db, 'users');
export const userDoc = (uid: string) => doc(db, 'users', uid);
export const addressesCol = (uid: string) => collection(db, 'users', uid, 'addresses');
export const providerProfilesCol = () => collection(db, 'providerProfiles');
export const providerProfileDoc = (uid: string) => doc(db, 'providerProfiles', uid);
export const serviceCategoriesCol = () => collection(db, 'serviceCategories');
export const servicesCol = () => collection(db, 'services');
export const bookingsCol = () => collection(db, 'bookings');
export const bookingDoc = (id: string) => doc(db, 'bookings', id);
export const reviewsCol = () => collection(db, 'reviews');
export const couponsCol = () => collection(db, 'coupons');
export const settlementsCol = () => collection(db, 'settlements');
export const configDoc = () => doc(db, 'config', 'platform');

export async function getUserById(uid: string): Promise<User | null> {
  const snap = await getDoc(userDoc(uid));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as User) : null;
}

export async function createUser(uid: string, data: Partial<User>) {
  await setDoc(userDoc(uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateUser(uid: string, data: Partial<User>) {
  await updateDoc(userDoc(uid), { ...data, updatedAt: serverTimestamp() } as DocumentData);
}

export async function listAddresses(uid: string): Promise<Address[]> {
  const snap = await getDocs(addressesCol(uid));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Address);
}

export async function addAddress(uid: string, data: Omit<Address, 'id'>) {
  return addDoc(addressesCol(uid), data);
}

export async function updateAddress(uid: string, addressId: string, data: Partial<Address>) {
  await updateDoc(doc(db, 'users', uid, 'addresses', addressId), data as DocumentData);
}

export async function deleteAddress(uid: string, addressId: string) {
  await deleteDoc(doc(db, 'users', uid, 'addresses', addressId));
}

export async function getProviderProfile(uid: string): Promise<ProviderProfile | null> {
  const snap = await getDoc(providerProfileDoc(uid));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as ProviderProfile) : null;
}

export async function createProviderProfile(uid: string, data: Partial<ProviderProfile>) {
  await setDoc(providerProfileDoc(uid), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateProviderProfile(uid: string, data: Partial<ProviderProfile>) {
  await updateDoc(providerProfileDoc(uid), { ...data, updatedAt: serverTimestamp() } as DocumentData);
}

export async function listAllUsers(): Promise<User[]> {
  const snap = await getDocs(usersCol());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as User);
}

export async function listAllProviderProfiles(): Promise<ProviderProfile[]> {
  const snap = await getDocs(providerProfilesCol());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ProviderProfile);
}

export async function listAllBookings(): Promise<Booking[]> {
  const snap = await getDocs(query(bookingsCol(), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
}

export async function createServiceCategory(data: Omit<ServiceCategory, 'id'>) {
  return addDoc(serviceCategoriesCol(), data);
}

export async function updateServiceCategory(id: string, data: Partial<ServiceCategory>) {
  await updateDoc(doc(db, 'serviceCategories', id), data as DocumentData);
}

export async function deleteServiceCategory(id: string) {
  await deleteDoc(doc(db, 'serviceCategories', id));
}

export async function createService(data: Omit<Service, 'id'>) {
  return addDoc(servicesCol(), data);
}

export async function updateService(id: string, data: Partial<Service>) {
  await updateDoc(doc(db, 'services', id), data as DocumentData);
}

export async function deleteService(id: string) {
  await deleteDoc(doc(db, 'services', id));
}

export async function createCoupon(data: Omit<Coupon, 'id'>) {
  return addDoc(couponsCol(), data);
}

export async function updateCoupon(id: string, data: Partial<Coupon>) {
  await updateDoc(doc(db, 'coupons', id), data as DocumentData);
}

export async function deleteCoupon(id: string) {
  await deleteDoc(doc(db, 'coupons', id));
}

export async function createSettlement(data: Omit<Settlement, 'id'>) {
  return addDoc(settlementsCol(), data);
}

export async function updateSettlement(id: string, data: Partial<Settlement>) {
  await updateDoc(doc(db, 'settlements', id), data as DocumentData);
}

export async function setPlatformConfig(data: Partial<PlatformConfig>) {
  await setDoc(configDoc(), data, { merge: true });
}

export async function listServiceCategories(): Promise<ServiceCategory[]> {
  const snap = await getDocs(query(serviceCategoriesCol(), orderBy('sortOrder', 'asc')));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ServiceCategory);
}

export async function listServices(categoryId?: string): Promise<Service[]> {
  const constraints: QueryConstraint[] = categoryId ? [where('categoryId', '==', categoryId)] : [];
  const snap = await getDocs(query(servicesCol(), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Service);
}

export async function createBooking(data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const ref = await addDoc(bookingsCol(), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getBooking(id: string): Promise<Booking | null> {
  const snap = await getDoc(bookingDoc(id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Booking) : null;
}

export async function updateBooking(id: string, data: Partial<Booking>) {
  await updateDoc(bookingDoc(id), { ...data, updatedAt: serverTimestamp() } as DocumentData);
}

export function subscribeBooking(id: string, cb: (booking: Booking | null) => void): Unsubscribe {
  return onSnapshot(bookingDoc(id), (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as Booking) : null);
  });
}

export async function listCustomerBookings(customerId: string): Promise<Booking[]> {
  const snap = await getDocs(
    query(bookingsCol(), where('customerId', '==', customerId), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
}

export async function listProviderBookings(providerId: string): Promise<Booking[]> {
  const snap = await getDocs(
    query(bookingsCol(), where('providerId', '==', providerId), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
}

export async function listPendingBookings(limitCount = 20): Promise<Booking[]> {
  const snap = await getDocs(
    query(bookingsCol(), where('status', '==', 'pending'), fbLimit(limitCount))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Booking);
}

export async function createReview(data: Omit<Review, 'id' | 'createdAt'>) {
  return addDoc(reviewsCol(), { ...data, createdAt: serverTimestamp() });
}

export async function listProviderReviews(providerId: string): Promise<Review[]> {
  const snap = await getDocs(
    query(reviewsCol(), where('providerId', '==', providerId), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Review);
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const snap = await getDocs(query(couponsCol(), where('code', '==', code.toUpperCase())));
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Coupon;
}

export async function listCoupons(): Promise<Coupon[]> {
  const snap = await getDocs(couponsCol());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Coupon);
}

export async function listSettlements(providerId?: string): Promise<Settlement[]> {
  const constraints: QueryConstraint[] = providerId ? [where('providerId', '==', providerId)] : [];
  const snap = await getDocs(query(settlementsCol(), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Settlement);
}

export async function getPlatformConfig(): Promise<PlatformConfig | null> {
  const snap = await getDoc(configDoc());
  return snap.exists() ? (snap.data() as PlatformConfig) : null;
}

export { Timestamp, serverTimestamp, deleteField };
