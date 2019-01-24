const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "artist",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      name: Sequelize.STRING(64),
      image: Sequelize.STRING(128),
      createdAt: { type: Sequelize.DATE, field: "createdat" },
      updatedAt: { type: Sequelize.DATE, field: "updatedat" },
      deletedAt: { type: Sequelize.DATE, field: "deletedat" }
    },
    {
      paranoid: true
    }
  );
};
