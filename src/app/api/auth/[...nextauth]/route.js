/*
 * File: src/app/api/auth/[...nextauth]/route.js
 * SR-DEV: Production NextAuth Configuration
 * FIX: Ensures DB connection inside JWT callback to prevent buffering timeouts
 */

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

/**
 * Helper: Find user + validate common conditions
 */
async function findAndValidateUser(email, extraFields = "") {
  await connectToDatabase();

  const user = await User.findOne({ email }).select(`+isBanned ${extraFields}`);
  if (!user) throw new Error("User not found.");

  if (user.isBanned) {
    throw new Error("Your account has been suspended. Contact support.");
  }

  return user;
}

export const authOptions = {
  providers: [
    // -------------------- GOOGLE LOGIN --------------------
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    // -------------------- PASSWORD LOGIN --------------------
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const user = await findAndValidateUser(
          credentials.email,
          "+password"
        );

        if (user.authProvider === "google") {
          throw new Error("Please sign in with Google.");
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) throw new Error("Invalid password.");

        if (!user.isVerified) {
          throw new Error("Email not verified.");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          tokenVersion: user.tokenVersion || 0,
        };
      },
    }),

    // -------------------- OTP LOGIN --------------------
    CredentialsProvider({
      id: "otp-credentials",
      name: "OTP Login",
      credentials: { email: {}, otp: {} },
      async authorize(credentials) {
        const user = await findAndValidateUser(
          credentials.email,
          "+otp +otpExpiry"
        );

        if (!user.otp || user.otp !== credentials.otp) {
          throw new Error("Invalid or expired OTP.");
        }

        if (user.otpExpiry < new Date()) {
          throw new Error("OTP has expired.");
        }

        user.otp = undefined;
        user.otpExpiry = undefined;
        if (!user.isVerified) user.isVerified = true;
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          tokenVersion: user.tokenVersion || 0,
        };
      },
    }),
  ],

  callbacks: {
    // -------------------- GOOGLE SIGN-IN --------------------
    async signIn({ user, account }) {
      if (account.provider === "google") {
        await connectToDatabase();

        let existingUser = await User.findOne({ email: user.email });
        const UserProfile = require("@/models/UserProfile").default;

        if (!existingUser) {
          existingUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
            authProvider: "google",
            isVerified: true,
            role: "user",
            tokenVersion: 0,
          });

          await UserProfile.create({ user: existingUser._id });
        } else if (!existingUser.image && user.image) {
          existingUser.image = user.image;
          await existingUser.save();
        }

        if (existingUser.isBanned) return false;

        user.id = existingUser._id.toString();
        user.role = existingUser.role;
        user.tokenVersion = existingUser.tokenVersion;
      }

      return true;
    },

    // -------------------- JWT CALLBACK --------------------
    async jwt({ token, user, trigger, session }) {
      // Initial sign-in
      if (user) {
        token.id = user.id;
        token.picture = user.image;
        token.role = user.role;
        token.tokenVersion = user.tokenVersion || 0;
      }

      // Client-side updates
      if (trigger === "update" && session) {
        token.name = session.name || token.name;
        token.picture = session.image || token.picture;
      }

      // 🔑 CRITICAL FIX: Always connect before DB usage
      if (token?.id) {
        await connectToDatabase();

        const dbUser = await User.findById(token.id)
          .select("tokenVersion isBanned")
          .lean();

        if (!dbUser || dbUser.isBanned) return null;

        if ((dbUser.tokenVersion || 0) !== (token.tokenVersion || 0)) {
          return null; // Force logout everywhere
        }
      }

      return token;
    },

    // -------------------- SESSION CALLBACK --------------------
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.image = token.picture;
        session.user.role = token.role;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
