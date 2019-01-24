require("dotenv").config({ path: "../../.env" });
const Sequelize = require("sequelize");
const Airtable = require("./airtableCall");

const Op = Sequelize.Op;

// CHECK FOR NEW
// -------------
module.exports.CheckNew = async (model, table, lastRun) => {
  // Find all data in database created since last lambda run
  const newData = await model.findAll({
    attributes: { exclude: ["deletedAt"] },
    where: {
      createdAt: {
        [Op.gte]: lastRun
      }
    }
  });
  // POST all data to airtable
  await Promise.all(
    newData.map(data => {
      return Airtable.postAirtable(table, data.dataValues);
    })
  );
};

// CHECK FOR UPDATED
// -----------------
module.exports.CheckUpdated = async (model, table, lastRun) => {
  // Find all data in database updated since last lambda run
  const updatedData = await model.findAll({
    attributes: { exclude: ["deletedAt"] },
    where: {
      updatedAt: {
        [Op.gte]: lastRun
      }
    }
  });
  await Promise.all(
    updatedData.map(data => {
      return Airtable.getAirtableIdByCustomField(table, data.id).then(
        async records => {
          // PUT data to airtable
          await Promise.all(
            records.map(record => {
              return Airtable.putAirtable(table, record.id, data.dataValues);
            })
          );
        }
      );
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
      return Airtable.getAirtableIdByCustomField(table, data.id).then(
        async records => {
          // DELETE data from airtable
          await Promise.all(
            records.map(record => {
              return Airtable.deleteAirtable(table, record.id);
            })
          );
        }
      );
    })
  );
};
