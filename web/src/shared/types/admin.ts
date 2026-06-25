export interface Admin {
  uid: string;
  role: "superadmin" | "moderator";
  email: string;
  fcmTokens: string[];
}
