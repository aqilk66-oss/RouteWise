/**
 * RouteWise Formatter and Validation Utilities
 */

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  // RFC 5322 compatible regex check
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
};

export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  // Clean string and test numeric length (minimum 7 digits, max 15 digits)
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length < 7 || digitsOnly.length > 15) return false;
  // Verify characters only contain digits, spaces, hyphens, plus, and parentheses
  return /^[+]?[\d\s().-]+$/.test(phone.trim());
};

export const validateSpeedThreshold = (speedMph) => {
  const num = Number(speedMph);
  if (isNaN(num)) return false;
  return num >= 20 && num <= 85;
};

export const formatDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  try {
    const d = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString();
  } catch {
    return 'N/A';
  }
};

export const formatTime = (dateInput) => {
  if (!dateInput) return 'N/A';
  try {
    const d = dateInput.toDate ? dateInput.toDate() : new Date(dateInput);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return 'N/A';
  }
};
