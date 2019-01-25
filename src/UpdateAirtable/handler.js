const Models = require("../../models/index");
const Checkdb = require("./checkdb");
const Tables = Models.tables;
("use strict");

// SEQUELIZE MODELS AND RESPECTIVE DATABASE TABLES TO BE TESTED
// ------------------------------------------------------------

module.exports.updateAirtable = async (event, context) => {
  // Sets current date and calculates the last date this function ran
  const currentDate = new Date();
  const lastRun = currentDate.setMinutes(currentDate.getMinutes() - 100);

  /* Params
   * Models[model] = sequelize model
   * Tables[model].table = db table name
   * lastRun = last run of lambda function
   * Tables[model].keys = foreign keys
   */
  await Promise.all(
    Object.keys(Tables).map(async model => {
      return Promise.all([
        Checkdb.CheckNew(
          Models[model],
          Tables[model].table,
          lastRun,
          Tables[model].keys
        ),
        Checkdb.CheckUpdated(
          Models[model],
          Tables[model].table,
          lastRun,
          Tables[model].keys
        ),
        Checkdb.CheckDeleted(Models[model], Tables[model].table, lastRun)
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
