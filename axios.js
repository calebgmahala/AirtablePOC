require("dotenv").config({ path: "./.env" });
const axios = require("axios");

module.exports.airtable = axios.create({
  baseURL: "https://api.airtable.com/v0/" + process.env.AIRTABLE_BASE + "/",
  headers: { Authorization: "Bearer " + process.env.AIRTABLE_SECRET }
});
