import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  type ConfirmationResult,
} from 'firebase/auth';
import bcrypt from 'bcryptjs';
import { auth } from './firebase';

let recaptchaVerifier: RecaptchaVerifier | null = null;

export function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
    });
  }
  return recaptchaVerifier;
}

export async function signInWithPhone(
  phone: string,
  containerId: string
): Promise<ConfirmationResult> {
  const verifier = getRecaptchaVerifier(containerId);
  const fullPhone = `+91${phone}`;
  return signInWithPhoneNumber(auth, fullPhone, verifier);
}

export async function verifyOtp(
  confirmationResult: ConfirmationResult,
  code: string
) {
  return confirmationResult.confirm(code);
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, pinHash: string): Promise<boolean> {
  return bcrypt.compare(pin, pinHash);
}

export async function signOut() {
  recaptchaVerifier?.clear();
  recaptchaVerifier = null;
  return firebaseSignOut(auth);
}
