export function buildWhatsAppLink({
  phoneE164,
  text,
}: {
  phoneE164: string;
  text: string;
}) {
  const normalized = phoneE164.replace(/[^\d]/g, "");
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${normalized}?text=${encodedText}`;
}

