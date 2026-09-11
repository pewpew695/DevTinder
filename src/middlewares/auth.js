const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuth = async (req, res, next) => {
  try {
    //Read the token fromt the user
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login!");
    }

    //Validate the token
    const decodedObj = await jwt.verify(token, "Dev@tinder13456");
    console.log("checked");
    const { _id } = decodedObj;
    const user = await User.findById(_id);

    //Find the username
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
};

module.exports = { userAuth };
