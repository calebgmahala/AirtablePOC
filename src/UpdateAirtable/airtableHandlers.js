const Airtable = require("./airtableCall");
const {
  handleForeignKeys,
  swapIdWithAirtableId,
  addAirtableIdToStoredValues,
  addManyToManyAirtableIdToStoredValues,
  removeManyToManyAirtableIdFromStoredValues
} = require("./airtableHelpers");

const handleError = err => {
  throw err;
};

module.exports.handlePostRequest = async (table, foreignKeys, dataFromDb) => {
  let postData = dataFromDb;

  if (foreignKeys) {
    allAirtableForeignKeys = await handleForeignKeys(foreignKeys, dataFromDb);
    swapIdWithAirtableId(allAirtableForeignKeys, foreignKeys, dataFromDb);
  }

  return Airtable.postAirtable(table, postData);
};

module.exports.handlePatchRequest = async (
  storedValues,
  table,
  foreignKeys,
  dataFromDb
) => {
  const airtableReturnList = await Airtable.getAirtableByCustomField(
    table,
    dataFromDb.id
  );

  for (const row of airtableReturnList) {
    storedValues[row.id] = row.fields;

    if (foreignKeys) {
      const allAirtableForeignKeys = await handleForeignKeys(
        foreignKeys,
        dataFromDb
      );
      addAirtableIdToStoredValues(
        storedValues,
        allAirtableForeignKeys,
        foreignKeys,
        row.id
      );
    }
  }
};

module.exports.handleDeleteRequest = async (table, dataFromDb) => {
  const airtableReturnList = await Airtable.getAirtableByCustomField(
    table,
    dataFromDb.id
  );

  await Promise.all(
    airtableReturnList.map(airtableId => {
      Airtable.deleteAirtable(table, airtableId.id);
    })
  ).catch(err => handleError(err));
};

module.exports.handleManyToMany = async (
  storedValues,
  foreignKeys,
  dataFromDb,
  shouldDelete = false
) => {
  allAirtableForeignKeys = await handleForeignKeys(foreignKeys, dataFromDb);

  if (shouldDelete) {
    removeManyToManyAirtableIdFromStoredValues(
      storedValues,
      allAirtableForeignKeys,
      foreignKeys
    );
  } else {
    addManyToManyAirtableIdToStoredValues(
      storedValues,
      allAirtableForeignKeys,
      foreignKeys
    );
  }
};

module.exports.patchFromStoredValues = (storedValues, table) => {
  return Promise.all(
    Object.keys(storedValues).map(key => {
      return Airtable.patchAirtable(table, key, storedValues[key]).catch(
        err => err
      );
    })
  ).catch(err => handleError(err));
};
