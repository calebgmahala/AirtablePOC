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
      password: Sequelize.STRING(64)
    },
    {
      timestamps: false
    }
  );
};
