export function buildWhatsAppShareUrl(
  providerName: string,
  category: string,
  address: string,
  tagline: string,
  providerUrl: string
): string {
  const text = encodeURIComponent(
    `${providerName} — ${category} — ${address}\n${tagline}\n${providerUrl}`
  );
  return `https://wa.me/?text=${text}`;
}

export function buildWhatsAppContactUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const number = digits.startsWith("91") ? digits : `91${digits}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildFacebookShareUrl(providerUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(providerUrl)}`;
}
