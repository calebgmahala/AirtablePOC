const Airtable = require("./airtableCall");

module.exports.handleForeignKeys = (foreignKeys, dataFromDb) => {
  return Promise.all(
    foreignKeys.map(({ fieldName, table }) => {
      return Airtable.getAirtableByCustomField(table, dataFromDb[fieldName]);
    })
  );
};

module.exports.swapIdWithAirtableId = (
  allAirtableForeignKeys,
  foreignKeys,
  DataToSwapOut
) => {
  allAirtableForeignKeys.forEach((airtableForeignKeys, index) => {
    DataToSwapOut[foreignKeys[index].fieldName] = airtableForeignKeys.map(
      val => {
        return val.id;
      }
    );
  });
};

module.exports.addAirtableIdToStoredValues = (
  storedValues,
  allAirtableForeignKeys,
  foreignKeys,
  rowId
) => {
  allAirtableForeignKeys.forEach((airtableForeignKeys, index) => {
    storedValues[rowId][foreignKeys[index].fieldName] = airtableForeignKeys.map(
      key => key.id
    );
  });
};

module.exports.addManyToManyAirtableIdToStoredValues = (
  storedValues,
  allAirtableForeignKeys,
  foreignKeys
) => {
  allAirtableForeignKeys[0].forEach(keysWeEdit => {
    allAirtableForeignKeys[1].forEach(keysWeAdd => {
      if (keysWeEdit.id in storedValues) {
        let value = storedValues[keysWeEdit.id];
        value[foreignKeys[1].fieldName] = value[
          foreignKeys[1].fieldName
        ].concat(keysWeAdd.id);
      } else {
        storedValues[keysWeEdit.id] = {};
        let value = storedValues[keysWeEdit.id];
        value[foreignKeys[1].fieldName] = [keysWeAdd.id];
      }
    });
  });
};

module.exports.removeManyToManyAirtableIdFromStoredValues = (
  storedValues,
  allAirtableForeignKeys,
  foreignKeys
) => {
  allAirtableForeignKeys[0].forEach(keysWeEdit => {
    storedValues[keysWeEdit.id] = {};
    let value = storedValues[keysWeEdit.id];
    value[foreignKeys[1].fieldName] =
      keysWeEdit.fields[foreignKeys[1].fieldName];
    allAirtableForeignKeys[1].forEach(keysWeRemove => {
      value[foreignKeys[1].fieldName].splice(
        value[foreignKeys[1].fieldName].findIndex(e => {
          return (e = keysWeRemove.id);
        }),
        1
      );
    });
  });
};

module.exports.handleError = err => {
  throw err;
};
