import mongoose, { Schema } from "mongoose";

const UserProfileSchema = new Schema(
  {
    // Link to the Auth User
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // --- REAL-TIME STATUS (Extracted) ---
    isOnline: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    lastSeen: {
      type: Date,
    },

    // --- PREFERENCES (Extracted) ---
    notificationPreferences: {
      marketing: { type: Boolean, default: false },
      transactional: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
    },
  },
  { 
    timestamps: true, // Matches your raw schema
    collection: "user_profiles" 
  }
);

export default mongoose.models.UserProfile || mongoose.model("UserProfile", UserProfileSchema);