import { Timestamp } from "firebase/firestore";

export interface Provider {
  uid: string;
  slug?: string;
  displayName: string;
  phone: string;
  whatsapp: string;
  email: string;
  photoURL: string | null;
  address: string;
  area?: string;
  pinCode: string | null;
  status: "pending_profile" | "pending_approval" | "approved" | "rejected";
  availability: "available" | "busy" | "offline";
  role: "provider";
  source: "self" | "seeded";
  seededBy: string | null;
  claimedAt: Timestamp | null;
  termsAcceptedAt: Timestamp;
  onboardingStep: number;
  createdAt: Timestamp;
  approvedAt: Timestamp | null;
}
