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

cron.schedule("0 17 * * *", async () => {
  await autoCancel();
});
