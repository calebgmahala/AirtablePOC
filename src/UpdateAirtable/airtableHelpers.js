const Airtable = require("./airtableCall");

const handleError = err => {
  throw err;
};

// Returns airtable data for all foreignKeys
module.exports.handleForeignKeys = (foreignKeys, dataFromDb) => {
  return Promise.all(
    foreignKeys.map(({ fieldName, table }) => {
      return Airtable.getAirtableByCustomField(table, dataFromDb[fieldName]);
    })
  ).catch(err => handleError(err));
};

// Swaps db foreign key value with list of airtable id's
module.exports.swapIdWithAirtableId = (
  allAirtableForeignKeys,
  foreignKeys,
  DataToSwapOut
) => {
  allAirtableForeignKeys.forEach((airtableForeignKeys, index) => {
    // Swap foreign key value with the airtableForeignKeys id's
    DataToSwapOut[foreignKeys[index].fieldName] = airtableForeignKeys.map(
      val => {
        return val.id;
      }
    );
  });
};

// Adds list of airtable id's to the objects foreign key trait
module.exports.addAirtableIdToStoredValues = (
  storedValues,
  allAirtableForeignKeys,
  foreignKeys,
  rowId
) => {
  allAirtableForeignKeys.forEach((airtableForeignKeys, index) => {
    // Add airtableForeignKeys id's to the object
    storedValues[rowId][foreignKeys[index].fieldName] = airtableForeignKeys.map(
      key => key.id
    );
  });
};

// Adds list of keysWeAdd to a list of keysWeEdit and appends them to the object
module.exports.addManyToManyAirtableIdToStoredValues = (
  storedValues,
  allAirtableForeignKeys,
  foreignKeys
) => {
  // For each key we are going to patch
  allAirtableForeignKeys[0].forEach(keysWeEdit => {
    // For each key we are going to add to the one we edit
    allAirtableForeignKeys[1].forEach(keysWeAdd => {
      if (keysWeEdit.id in storedValues) {
        // Append value to the object
        storedValues[keysWeEdit.id][foreignKeys[1].fieldName] = value[
          foreignKeys[1].fieldName
        ].concat(keysWeAdd.id);
      } else {
        // Create the object
        storedValues[keysWeEdit.id] = {};
        storedValues[keysWeEdit.id][foreignKeys[1].fieldName] = [keysWeAdd.id];
      }
    });
  });
};

// Removes a list of airtable id's from a list of foreign keys and appends the new list to the object
module.exports.removeManyToManyAirtableIdFromStoredValues = (
  storedValues,
  allAirtableForeignKeys,
  foreignKeys
) => {
  // For each key we patch
  allAirtableForeignKeys[0].forEach(keysWeEdit => {
    // Create the object and fill is with the foreign keys
    storedValues[keysWeEdit.id] = {};
    storedValues[keysWeEdit.id][foreignKeys[1].fieldName] =
      keysWeEdit.fields[foreignKeys[1].fieldName];
    // For each key we need to remove
    allAirtableForeignKeys[1].forEach(keysWeRemove => {
      // Remove the key that matches the one we are trying to remove
      storedValues[keysWeEdit.id][foreignKeys[1].fieldName].splice(
        storedValues[keysWeEdit.id][foreignKeys[1].fieldName].findIndex(e => {
          return (e = keysWeRemove.id);
        }),
        1
      );
    });
  });
};
