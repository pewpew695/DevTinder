const express = require("express");

const app = express();

// app.use("/", (req, res) => {
//   res.send("Namaste!!");
// });

app.get("/user/:userID", (req, res) => {
  console.log(req.params);
  res.send("This is user");
});

app.get("/test", (req, res) => {
  res.send("This is the server!!!!!");
});

app.use("/hello", (req, res) => {
  res.send("Hello hello");
});

app.listen(3000, () => {
  console.log("Listeneing on port 3000");
});
