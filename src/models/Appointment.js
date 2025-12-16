import mongoose from "mongoose";

const AppointmentSchema = new mongoose.Schema(
  {
    // ---------------------------
    // RELATIONSHIPS
    // ---------------------------

    // Who booked the appointment
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Identity of expert (User)
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ExpertProfile used to generate pricing + services
    expertProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpertProfile",
      required: true,
      index: true,
    },

    // ---------------------------
    // SCHEDULING
    // ---------------------------
    appointmentDate: {
      type: Date,
      required: true,
    },

    appointmentTime: {
      type: String, // 24h format: "14:30"
      required: true,
    },

    // ---------------------------
    // SNAPSHOT DATA
    // ---------------------------
    serviceName: {
      type: String,
      required: true,
    },

    appointmentType: {
      type: String,
      enum: ["Video Call", "Clinic Visit"],
      required: true,
    },

    duration: {
      type: Number, // minutes
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    // ---------------------------
    // STATUS + PAYMENT
    // ---------------------------
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed", "no-show"],
      default: "pending",
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentId: {
      type: String,
      trim: true,
    },

    // ---------------------------
    // SESSION META
    // ---------------------------
    meetingId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    whiteboardUrl: {
      type: String,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // ---------------------------
    // CANCELLATION META
    // ---------------------------
    cancelledBy: {
      type: String,
      enum: ["user", "expert", "admin", null],
      default: null,
    },

    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// --------------------------------------------
// PREVENT DOUBLE BOOKING FOR EXPERT
// --------------------------------------------
AppointmentSchema.index(
  { expertId: 1, appointmentDate: 1, appointmentTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["pending", "confirmed"] } },
  }
);

export default mongoose.models.Appointment ||
  mongoose.model("Appointment", AppointmentSchema);
