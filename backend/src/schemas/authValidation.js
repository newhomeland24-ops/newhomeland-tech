const { z } = require('zod');

const requestOtpSchema = z.object({
  email: z.string().email("Invalid email format")
});

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email format"),
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d{6}$/, "OTP must contain only numbers")
});

module.exports = {
  requestOtpSchema,
  verifyOtpSchema
};
