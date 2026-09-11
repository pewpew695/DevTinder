const express = require("express");
const authRouter = express.Router();
const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

authRouter.post("/signup", async (req, res) => {
  try {
    //Validate the data
    validateSignUpData(req);

    const {
      firstName,
      lastName,
      emailId,
      password,
      age,
      gender,
      description,
      skills,
      photoURL,
    } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
      description,
      skills,
      photoURL,
    });

    const savedUser = await user.save();
    const token = await savedUser.getJWT();   
    res.cookie("token", token);

    res.json({ message: "User added succesfully!!", data: savedUser });
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid Credential!");
    }
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error("Invalid Credential!");
    } else {
      //Create a JWT Token
      const token = await user.getJWT();
      console.log(token);
      // Add the token to the cookie and sent the response back to user
      res.cookie("token", token);

      res.send(user);
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logged Out Succesfully!!");
});

module.exports = authRouter;
