// src/services/api.js

// Simulate an API call to request an OTP for a given phone number
export const requestOTP = async (phone) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate success (you can add logic to simulate failure if needed)
  if (phone) {
    return true;
  }
  return false;
};
