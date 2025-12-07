import connectDB from '../lib/db';
import User from '../models/User';
import { signToken, setAuthCookie, clearAuthCookie } from '../lib/auth';
import { jsonError, jsonSuccess } from '../lib/response';
import { env } from '../lib/config';
import { ensureRole, ensureUserHasRole } from '../lib/roles';
import { ensureDefaultHrUser } from '../lib/defaultUsers';
import { generateOTP, generateOTPExpiry, verifyOTP } from '../utils/otp';
import { sendOTPEmail, sendWelcomeEmail } from '../utils/email';
import { logger } from '../utils/logger';

const DEFAULT_ROLES = [
  { name: 'superadmin', description: 'Highest privileged role' },
  { name: 'admin', description: 'Administrative access' },
  { name: 'hr', description: 'Human resources role' },
  { name: 'marketing', description: 'Marketing role' },
  { name: 'developer', description: 'Technical role' },
  { name: 'base_user', description: 'Default role for new users' },
];

function sanitizeUser(userDoc) {
  return {
    id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role || 'base_user',
    roleRef: userDoc.roleRef,
    createdAt: userDoc.createdAt,
  };
}

export async function signup(req, res) {
  const { name, email, password } = req.body || {};
  const missing = [];
  if (!name) missing.push('name');
  if (!email) missing.push('email');
  if (!password) missing.push('password');
  if (missing.length) {
    return jsonError(res, 400, `Missing required field(s): ${missing.join(', ')}`);
  }
  const emailOk = typeof email === 'string' && /.+@.+\..+/.test(email);
  if (!emailOk) {
    return jsonError(res, 400, 'Invalid email format');
  }
  if (!env.JWT_SECRET) {
    return jsonError(res, 500, 'Server misconfiguration: JWT_SECRET not set');
  }
  try {
    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) {
      // If user exists but email is not verified, allow resending OTP
      if (!existing.isEmailVerified) {
        const otp = generateOTP();
        const otpExpires = generateOTPExpiry();
        
        existing.otp = otp;
        existing.otpExpires = otpExpires;
        await existing.save();
        
        try {
          await sendOTPEmail(email, otp, name);
          logger.info(`OTP resent to existing unverified user: ${email}`);
          return jsonSuccess(res, 200, 'Verification code sent to your email. Please check your inbox.', {
            email: email,
            message: 'Please verify your email to complete registration',
          });
        } catch (emailError) {
          logger.error('Failed to send OTP email:', emailError.message);
          // Return a user-friendly error message without exposing technical details
          return jsonError(res, 500, 'Unable to send verification email at this time. Please try again later or contact support if the issue persists.');
        }
      }
      return jsonError(res, 409, 'Email already registered');
    }
    
    // Generate OTP for new user
    const otp = generateOTP();
    const otpExpires = generateOTPExpiry();
    
    const baseRole = await ensureRole('base_user', 'Default role for new users');
    const user = await User.create({
      name,
      email,
      password,
      role: baseRole.name,
      roleRef: baseRole._id,
      isEmailVerified: false,
      otp,
      otpExpires,
    });
    
    // Send OTP email
    try {
      await sendOTPEmail(email, otp, name);
      logger.info(`OTP sent to new user: ${email}`);
    } catch (emailError) {
      logger.error('Failed to send OTP email:', emailError.message);
      // Delete the user if email sending fails
      try {
        await User.findByIdAndDelete(user._id);
      } catch (deleteError) {
        logger.error('Failed to delete user after email error:', deleteError.message);
      }
      // Return a user-friendly error message without exposing technical details
      return jsonError(res, 500, 'Unable to send verification email at this time. Please try again later or contact support if the issue persists.');
    }
    
    return jsonSuccess(res, 201, 'Signup successful. Please check your email for verification code.', {
      email: email,
      message: 'A verification code has been sent to your email. Please verify your email to complete registration.',
    });
  } catch (err) {
    logger.error('Signup error:', err.message);
    // Return a generic error message without exposing internal details
    return jsonError(res, 500, 'Unable to create your account at this time. Please try again later or contact support if the issue persists.');
  }
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  const missing = [];
  if (!email) missing.push('email');
  if (!password) missing.push('password');
  if (missing.length) {
    return jsonError(res, 400, `Missing required field(s): ${missing.join(', ')}`);
  }
  try {
    await connectDB();
    await ensureDefaultHrUser();
    const user = await User.findOne({ email });
    if (!user) {
      return jsonError(res, 401, 'Email not found');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return jsonError(res, 401, 'Invalid password');
    }
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      return jsonError(res, 403, 'Please verify your email before logging in. Check your inbox for the verification code.');
    }
    
    await ensureUserHasRole(user);
    if (!env.JWT_SECRET) {
      return jsonError(res, 500, 'Server misconfiguration: JWT_SECRET not set');
    }
    const token = signToken({ id: user._id, role: user.role });
    // Pass the request so the cookie secure flag reflects the real protocol
    setAuthCookie(res, token, req);
    return jsonSuccess(res, 200, 'Login successful', {
      user: sanitizeUser(user),
      token,
    });
  } catch (err) {
    return jsonError(res, 500, 'Login failed', err.message);
  }
}

export async function logout(req, res) {
  clearAuthCookie(res);
  return jsonSuccess(res, 200, 'Logged out');
}

export async function me(req, res) {
  if (!req.user) {
    return jsonSuccess(res, 200, 'Ok', { user: null });
  }
  return jsonSuccess(res, 200, 'Ok', { user: sanitizeUser(req.user) });
}

export async function verifyEmail(req, res) {
  const { email, otp } = req.body || {};
  const missing = [];
  if (!email) missing.push('email');
  if (!otp) missing.push('otp');
  if (missing.length) {
    return jsonError(res, 400, `Missing required field(s): ${missing.join(', ')}`);
  }
  
  const emailOk = typeof email === 'string' && /.+@.+\..+/.test(email);
  if (!emailOk) {
    return jsonError(res, 400, 'Invalid email format');
  }
  
  try {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return jsonError(res, 404, 'User not found. Please sign up first.');
    }
    
    if (user.isEmailVerified) {
      return jsonSuccess(res, 200, 'Email already verified', {
        user: sanitizeUser(user),
        alreadyVerified: true,
      });
    }
    
    // Verify OTP
    const verification = verifyOTP(otp, user.otp, user.otpExpires);
    if (!verification.isValid) {
      return jsonError(res, 400, verification.message);
    }
    
    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    
    // Send welcome email
    try {
      await sendWelcomeEmail(email, user.name);
      logger.info(`Welcome email sent to verified user: ${email}`);
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError.message);
      // Don't fail the verification if welcome email fails
    }
    
    // Generate token for immediate login after verification
    if (!env.JWT_SECRET) {
      return jsonError(res, 500, 'Server misconfiguration: JWT_SECRET not set');
    }
    const token = signToken({ id: user._id, role: user.role });
    setAuthCookie(res, token, req);
    
    return jsonSuccess(res, 200, 'Email verified successfully', {
      user: sanitizeUser(user),
      token,
    });
  } catch (err) {
    logger.error('Email verification error:', err.message);
    // Return a generic error message without exposing internal details
    return jsonError(res, 500, 'Unable to verify your email at this time. Please try again later or contact support if the issue persists.');
  }
}

export async function resendOTP(req, res) {
  const { email } = req.body || {};
  if (!email) {
    return jsonError(res, 400, 'Email is required');
  }
  
  const emailOk = typeof email === 'string' && /.+@.+\..+/.test(email);
  if (!emailOk) {
    return jsonError(res, 400, 'Invalid email format');
  }
  
  try {
    await connectDB();
    const user = await User.findOne({ email });
    if (!user) {
      return jsonError(res, 404, 'User not found. Please sign up first.');
    }
    
    if (user.isEmailVerified) {
      return jsonSuccess(res, 200, 'Email already verified', {
        alreadyVerified: true,
      });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    const otpExpires = generateOTPExpiry();
    
    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();
    
    // Send OTP email
    try {
      await sendOTPEmail(email, otp, user.name);
      logger.info(`OTP resent to user: ${email}`);
      return jsonSuccess(res, 200, 'Verification code sent to your email. Please check your inbox.', {
        email: email,
      });
    } catch (emailError) {
      logger.error('Failed to send OTP email:', emailError.message);
      return jsonError(res, 500, 'Failed to send verification email. Please try again later.');
    }
  } catch (err) {
    logger.error('Resend OTP error:', err.message);
    // Return a generic error message without exposing internal details
    return jsonError(res, 500, 'Unable to resend verification code at this time. Please try again later or contact support if the issue persists.');
  }
}

export async function createInitialSuperAdmin(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }
  const setupToken = env.SUPERADMIN_SETUP_TOKEN;
  if (!setupToken) {
    return jsonError(res, 403, 'Setup token not configured');
  }
  const providedToken = req.headers['x-setup-token'] || req.query.token || req.body?.token;
  if (providedToken !== setupToken) {
    return jsonError(res, 403, 'Invalid setup token');
  }
  try {
    await connectDB();
    const existingSuperAdmin = await User.exists({ role: 'superadmin' });
    if (existingSuperAdmin) {
      return jsonError(res, 403, 'Superadmin already exists');
    }
    const { name, email, password } = req.body || {};
    const missing = [];
    if (!name) missing.push('name');
    if (!email) missing.push('email');
    if (!password) missing.push('password');
    if (missing.length) {
      return jsonError(res, 400, `Missing required field(s): ${missing.join(', ')}`);
    }
    const emailOk = typeof email === 'string' && /.+@.+\..+/.test(email);
    if (!emailOk) {
      return jsonError(res, 400, 'Invalid email format');
    }
    const superRole = await ensureRole('superadmin', 'Highest privileged role');
    await Promise.all(
      DEFAULT_ROLES.filter((role) => role.name !== 'superadmin').map((role) =>
        ensureRole(role.name, role.description)
      )
    );
    const user = await User.create({
      name,
      email,
      password,
      role: superRole.name,
      roleRef: superRole._id,
    });
    return jsonSuccess(res, 201, 'Superadmin created', { user: sanitizeUser(user) });
  } catch (err) {
    return jsonError(res, 500, 'Failed to create superadmin', err.message);
  }
}


