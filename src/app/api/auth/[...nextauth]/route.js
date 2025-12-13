import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

/**
 * Helper to find user and run common validation checks (existence, ban status).
 */
async function findAndValidateUser(email, extraFields = "") {
  await connectToDatabase();
  // Select +isBanned explicitly as it might be excluded by default or needed for logic
  const user = await User.findOne({ email }).select(`+isBanned ${extraFields}`);

  if (!user) throw new Error("User not found.");

  if (user.isBanned) {
    throw new Error("Your account has been suspended. Contact support.");
  }

  return user;
}

export const authOptions = {
  providers: [
    // 1. Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    
    // 2. Standard Password Login
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const user = await findAndValidateUser(credentials.email, "+password");
        
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
          image: user.profilePicture,
        };
      },
    }),

    // 3. OTP Login (Used for verifying registration & passwordless entry)
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

        // OTP Valid: Clear it and verify user
        user.otp = undefined;
        user.otpExpiry = undefined;
        if (!user.isVerified) user.isVerified = true;
        await user.save();

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.profilePicture,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        await connectToDatabase();
  
        let existingUser = await User.findOne({ email: user.email });
  
        const UserProfile = require("@/models/UserProfile").default;
  
        if (!existingUser) {
          // Create new Google account
          existingUser = await User.create({
            name: user.name,
            email: user.email,
            image: user.image,       // Save Google profile picture
            provider: "google",
            isVerified: true,        // Google = verified email
            role: "user",
            tokenVersion: 0,         // IMPORTANT for session invalidation
          });
  
          // Ensure UserProfile exists
          await UserProfile.create({ user: existingUser._id });
  
        } else {
          // Update missing profile picture if needed
          if (!existingUser.image && user.image) {
            existingUser.image = user.image;
            await existingUser.save();
          }
        }
  
        if (existingUser.isBanned) return false;
  
        // Attach DB identity fields to next-auth "user" object
        user.id = existingUser._id.toString();
        user.role = existingUser.role;
        user.tokenVersion = existingUser.tokenVersion;
      }
  
      return true;
    },
  
    async jwt({ token, user, trigger, session }) {
      // When user first signs in → attach custom fields
      if (user) {
        token.id = user.id;
        token.picture = user.image;
        token.role = user.role;
        token.tokenVersion = user.tokenVersion || 0;
      }
  
      // Allow client-side updates (NextAuth feature)
      if (trigger === "update" && session) {
        token.name = session.name || token.name;
        token.picture = session.image || token.picture;
      }
  
      // ---- TOKEN VERSION CHECK (PROJECT-ADMIN LOGIC) ----
      // If tokenVersion in DB changes, force logout everywhere
      if (token?.id) {
        const dbUser = await User.findById(token.id)
          .select("tokenVersion isBanned")
          .lean();
  
        if (!dbUser || dbUser.isBanned) return null;
  
        // Token invalid → someone reset password or revoked sessions
        if ((dbUser.tokenVersion || 0) !== (token.tokenVersion || 0)) {
          return null; // Force sign-out
        }
      }
      // ----------------------------------------------------
  
      return token;
    },
  
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
    error: "/login" // Redirect errors back to login page
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };