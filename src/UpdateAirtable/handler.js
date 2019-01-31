const sequelizeModels = require("../../models/index");
const {
  checkForCreatedAt,
  checkForUpdatedAt,
  checkForDeletedAt
} = require("./checkdb");

const tables = sequelizeModels.tables;

module.exports.updateAirtable = async (event, context) => {
  // Sets current date and calculates the last date this function ran
  const currentDate = new Date();
  // const lastRun = currentDate.setMinutes(currentDate.getMinutes() - 5);
  const lastRun = currentDate.setMinutes(currentDate.getMinutes() - 100000);

  for (const { model, table, foreignKeys, isManyToMany } of tables) {
    console.log(table + "-------");
    await checkForCreatedAt(
      sequelizeModels[model],
      table,
      lastRun,
      foreignKeys,
      isManyToMany
    );
    if (!isManyToMany) {
      await checkForUpdatedAt(
        sequelizeModels[model],
        table,
        lastRun,
        foreignKeys
      );
    }
    await checkForDeletedAt(
      sequelizeModels[model],
      table,
      lastRun,
      foreignKeys,
      isManyToMany
    );
  }
};
