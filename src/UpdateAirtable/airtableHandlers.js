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

// Handles normal incoming post request
module.exports.handlePostRequest = async (table, foreignKeys, dataFromDb) => {
  let postData = dataFromDb;
  if (foreignKeys) {
    // Get all airtable foreign key id's
    allAirtableForeignKeys = await handleForeignKeys(foreignKeys, dataFromDb);
    // Swap out current foreign key values with airtables foreign key id's
    swapIdWithAirtableId(allAirtableForeignKeys, foreignKeys, postData);
  }

  return Airtable.postAirtable(table, postData);
};
// Handles normal incoming patch request
module.exports.handlePatchRequest = async (
  storedValues,
  table,
  foreignKeys,
  dataFromDb
) => {
  // Get row from airtable
  const airtableReturnList = await Airtable.getAirtableByCustomField(
    table,
    dataFromDb.id
  );

  for (const row of airtableReturnList) {
    // Add data to object
    storedValues[row.id] = row.fields;

    if (foreignKeys) {
      // Get all airtable foreign key id's
      const allAirtableForeignKeys = await handleForeignKeys(
        foreignKeys,
        dataFromDb
      );
      // Add foreign key data to object
      addAirtableIdToStoredValues(
        storedValues,
        allAirtableForeignKeys,
        foreignKeys,
        row.id
      );
    }
  }
};

// Handles normal incoming delete request
module.exports.handleDeleteRequest = async (table, dataFromDb) => {
  // Get row from airtable
  const airtableReturnList = await Airtable.getAirtableByCustomField(
    table,
    dataFromDb.id
  );

  // For each row in airtable delete that row
  await Promise.all(
    airtableReturnList.map(airtableId => {
      Airtable.deleteAirtable(table, airtableId.id);
    })
  ).catch(err => handleError(err));
};

// Handles many to many tables
module.exports.handleManyToMany = async (
  storedValues,
  foreignKeys,
  dataFromDb,
  shouldDelete = false
) => {
  // Get all foreign keys
  allAirtableForeignKeys = await handleForeignKeys(foreignKeys, dataFromDb);

  if (shouldDelete) {
    // Prep object for deletion
    removeManyToManyAirtableIdFromStoredValues(
      storedValues,
      allAirtableForeignKeys,
      foreignKeys
    );
  } else {
    // Prep object for creation
    addManyToManyAirtableIdToStoredValues(
      storedValues,
      allAirtableForeignKeys,
      foreignKeys
    );
  }
};

// Patch airtable off of Objects values
module.exports.patchFromStoredValues = (storedValues, table) => {
  return Promise.all(
    Object.keys(storedValues).map(key => {
      return Airtable.patchAirtable(table, key, storedValues[key]).catch(
        err => err
      );
    })
  ).catch(err => handleError(err));
};
