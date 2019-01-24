const Sequelize = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "album",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true
      },
      title: Sequelize.STRING(64),
      artistid: Sequelize.STRING(64),
      url: Sequelize.STRING(128),
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
