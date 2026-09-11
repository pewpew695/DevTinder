const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA = [
  "firstName",
  "lastName",
  "age",
  "gender",
  "skills",
  "description",
  "photoURL",
];

userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    //Find all connections of logged in User where status = Interested & return Data of connection request along with information from User

    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    console.log(loggedInUser._id);
    res.json({ message: "Connection Requests Found", connectionRequests });
  } catch (err) {
    req.status(400).send("Error: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  const loggedInUser = req.user;
  try {
    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);
    console.log("check:", connectionRequests);
    const data = connectionRequests
      .map((row) => {
        if (row.fromUserId._id.equals(loggedInUser._id)) {
          return row.toUserId;
        } else {
          return row.fromUserId;
        }
      })
      .filter((user) => user !== null);
      console.log("checkdata:", data);
    res.json({ data });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    // Display all users in user connection & also avoid displaying current user & all the persons for whom connection has been made previously

    // To return specific number of data wheen feed is called to mimic pagination. take inputs from request & pass the same as filters for the feed API
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;
    console.log(page + "&" + limit);
    // Get all connections request sent/received with current user logged in & join with User connection for fromUserId & toUserId
    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select(["fromUserId", "toUserId"]);

    // Create a new Set. We use this as the property of a set is to not allow duplicate value insertion. So final set will be having unique values
    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    // Get list of all Users except those to be hidden & avoid current user details. Array from is to convert set to an array as the not in lgical operator is expecting an array
    const users = await User.find({
      $and: [
        {
          _id: {
            $nin: Array.from(hideUsersFromFeed),
          },
        },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json(users);
  } catch (err) {
    res.status(400).send("Err: " + err.message);
  }
});

module.exports = userRouter;
