require("dotenv").config();

module.exports.env = () => ({
  DATABASE_USERNAME: process.env.DATABASE_USERNAME,
  DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
  DATABASE_HOST: process.env.DATABASE_HOST,
  DATABASE_PORT: process.env.DATABASE_PORT,
  DATABASE_NAME: process.env.DATABASE_NAME,
  AIRTABLE_BASE: process.env.AIRTABLE_BASE,
  AIRTABLE_SECRET: process.env.AIRTABLE_SECRET
});
