export const formatPhoneNumber = (phoneNumber: string) => {
  return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3").replace(/\+/g, "");
};

export const formatUSPhoneNumber = (phoneNumber: string | undefined) => {
  if (!phoneNumber) return "";

  const digits = phoneNumber.replace(/\D/g, ""); // remove non-digits

  // keep only last 10 digits (standard US number)
  const clean = digits.slice(-10);

  if (clean.length <= 3) return `+1 (${clean}`;
  if (clean.length <= 6) return `+1 (${clean.slice(0, 3)}) ${clean.slice(3)}`;
  return `+1 (${clean.slice(0, 3)}) ${clean.slice(3, 6)}-${clean.slice(6, 10)}`;

  // Standard US 10-digit (with country code implied as 1)
  return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
};
