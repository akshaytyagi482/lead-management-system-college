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
      enum: ["website", "google", "facebook"],
    },
    status: {
      type:String,
      default:"New"
    }
  },{ timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);