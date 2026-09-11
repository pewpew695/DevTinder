const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb://admin:winman1@ac-nise9bl-shard-00-00.wyrhzn6.mongodb.net:27017,ac-nise9bl-shard-00-01.wyrhzn6.mongodb.net:27017,ac-nise9bl-shard-00-02.wyrhzn6.mongodb.net:27017/DevTinder?ssl=true&replicaSet=atlas-jgezpd-shard-0&authSource=admin&appName=NamasteNode",
  );
};

module.exports = connectDB;
