const Models = require("../../models/index");
const Checkdb = require("./checkdb");
const Tables = Models.tables;
("use strict");

// SEQUELIZE MODELS AND RESPECTIVE DATABASE TABLES TO BE TESTED
// ------------------------------------------------------------

module.exports.updateAirtable = async (event, context) => {
  // Sets current date and calculates the last date this function ran
  const currentDate = new Date();
  const lastRun = currentDate.setMinutes(currentDate.getMinutes() - 5);

  await Promise.all(
    Object.keys(Tables).map(async model => {
      return Promise.all([
        Checkdb.CheckNew(Models[model], Tables[model], lastRun),
        Checkdb.CheckUpdated(Models[model], Tables[model], lastRun),
        Checkdb.CheckDeleted(Models[model], Tables[model], lastRun)
      ]);
    })
  )
    .then(() => {
      console.log("here");
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
