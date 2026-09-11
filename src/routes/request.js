const express = require("express");
const requestRouter = express.Router();
const User = require("../models/user");

const { userAuth } = require("../middlewares/auth");

const ConnectionRequest = require("../models/connectionRequest");

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      // Check If the connection request is having valid status & only then proceed
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: `'${status}' is invalid status type`,
        });
      }

      //Check if user for whom coonnection request is being checked, exists in our db
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(400).json({
          message: "Connection request sent for a User which does not exist",
        });
      }

      // Check if there is already same connection request previoulsy made. Continue only if not there.
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          {
            fromUserId,
            toUserId,
          },
          {
            fromUserId: toUserId,
            toUserId: fromUserId,
          },
        ],
      });
      if (existingConnectionRequest) {
        return res.status(400).json({
          message: "Same connection Already Exists",
        });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });
      const data = await connectionRequest.save();

      res.json({
        message: `${req.user.firstName} has sent connection request to ${toUser.firstName} with status as '${status}'`,
        data,
      });
    } catch (err) {
      res.status(400).send("Error : " + err.message);
    }

    res.send("Hello");
  },
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      //Check if current user present in connection request
      // Check if reqid present in connection reqd - test@1238
      // Hello12 has sent connection request to Hello11 with status as 'interested'",
      //validate status

      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Status is not Allowed" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        fromUserId: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        return res.status(404).json({
          message: "Connection Request not found",
          requestId,
          loggedInUserId: loggedInUser._id,
        });
      }

      connectionRequest.status = status;
      const data = await connectionRequest.save();

      res.json({ message: "Connection request " + status, data });
    } catch (err) {
      res.status(400).send("Error: " + err.message);
    }
  },
);

module.exports = requestRouter;
