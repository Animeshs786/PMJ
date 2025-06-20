const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const salePersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: Date,
    userId: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "salePerson",
    },
  },
  {
    timestamps: true,
  }
);

// hash user password
salePersonSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

//instence method for comparing the password
salePersonSchema.methods.comparePassword = async function (currentPassword) {
  return await bcrypt.compare(currentPassword, this.password);
};

const SalePerson = mongoose.model("SalePerson", salePersonSchema);
module.exports = SalePerson;
