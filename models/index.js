const Sequelize = require("sequelize");
require("dotenv").config({ path: "../.env" });

const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USERNAME,
  process.env.DATABASE_PASSWORD,
  {
    dialect: "postgres",
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    omitNull: true
  }
);

const models = ["Artist", "User", "Album", "User_Album"];

models.map(model => {
  module.exports[model] = sequelize.import(__dirname + "/" + model);
});

(m => {
  m.Album.belongsTo(m.Artist, {
    foreignKey: "artistid"
  });
  m.Album.belongsToMany(m.User, {
    through: m.User_Album,
    foreignKey: "albumid"
  });
  m.User.belongsToMany(m.Album, {
    through: m.User_Album,
    foreignKey: "userid"
  });
})(module.exports);

module.exports.sequelize = sequelize;
