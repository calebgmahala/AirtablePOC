const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "user_album",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      userid: Sequelize.INTEGER,
      albumid: Sequelize.INTEGER,
      createdAt: { type: Sequelize.DATE, field: "createdat" },
      updatedAt: { type: Sequelize.DATE, field: "updatedat" },
      deletedAt: { type: Sequelize.DATE, field: "deletedat" }
    },
    {
      paranoid: true
    }
  );
};
