const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "user",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      username: Sequelize.STRING(64),
      password: Sequelize.STRING(64),
      createdAt: { type: Sequelize.DATE, field: "createdat" },
      updatedAt: { type: Sequelize.DATE, field: "updatedat" },
      deletedAt: { type: Sequelize.DATE, field: "deletedat" }
    },
    {
      paranoid: true
    }
  );
};
