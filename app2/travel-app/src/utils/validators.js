// src/utils/validators.js

export const isValidPhoneNumber = (phone) => {
  // Basic international phone validation: starts with + and 10-15 digits
  return /^\+\d{10,15}$/.test(phone);
};
