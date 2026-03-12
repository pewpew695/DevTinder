const express = require("express");
const connectDB = require("./config/database");

const app = express();

connectDB()
  .then(() => {
    console.log("Connnection to DB sucessful");
    app.listen(3000, () => {
      console.log("Listeneing on port 3000");
    });
  })
  .catch((err) => {
    console.error("Database connection not succesful!!!");
    console.error(err);
  });
