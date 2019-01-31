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
    omitNull: true,
    logging: false
  }
);

/* List of Tables
 * The first keys represent the model name
 * The table key should be the name of the table in the db
 * The keys key should contain the foreign keys of the model.
 * The key of the foreign key should be the name of the column in your db.
 * The value of the foreign key should be the table the key references.
 * The MtoM key is for tables that represents a Many to Many relationship
 * Only set MtoM to true if you plan on using Airtables Many to Many service
 * See example below
 */
module.exports.tables = [
  {
    model: "Artist",
    table: "artists"
  },
  {
    model: "User",
    table: "users"
  },
  {
    model: "Album",
    table: "albums",
    foreignKeys: [{ fieldName: "artistid", table: "artists" }]
  },
  {
    model: "User_Album",
    table: "user_albums",
    foreignKeys: [
      {
        fieldName: "userid",
        table: "users"
      },
      {
        fieldName: "albumid",
        table: "albums"
      }
    ],
    isManyToMany: true
  }
];

// List of models to include in the export
const sequelizeModels = ["Artist", "User", "Album", "User_Album"];
sequelizeModels.map(model => {
  module.exports[model] = sequelize.import(__dirname + "/" + model);
});

// Foreign key connections
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
