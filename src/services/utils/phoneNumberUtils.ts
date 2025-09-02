export const formatPhoneNumber = (phoneNumber: string) => {
  return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3").replace(/\+/g, "");
};

export const formatUSPhoneNumber = (phoneNumber: string | undefined) => {
  return phoneNumber ? `+${formatPhoneNumber(phoneNumber)}` : "";
};
