import { Timestamp } from "firebase/firestore";

export interface Service {
  id: string;
  providerId: string;
  providerName: string;
  categorySlug: string;
  subcategory: string;
  title: string;
  description: string;
  price: number;
  priceType: "fixed" | "hourly" | "negotiable";
  priceUnit: "INR";
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
