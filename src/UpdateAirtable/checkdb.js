const Sequelize = require("sequelize");
const {
  handlePostRequest,
  handlePatchRequest,
  handleDeleteRequest,
  handleManyToMany,
  patchFromStoredValues
} = require("./airtableHandlers");

const Op = Sequelize.Op;

const handleError = err => {
  throw err;
};

module.exports.checkForCreatedAt = async (
  model,
  table,
  lastRun,
  foreignKeys = null,
  isManyToMany = false
) => {
  console.log("createdAt");
  let storedValues = {};
  const createdAtRows = await model.findAll({
    attributes: { exclude: ["deletedAt"] },
    where: {
      createdAt: {
        [Op.gte]: lastRun
      }
    }
  });

  await Promise.all(
    createdAtRows.map(({ dataValues }) => {
      if (isManyToMany) {
        return handleManyToMany(storedValues, foreignKeys, dataValues);
      } else {
        return handlePostRequest(table, foreignKeys, dataValues);
      }
    })
  ).catch(err => handleError(err));

  if (isManyToMany) {
    await patchFromStoredValues(storedValues, foreignKeys[0].table);
  }
};

module.exports.checkForUpdatedAt = async (
  model,
  table,
  lastRun,
  foreignKeys = null
) => {
  console.log("updatedAt");
  let storedValues = {};
  const updatedAtRows = await model.findAll({
    attributes: { exclude: ["deletedAt"] },
    where: {
      updatedAt: {
        [Op.gte]: lastRun
      }
    }
  });
  updatedAtRows.forEach(({ createdAt, updatedAt }, index, object) => {
    if (createdAt.valueOf() === updatedAt.valueOf()) {
      delete object[index];
    }
  });

  await Promise.all(
    updatedAtRows.map(({ dataValues }) => {
      return handlePatchRequest(storedValues, table, foreignKeys, dataValues);
    })
  ).catch(err => handleError(err));
  await patchFromStoredValues(storedValues, table);
};

module.exports.checkForDeletedAt = async (
  model,
  table,
  lastRun,
  foreignKeys = {},
  isManyToMany = false
) => {
  console.log("deletedAt");
  let storedValues = {};
  const deletedAtRows = await model.findAll({
    attributes: isManyToMany ? foreignKeys.map(key => key.fieldName) : ["id"],
    paranoid: false,
    where: {
      deletedAt: {
        [Op.gte]: lastRun
      }
    }
  });

  await Promise.all(
    deletedAtRows.map(({ dataValues }) => {
      if (isManyToMany) {
        return handleManyToMany(
          storedValues,
          foreignKeys,
          dataValues,
          (shouldDelete = true)
        );
      } else {
        return handleDeleteRequest(table, dataValues);
      }
    })
  ).catch(err => handleError(err));

  if (isManyToMany) {
    await patchFromStoredValues(storedValues, foreignKeys[0].table);
  }
};
