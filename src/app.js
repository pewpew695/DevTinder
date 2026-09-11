const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

const cookieParser = require("cookie-parser");
const cors = require("cors");

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Request logger
// app.use((req, res, next) => {
//   console.log("REQUEST:", req.method, req.url);
//   next();
// });

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Routers
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

// DELETE user
app.delete("/delete", async (req, res) => {
  const userId = req.body.userId;

  try {
    const user = await User.findByIdAndDelete(userId);

    console.log(user);

    res.send("Successfully Deleted");
  } catch (err) {
    res.status(400).send("Something went wrong!!!");
  }
});

// put user
app.patch("/put", async (req, res) => {
  const userId = req.body.userId;
  const data = req.body;

  try {
    await User.findByIdAndUpdate(userId, data, {
      runValidators: true,
    });

    res.send("Changes successfully updated");
  } catch (err) {
    res.status(400).send("Failed: " + err);
  }
});

// GET user by email
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;

  try {
    const users = await User.find({ emailId: userEmail });

    if (users.length === 0) {
      res.send("Email not found!!!");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Something went wrong!!!!");
  }
});

// GET all users - FEED API
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});

    if (users.length === 0) {
      res.send("No data available");
    } else {
      res.send(users);
    }
  } catch (err) {
    res.status(400).send("Something Went Wrong!!!");
  }
});

// Connect DB and start server
connectDB()
  .then(() => {
    console.log("Connection to DB successful");

    app.listen(3000, () => {
      console.log("Listening on port 3000");
    });
  })
  .catch((err) => {
    console.error("Database connection not successful!!!");
    console.error(err);
  });
