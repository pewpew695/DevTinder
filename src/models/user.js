const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
  },
  emailId: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  password: {
    type: String,
  },
  age: {
    type: Number,
  },
  gender: {
    type: String,
    lowercase: true,
    validate(value) {
      if (!["male", "female", "others"].includes(value)) {
        throw new Error("Gender data not valid");
      }
    },
  },
  description: {
    type: String,
    default: "Hello!!!",
  },
  skills: [String],
  photoURL: { type: String },
});

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user.id }, "Dev@tinder13456", {
    expiresIn: "1h",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordByUser) {
  const user = this;

  const isValidPassword = await bcrypt.compare(passwordByUser, user.password);
  return isValidPassword;
};
module.exports = mongoose.model("User", userSchema);
