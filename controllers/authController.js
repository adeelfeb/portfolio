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
  
  // Validate all required fields with user-friendly messages
  const missing = [];
  if (!name || (typeof name === 'string' && !name.trim())) missing.push('name');
  if (!email || (typeof email === 'string' && !email.trim())) missing.push('email');
  if (!password) missing.push('password');
  
  if (missing.length) {
    return jsonError(res, 400, `Please provide ${missing.join(', ')}`);
  }
  
  // Validate email format
  const emailTrimmed = email.trim().toLowerCase();
  const emailOk = typeof email === 'string' && /.+@.+\..+/.test(emailTrimmed);
  if (!emailOk) {
    return jsonError(res, 400, 'Please provide a valid email address');
  }
  
  // Validate password strength
  if (typeof password !== 'string' || password.length < 6) {
    return jsonError(res, 400, 'Password must be at least 6 characters long');
  }
  
  // Validate name
  const nameTrimmed = name.trim();
  if (nameTrimmed.length < 2) {
    return jsonError(res, 400, 'Name must be at least 2 characters long');
  }
  
  if (!env.JWT_SECRET) {
    logger.error('JWT_SECRET not configured');
    return jsonError(res, 503, 'Authentication service is currently unavailable. Please try again later.');
  }
  
  try {
    const dbResult = await connectDB();
    if (!dbResult.success) {
      return jsonError(res, 503, 'Database service is currently unavailable. Please try again later.');
    }
    
    // Check for existing user (case-insensitive)
    const existing = await User.findOne({ email: emailTrimmed });
    if (existing) {
      // If user exists but email is not verified, allow resending OTP
      if (!existing.isEmailVerified) {
        const otp = generateOTP();
        const otpExpires = generateOTPExpiry();
        
        existing.otp = otp;
        existing.otpExpires = otpExpires;
        await existing.save();
        
        try {
          await sendOTPEmail(emailTrimmed, otp, existing.name || nameTrimmed);
          logger.info(`OTP resent to existing unverified user: ${emailTrimmed}`);
          return jsonSuccess(res, 200, 'Verification code sent to your email. Please check your inbox.', {
            email: emailTrimmed,
            message: 'Please verify your email to complete registration',
            requiresVerification: true,
          });
        } catch (emailError) {
          logger.error('Failed to send OTP email:', emailError.message);
          return jsonError(res, 500, 'Unable to send verification email at this time. Please try again later or contact support if the issue persists.');
        }
      }
      return jsonError(res, 409, 'An account with this email already exists. Please sign in instead.');
    }
    
    // Generate OTP for new user
    const otp = generateOTP();
    const otpExpires = generateOTPExpiry();
    
    const baseRole = await ensureRole('base_user', 'Default role for new users');
    const user = await User.create({
      name: nameTrimmed,
      email: emailTrimmed,
      password,
      role: baseRole.name,
      roleRef: baseRole._id,
      isEmailVerified: false,
      otp,
      otpExpires,
    });
    
    // Send OTP email
    try {
      await sendOTPEmail(emailTrimmed, otp, nameTrimmed);
      logger.info(`OTP sent to new user: ${emailTrimmed}`);
    } catch (emailError) {
      logger.error('Failed to send OTP email:', emailError.message);
      // Delete the user if email sending fails
      try {
        await User.findByIdAndDelete(user._id);
      } catch (deleteError) {
        logger.error('Failed to delete user after email error:', deleteError.message);
      }
      return jsonError(res, 500, 'Unable to send verification email at this time. Please check your email address and try again, or contact support if the issue persists.');
    }
    
    return jsonSuccess(res, 201, 'Account created successfully! Please check your email for the verification code.', {
      email: emailTrimmed,
      message: 'A verification code has been sent to your email. Please verify your email to complete registration.',
      requiresVerification: true,
    });
  } catch (err) {
    logger.error('Signup error:', err.message, err.stack);
    
    // Handle duplicate key errors (MongoDB)
    if (err.code === 11000 || err.name === 'MongoServerError') {
      return jsonError(res, 409, 'An account with this email already exists. Please sign in instead.');
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors || {}).map(e => e.message).join(', ');
      return jsonError(res, 400, errors || 'Invalid input data');
    }
    
    // Generic error for everything else
    return jsonError(res, 500, 'Unable to create your account at this time. Please try again later or contact support if the issue persists.');
  }
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  
  // Validate input - provide user-friendly error messages
  if (!email || !password) {
    const missing = [];
    if (!email) missing.push('email');
    if (!password) missing.push('password');
    return jsonError(res, 400, `Please provide ${missing.join(' and ')}`);
  }
  
  // Validate email format
  const emailOk = typeof email === 'string' && /.+@.+\..+/.test(email.trim());
  if (!emailOk) {
    return jsonError(res, 400, 'Please provide a valid email address');
  }
  
  // Validate password is not empty
  if (typeof password !== 'string' || password.length === 0) {
    return jsonError(res, 400, 'Please provide your password');
  }
  
  try {
    const dbResult = await connectDB();
    if (!dbResult.success) {
      return jsonError(res, 503, 'Database service is currently unavailable. Please try again later.');
    }
    await ensureDefaultHrUser();
    
    // Find user by email (case-insensitive search)
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    
    // Don't reveal if email exists or not - use generic message for security
    if (!user) {
      return jsonError(res, 401, 'Invalid email or password');
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return jsonError(res, 401, 'Invalid email or password');
    }
    
    // Check if email is verified
    if (!user.isEmailVerified) {
      // Offer to resend OTP
      return jsonError(res, 403, 'Please verify your email before logging in. Check your inbox for the verification code, or request a new one.');
    }
    
    await ensureUserHasRole(user);
    
    if (!env.JWT_SECRET) {
      logger.error('JWT_SECRET not configured');
      return jsonError(res, 503, 'Authentication service is currently unavailable. Please try again later.');
    }
    
    const token = signToken({ id: user._id, role: user.role });
    if (!token) {
      return jsonError(res, 503, 'Authentication service is currently unavailable. Please try again later.');
    }
    // Pass the request so the cookie secure flag reflects the real protocol
    setAuthCookie(res, token, req);
    
    logger.info(`User logged in successfully: ${user.email}`);
    return jsonSuccess(res, 200, 'Login successful', {
      user: sanitizeUser(user),
      token,
    });
  } catch (err) {
    logger.error('Login error:', err.message, err.stack);
    // Don't expose internal error details
    return jsonError(res, 500, 'Unable to sign you in at this time. Please try again later.');
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
  
  // Validate input
  const missing = [];
  if (!email || (typeof email === 'string' && !email.trim())) missing.push('email');
  if (!otp || (typeof otp === 'string' && !otp.trim())) missing.push('verification code');
  
  if (missing.length) {
    return jsonError(res, 400, `Please provide ${missing.join(' and ')}`);
  }
  
  const emailTrimmed = email.trim().toLowerCase();
  const otpTrimmed = typeof otp === 'string' ? otp.trim() : String(otp);
  
  const emailOk = typeof email === 'string' && /.+@.+\..+/.test(emailTrimmed);
  if (!emailOk) {
    return jsonError(res, 400, 'Please provide a valid email address');
  }
  
  if (!otpTrimmed || otpTrimmed.length < 4) {
    return jsonError(res, 400, 'Please provide a valid verification code');
  }
  
  try {
    const dbResult = await connectDB();
    if (!dbResult.success) {
      return jsonError(res, 503, 'Database service is currently unavailable. Please try again later.');
    }
    const user = await User.findOne({ email: emailTrimmed });
    
    if (!user) {
      return jsonError(res, 404, 'No account found with this email. Please sign up first.');
    }
    
    if (user.isEmailVerified) {
      // Generate token for already verified users
      if (!env.JWT_SECRET) {
        logger.error('JWT_SECRET not configured');
        return jsonError(res, 503, 'Authentication service is currently unavailable. Please try again later.');
      }
      const token = signToken({ id: user._id, role: user.role });
      if (!token) {
        return jsonError(res, 503, 'Authentication service is currently unavailable. Please try again later.');
      }
      setAuthCookie(res, token, req);
      
      return jsonSuccess(res, 200, 'Email already verified', {
        user: sanitizeUser(user),
        token,
        alreadyVerified: true,
      });
    }
    
    // Verify OTP
    const verification = verifyOTP(otpTrimmed, user.otp, user.otpExpires);
    if (!verification.isValid) {
      return jsonError(res, 400, verification.message || 'Invalid or expired verification code. Please request a new one.');
    }
    
    // Mark email as verified and clear OTP
    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    
    // Send welcome email
    try {
      await sendWelcomeEmail(emailTrimmed, user.name);
      logger.info(`Welcome email sent to verified user: ${emailTrimmed}`);
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError.message);
      // Don't fail the verification if welcome email fails
    }
    
    // Generate token for immediate login after verification
    if (!env.JWT_SECRET) {
      logger.error('JWT_SECRET not configured');
      return jsonError(res, 503, 'Authentication service is currently unavailable. Please try again later.');
    }
    const token = signToken({ id: user._id, role: user.role });
    if (!token) {
      return jsonError(res, 503, 'Authentication service is currently unavailable. Please try again later.');
    }
    setAuthCookie(res, token, req);
    
    logger.info(`Email verified successfully: ${emailTrimmed}`);
    return jsonSuccess(res, 200, 'Email verified successfully! You can now sign in.', {
      user: sanitizeUser(user),
      token,
    });
  } catch (err) {
    logger.error('Email verification error:', err.message, err.stack);
    return jsonError(res, 500, 'Unable to verify your email at this time. Please try again later or contact support if the issue persists.');
  }
}

export async function resendOTP(req, res) {
  const { email } = req.body || {};
  
  if (!email || (typeof email === 'string' && !email.trim())) {
    return jsonError(res, 400, 'Please provide your email address');
  }
  
  const emailTrimmed = email.trim().toLowerCase();
  const emailOk = typeof email === 'string' && /.+@.+\..+/.test(emailTrimmed);
  if (!emailOk) {
    return jsonError(res, 400, 'Please provide a valid email address');
  }
  
  try {
    const dbResult = await connectDB();
    if (!dbResult.success) {
      // Don't reveal database status for security - return generic success message
      return jsonSuccess(res, 200, 'If an account exists with this email, a verification code has been sent.');
    }
    const user = await User.findOne({ email: emailTrimmed });
    
    if (!user) {
      // Don't reveal if email exists for security
      return jsonSuccess(res, 200, 'If an account exists with this email, a verification code has been sent.');
    }
    
    if (user.isEmailVerified) {
      return jsonSuccess(res, 200, 'Email already verified. You can sign in now.', {
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
      await sendOTPEmail(emailTrimmed, otp, user.name);
      logger.info(`OTP resent to user: ${emailTrimmed}`);
      return jsonSuccess(res, 200, 'Verification code sent to your email. Please check your inbox.', {
        email: emailTrimmed,
      });
    } catch (emailError) {
      logger.error('Failed to send OTP email:', emailError.message);
      return jsonError(res, 500, 'Unable to send verification email at this time. Please try again later or contact support if the issue persists.');
    }
  } catch (err) {
    logger.error('Resend OTP error:', err.message, err.stack);
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
    const dbResult = await connectDB();
    if (!dbResult.success) {
      return jsonError(res, 503, 'Database service is currently unavailable. Please try again later.');
    }
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


