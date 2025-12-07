import crypto from 'crypto';

/**
 * OTP (One-Time Password) utility functions
 */

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

/**
 * Generate a random numeric OTP
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} Generated OTP
 */
export function generateOTP(length = OTP_LENGTH) {
  // Generate a random number with the specified length
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  const otp = crypto.randomInt(min, max + 1);
  return otp.toString();
}

/**
 * Generate OTP expiry timestamp
 * @param {number} minutes - Minutes until expiry (default: 10)
 * @returns {Date} Expiry date
 */
export function generateOTPExpiry(minutes = OTP_EXPIRY_MINUTES) {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
}

/**
 * Check if OTP is expired
 * @param {Date} expiryDate - OTP expiry date
 * @returns {boolean} True if expired, false otherwise
 */
export function isOTPExpired(expiryDate) {
  if (!expiryDate) return true;
  return new Date() > new Date(expiryDate);
}

/**
 * Verify OTP
 * @param {string} providedOTP - OTP provided by user
 * @param {string} storedOTP - OTP stored in database
 * @param {Date} expiryDate - OTP expiry date
 * @returns {Object} Verification result with isValid and message
 */
export function verifyOTP(providedOTP, storedOTP, expiryDate) {
  if (!providedOTP || !storedOTP) {
    return {
      isValid: false,
      message: 'OTP is required',
    };
  }

  if (isOTPExpired(expiryDate)) {
    return {
      isValid: false,
      message: 'OTP has expired. Please request a new one.',
    };
  }

  if (providedOTP !== storedOTP) {
    return {
      isValid: false,
      message: 'Invalid OTP. Please check and try again.',
    };
  }

  return {
    isValid: true,
    message: 'OTP verified successfully',
  };
}

/**
 * Get OTP expiry time in minutes (for reference)
 * @returns {number} OTP expiry time in minutes
 */
export function getOTPExpiryMinutes() {
  return OTP_EXPIRY_MINUTES;
}

