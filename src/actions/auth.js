/*
 * File: src/actions/auth.js
 * SR-DEV: Auth Actions with Enterprise Dual-Layer Rate Limiting
 */

"use server";

import crypto from "crypto";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/nodemailer";
import { headers } from "next/headers";
import { authIpLimit, authUserLimit } from "@/lib/ratelimit";
import UserProfile from "@/models/UserProfile";

// --- HELPERS ---

const normalize = (str) => str?.toString().toLowerCase().trim();

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const createResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  return { resetToken, passwordResetToken: hashToken(resetToken) };
};

// 1. Get Client IP Helper
async function getClientIp() {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headersList.get("x-real-ip") || "127.0.0.1";
}

// 2. Dual Rate Limit Check Helper
async function checkRateLimits(ip, identifier) {
  // Layer 1: Global IP Limit (Stops bots from trying 100 different emails)
  const ipResult = await authIpLimit.limit(ip);
  if (!ipResult.success) {
    return {
      allowed: false,
      message: "Too many requests from this device. Please try again in an hour.",
    };
  }

  // Layer 2: Target Limit (Stops spamming a single email address)
  const userKey = `${ip}_${identifier}`;
  const userResult = await authUserLimit.limit(userKey);

  if (!userResult.success) {
    return {
      allowed: false,
      message: "Too many attempts for this account. Please wait a while before trying again.",
    };
  }

  return { allowed: true };
}

async function sendTemplateEmail(to, slug, data) {
  const result = await sendEmail({ to, slug, data });
  return result?.success;
}

// --- ACTIONS ---

export async function registerAction(formData) {
  try {
    const email = normalize(formData.get("email"));

    // --- RATE LIMIT CHECK ---
    const ip = await getClientIp();
    const limitCheck = await checkRateLimits(ip, email);
    if (!limitCheck.allowed) return { success: false, message: limitCheck.message };
    // ------------------------

    const name = formData.get("fullName")?.trim();
    const password = formData.get("password");
    const marketing = formData.get("marketing") === "true";

    if (!name || !email || !password)
      return { success: false, message: "Please fill out all fields." };

    if (password.length < 8)
      return { success: false, message: "Password must be at least 8 characters." };

    await connectToDatabase();

    // Look up user
    const existingUser = await User.findOne({ email });

    // If user exists AND is already verified → DO NOT reveal
    if (existingUser && existingUser.isVerified) {
      return { success: true, message: "OTP Sent.", email };
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    let userId;

    if (existingUser) {
      // Update unverified user
      existingUser.name = name;
      existingUser.password = password; // hashed by pre-save hook
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();

      userId = existingUser._id;

      // Ensure UserProfile exists
      await UserProfile.findOneAndUpdate(
        { user: userId },
        { 
          $setOnInsert: { isOnline: false },
          "notificationPreferences.marketing": marketing 
        },
        { upsert: true }
      );
    } else {
      // Create user
      const newUser = await User.create({
        name,
        email,
        password,
        otp,
        otpExpiry,
        role: "user",
        isVerified: false,
      });

      userId = newUser._id;

      // Create profile
      await UserProfile.create({
        user: userId,
        notificationPreferences: {
          marketing,
          transactional: true,
          security: true
        },
        isOnline: false,
      });
    }

    // Send OTP email
    if (!(await sendTemplateEmail(email, "verification-code", { otp, name }))) {
      return {
        success: false,
        message: "Account created, but failed to send verification code."
      };
    }

    return { success: true, message: "OTP Sent.", email };
  } catch (error) {
    console.error("Register Error:", error);
    return { success: false, message: "Registration failed. Please try again." };
  }
}


export async function resendOtpAction(emailRaw) {
  try {
    const email = normalize(emailRaw);
    if (!email) return { success: false, message: "Email is required." };

    // --- RATE LIMIT CHECK ---
    const ip = await getClientIp();
    const limitCheck = await checkRateLimits(ip, email);
    if (!limitCheck.allowed) return { success: false, message: limitCheck.message };
    // ------------------------

    await connectToDatabase();
    const user = await User.findOne({ email });
    if (!user) return { success: false, message: "User not found." };
    
    // NOTE: We allow resending OTP even if verified (for login via OTP flow if implemented later)
    // but for registration flow, usually we just update the existing OTP.

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    if (
      !(await sendTemplateEmail(email, "verification-code", {
        otp,
        name: user.name,
      }))
    ) {
      return { success: false, message: "Failed to send OTP." };
    }

    return { success: true, message: "New OTP sent." };
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return { success: false, message: "Error resending OTP." };
  }
}

export async function forgotPasswordAction(emailRaw) {
  try {
    const email = normalize(emailRaw);
    if (!email) return { success: false, message: "Email is required." };

    // --- RATE LIMIT CHECK ---
    const ip = await getClientIp();
    const limitCheck = await checkRateLimits(ip, email);
    if (!limitCheck.allowed) return { success: false, message: limitCheck.message };
    // ------------------------

    await connectToDatabase();
    const user = await User.findOne({ email });

    // Security: Prevent email enumeration
    if (!user) {
      return {
        success: true,
        message: "If an account exists, a link has been sent.",
      };
    }

    if (user.authProvider === "google") {
      return {
        success: false,
        message: "This account uses Google Sign-in. Please login with Google.",
      };
    }

    const { resetToken, passwordResetToken } = createResetToken();

    user.resetPasswordToken = passwordResetToken;
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 Hour
    await user.save();

    const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

    await sendTemplateEmail(email, "reset-password", {
      name: user.name,
      link: resetLink,
    });

    return {
      success: true,
      message: "If an account exists, a link has been sent.",
    };
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return { success: false, message: "Something went wrong." };
  }
}

export async function resetPasswordAction(token, newPassword) {
  try {
    if (!token || !newPassword)
      return { success: false, message: "Invalid request." };
    if (newPassword.length < 8)
      return { success: false, message: "Password must be 8+ chars." };

    const hashedToken = hashToken(token);

    await connectToDatabase();
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // Token must not be expired
    }).select("+password");

    if (!user) {
      return { success: false, message: "Invalid or expired token." };
    }

    user.password = newPassword; // Will be hashed by model hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return { success: true, message: "Password updated successfully." };
  } catch (error) {
    console.error("Reset Password Error:", error);
    return { success: false, message: "Failed to reset password." };
  }
}