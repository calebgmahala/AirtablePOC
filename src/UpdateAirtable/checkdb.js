require("dotenv").config({ path: "../../.env" });
const Sequelize = require("sequelize");
const Airtable = require("./airtableCall");

const Op = Sequelize.Op;

const promiseMtoM = values => {
  return Promise.all(
    values[0].map(row => {
      const primary = Object.keys(foreignKeys)[0];
      const secondary = Object.keys(foreignKeys)[1];
      let data = {};
      data[secondary] = [];
      if (row.fields[secondary]) {
        data[secondary] = row.fields[secondary];
      } else {
        row.fields[secondary] = [];
      }
      values[1].forEach(val => {
        data[secondary] = data[secondary].concat(val.id);
      });
      data[secondary.concat(row.fields[secondary])];
      return Airtable.patchAirtable(foreignKeys[primary], row.id, data);
    })
  );
};

// CHECK FOR NEW
// -------------
module.exports.CheckNew = async (model, table, lastRun, foreignKeys, MtoM) => {
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
      await Promise.all(
        Object.keys(foreignKeys).map(key => {
          return Airtable.getAirtableIdByCustomField(
            foreignKeys[key],
            data.dataValues[key]
          );
        })
      ).then(async values => {
        if (MtoM) {
          await Promise.all(
            values[0].map(row => {
              const primary = Object.keys(foreignKeys)[0];
              const secondary = Object.keys(foreignKeys)[1];
              let data = {};
              data[secondary] = [];
              if (row.fields[secondary]) {
                data[secondary] = row.fields[secondary];
              } else {
                row.fields[secondary] = [];
              }
              values[1].forEach(val => {
                data[secondary] = data[secondary].concat(val.id);
              });
              data[secondary.concat(row.fields[secondary])];
              return Airtable.patchAirtable(foreignKeys[primary], row.id, data);
            })
          );
        } else {
          // Substitute foreign key from db with foreign key from airtable
          values.forEach((key, index) => {
            data.dataValues[Object.keys(foreignKeys)[index]] = key.map(val => {
              return val.id;
            });
          });
        }
      });

      // POST all data to airtable
      if (MtoM != true) {
        return (
          Airtable.postAirtable(table, data.dataValues)
            // .then(resp => console.log(resp))
            .catch(err => console.log("this is err: " + err))
        );
      }
    })
  );
};

// CHECK FOR UPDATED
// -----------------
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
      await Promise.all(
        Object.keys(foreignKeys).map(key => {
          return Airtable.getAirtableIdByCustomField(
            foreignKeys[key],
            data.dataValues[key]
          );
        })
      ).then(values => {
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
// -----------------
module.exports.CheckDeleted = async (model, table, lastRun) => {
  // Find all data in database deleted since last lambda run
  const deletedData = await model.findAll({
    attributes: ["id"],
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
    })
  );
};
