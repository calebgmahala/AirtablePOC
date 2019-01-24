const Models = require("../../models/index");
const Checkdb = require("./checkdb");
("use strict");

// SEQUELIZE MODELS AND RESPECTIVE DATABASE TABLES TO BE TESTED
// ------------------------------------------------------------
const models = {
  Artist: "artists",
  Album: "albums",
  User_Album: "users_albums"
};

module.exports.updateAirtable = async (event, context) => {
  // Sets current date and calculates the last date this function ran
  const currentDate = new Date();
  const lastRun = currentDate.setMinutes(currentDate.getMinutes() - 5);

  await Promise.all(
    Object.keys(models).map(async model => {
      return Promise.all([
        Checkdb.CheckNew(Models[model], models[model], lastRun),
        Checkdb.CheckUpdated(Models[model], models[model], lastRun),
        Checkdb.CheckDeleted(Models[model], models[model], lastRun)
      ]);
    })
  )
    .then(() => {
      return {
        statusCode: 200,
        body: JSON.stringify("done")
      };
    })
    .catch(() => {
      return {
        statusCode: 404,
        body: JSON.stringify("err")
      };
    });
};
