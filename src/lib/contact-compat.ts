/** Back-compat aggregate for listings that predates contact_whatsapp / contact_instagram. */
export function deriveContactMethod(
  whatsappTrimmed: string,
  instagramTrimmed: string,
): string {
  if (whatsappTrimmed.length > 0) return whatsappTrimmed;
  return instagramTrimmed;
}
