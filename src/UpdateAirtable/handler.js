const Models = require("../../models/index");
const Checkdb = require("./checkdb");
const Tables = Models.tables;
("use strict");

// Helper functions
const promisedb = checklist => {
  return Promise.all(checklist)
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

module.exports.updateAirtable = async (event, context) => {
  // Sets current date and calculates the last date this function ran
  const currentDate = new Date();
  // --const lastRun = currentDate.setMinutes(currentDate.getMinutes() - 5);
  const lastRun = currentDate.setMinutes(currentDate.getMinutes() - 100000);

  /* Params
   * Models[model] = sequelize model
   * Tables[model].table = db table name
   * lastRun = last run of lambda function
   * Tables[model].keys = foreign keys
   * Tables[model].MtoM = Many to Many relationship (true:false)
   */
  for (const model of Object.keys(Tables)) {
    // Variable to minimize requests for many to many relationship tables
    let dbcheck = [
      Checkdb.CheckNew(
        Models[model],
        Tables[model].table,
        lastRun,
        Tables[model].keys,
        Tables[model].MtoM
      ),
      Checkdb.CheckDeleted(Models[model], Tables[model].table, lastRun)
    ];

    if (Tables[model].MtoM) {
      await promisedb(dbcheck);
    } else {
      dbcheck.splice(
        1,
        0,
        Checkdb.CheckUpdated(
          Models[model],
          Tables[model].table,
          lastRun,
          Tables[model].keys
        )
      );
      await promisedb(dbcheck);
    }
  }
};
