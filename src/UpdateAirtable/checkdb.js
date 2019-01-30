require("dotenv").config({ path: "../../.env" });
const Sequelize = require("sequelize");
const Airtable = require("./airtableCall");

const Op = Sequelize.Op;

// Many to many helper
const promiseMtoM = (values, foreignKeys, store, del = false) => {
  // Other key we are pulling data from to add to store
  const secondary = Object.keys(foreignKeys)[1];

  // Look through the foreign key values
  values[0].forEach(row => {
    values[1].forEach(val => {
      if (store[row.id] != undefined) {
        store[row.id][secondary] = store[row.id][secondary].concat(val.id);
      } else {
        store[row.id] = {};
        if (del == true) {
          store[row.id][secondary] = row.fields[secondary];
          store[row.id][secondary].splice(
            store[row.id][secondary].findIndex(e => {
              return (e = val.id);
            }),
            1
          );
        } else {
          store[row.id][secondary] = [val.id];
        }
      }
    });
  });
};

// Patch request for many to many helper
const promiseMtoMPatch = (foreignKeys, store) => {
  return Promise.all(
    Object.keys(store).map(key => {
      return Airtable.patchAirtable(
        foreignKeys[Object.keys(foreignKeys)[0]],
        key,
        store[key]
      ).catch(err => err);
    })
  ).catch(err => err);
};

// Foreign key Iterator
const eachForeignKey = (foreignKeys, data, all = null) => {
  if ((all = null)) {
    return Object.keys(foreignKeys).map(key => {
      return Airtable.getAirtableIdByCustomField(
        foreignKeys[key],
        data.dataValues[key]
      ).catch(err => {
        throw err;
      });
    });
  } else {
    return Object.keys(foreignKeys).map(key => {
      return Airtable.getAirtableIdByCustomField(
        foreignKeys[key],
        data.dataValues[key],
        (customField = "id"),
        (offset = null),
        (fields = "all")
      ).catch(err => {
        throw err;
      });
    });
  }
};

// CHECK FOR NEW
module.exports.CheckNew = async (model, table, lastRun, foreignKeys, MtoM) => {
  let store = {};
  // Find all data in database created since last lambda run
  const newData = await model.findAll({
    attributes: { exclude: ["deletedAt"] },
    where: {
      createdAt: {
        [Op.gte]: lastRun
      }
    }
  });

  // Find foreign keys id's in airtable
  await Promise.all(
    newData.map(async data => {
      await Promise.all(eachForeignKey(foreignKeys, data))
        .then(async values => {
          if (MtoM) {
            await promiseMtoM(values, foreignKeys, store);
          } else {
            // Substitute foreign key from db with foreign key from airtable
            values.forEach((key, index) => {
              data.dataValues[Object.keys(foreignKeys)[index]] = key.map(
                val => {
                  return val.id;
                }
              );
            });
          }
        })
        .catch(err => {
          throw err;
        });
      // POST all data to airtable
      if (MtoM != true) {
        return Airtable.postAirtable(table, data.dataValues).catch(err => {
          throw err;
        });
      }
      await promiseMtoMPatch(foreignKeys, store);
    })
  );
};

// CHECK FOR UPDATED
module.exports.CheckUpdated = async (model, table, lastRun, foreignKeys) => {
  // Find all data in database updated since last lambda run
  const updatedData = await model.findAll({
    attributes: { exclude: ["deletedAt"] },
    where: {
      updatedAt: {
        [Op.gte]: lastRun
      }
    }
  });

  // Find foreign keys id's in airtable
  await Promise.all(
    updatedData.map(async data => {
      await Promise.all(eachForeignKey(foreignKeys, data)).then(values => {
        // Substitute foreign key from db with foreign key from airtable
        values.forEach((key, index) => {
          data.dataValues[Object.keys(foreignKeys)[index]] = key.map(val => {
            return val.id;
          });
        });
      });

      // Get the airtable id of the row to be updated
      return Airtable.getAirtableIdByCustomField(
        table,
        data.dataValues.id
      ).then(async records => {
        // PUT data to airtable
        await Promise.all(
          records.map(record => {
            return Airtable.patchAirtable(table, record.id, data.dataValues);
          })
        );
      });
    })
  );
};

// CHECK FOR DELETED
module.exports.CheckDeleted = async (
  model,
  table,
  lastRun,
  foreignKeys,
  MtoM
) => {
  let newList = {};
  // Find all data in database deleted since last lambda run
  const deletedData = await model.findAll({
    attributes: MtoM ? Object.keys(foreignKeys) : ["id"],
    paranoid: false,
    where: {
      deletedAt: {
        [Op.gte]: lastRun
      }
    }
  });
  // Get data from airtable (we need the airtable id in order to query for delete)
  await Promise.all(
    deletedData.map(data => {
      if (MtoM == true) {
        // Find foreign keys id's in airtable
        return Promise.all(eachForeignKey(foreignKeys, data, "all")).then(
          async values => {
            console.log("here");
            await promiseMtoM(values, foreignKeys, newList, (del = true));
            console.log("moving on");
          }
        );
      } else {
        return Airtable.getAirtableIdByCustomField(
          table,
          data.dataValues.id
        ).then(async records => {
          // DELETE data from airtable
          await Promise.all(
            records.map(record => {
              return Airtable.deleteAirtable(table, record.id);
            })
          );
        });
      }
    })
  );
  console.log(newList);
  await promiseMtoMPatch(foreignKeys, newList);
};
