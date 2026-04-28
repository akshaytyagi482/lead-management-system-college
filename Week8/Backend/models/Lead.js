const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique:true,
      match: [/\S+@\S+\.\S+/, "Please fill a valid email address"]
    },
    phone: {
      type: String,
      required: true,
      unique:true,
      match: [/^\d{10}$/, "Please fill a valid 10-digit phone number"]
    },
    source: {
      type: String,
      required: true,
      enum: ["website", "google", "facebook", "email", "phone", "referral", "social"],
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Converted", "Lost"],
      default: "New"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    firstResponseAt: {
      type: Date,
      default: null,
    },
    followUpAt: {
      type: Date,
      default: null,
    },
    notes: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    externalLeadId: {
      type: String,
      default: null,
    },
    providerAccountId: {
      type: String,
      default: null,
    },
    fetchedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    }
  },{ timestamps: true }
);

leadSchema.index(
  { source: 1, providerAccountId: 1, externalLeadId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      providerAccountId: { $type: "string" },
      externalLeadId: { $type: "string" },
    },
  }
);

module.exports = mongoose.model("Lead", leadSchema);