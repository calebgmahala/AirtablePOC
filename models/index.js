const Sequelize = require("sequelize");
require("dotenv").config({ path: "../.env" });

// Sequelize connection
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

/* List of Tables
 * The first keys represent the model name
 * The table key should be the name of the table in the db
 * The keys key should contain the foreign keys of the model.
 * The key of the foreign key should be the name of the column in your db.
 * The value of the foreign key should be the table the key references
 * See example below
 */
module.exports.tables = {
  Artist: { table: "artists", keys: [] },
  Album: { table: "albums", keys: { artistid: "artists" } },
  User_Album: {
    table: "user_albums",
    keys: { userid: "users", albumid: "albums" }
  }
};

// List of models to include in the export
const models = ["Artist", "User", "Album", "User_Album"];
models.map(model => {
  module.exports[model] = sequelize.import(__dirname + "/" + model);
});

// Connections
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
