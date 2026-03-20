/**
 * Cleans phone strings to a digit-only 10-character format (0XXXXXXXXX) 
 * Or handles input with +66 by converting to local format.
 */
export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return "";
  
  let cleaned = rawPhone.replace(/\D/g, ""); // Remove non-digits
  
  if (cleaned.startsWith("66") && cleaned.length > 10) {
    cleaned = "0" + cleaned.substring(2);
  }
  
  if (cleaned.length === 9) { // Add leading zero for 9-digit mobile inputs
    cleaned = "0" + cleaned;
  }
  
  return cleaned;
}
