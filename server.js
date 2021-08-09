// 1) START THE SERVER
const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  // Uncaught exceptions are those errors that occur in synchronous code but are not caught or handled anywhere
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);

  process.exit(1); // 0 stands for success and 1 for failure.
});

dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  //.connect(process.env.DATABASE_LOCAL, {
  // Local server
  .connect(DB, {
    // Hosted server
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful"));

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on("unhandledRejection", (err) => {
  // process object emits an object called unhandledRejection. Whenever there is a unhandled rejection in our app this will work. and this handles error asynchronous code
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    // Time to finish all the request that are still pending or being handled at the time and after that server gets closed.
    process.exit(1); // 0 stands for success and 1 for failure.
  });
});

process.on("SIGTERM", () => {
  console.log("👋🏻 SIGTERM RECEIVED. Shutting down gracefully.");
  server.close(() => {
    console.log("💥 Process terminated!");
  });
});
