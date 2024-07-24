// Cron SETUP
const cron = require("node-cron");
const dotenv = require("dotenv");
const { ProcessFailure } = require("../controllers/task");

const pool = require("../config/db");
//load env vars
dotenv.config({ path: "./config/config.env" });

cron.schedule("*/10 * * * * *", async function () {
  console.log("running a task every 10 seconds");
  ProcessFailure();
});
