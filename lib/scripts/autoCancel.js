require("dotenv").config();
const cron = require("node-cron");
const axios = require("axios");

const CRON_SECRET = process.env.INTERNAL_CRON_SECRET;

const autoCancel = async () => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/admin/auto-cancel-reservations",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${CRON_SECRET}`,
        },
      }
    );
    console.log("Auto cancel response:", response.data);
  } catch (error) {
    console.error("Error during auto cancel:", error);
  }
};

const markNoShows = async () => {
  try {
    console.log("Marking no shows...");
    const response = await axios.post(
      "http://localhost:3000/api/admin/mark-no-shows",
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${CRON_SECRET}`,
        },
      }
    );
    console.log("Mark no shows response:", response.data);
  } catch (error) {
    console.error("Error during mark no shows:", error);
  }
};

/// Schedule the auto cancel and mark no shows tasks
// This will run every day at 7 PM
cron.schedule("0 19 * * *", async () => {
  await autoCancel();
  await markNoShows();
});
