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
    logging: false // Set to true for query logs
  }
);

/* List of tables that will get updated
 * model is sequelize model
 * table is the airtable table name
 * foreignKeys is an array of foreignKeys (Defaults to null)
 * * fieldName is db fieldName
 * * table is referenced table
 * isManyToMany is for linking tables (Defaults to false)
 * * you can leave isManyToMany false if you want the table displayed in airtable
 */
module.exports.tables = [
  // {
  //   model: "Artist",
  //   table: "artists"
  // },
  // {
  //   model: "User",
  //   table: "users"
  // },
  // {
  //   model: "Album",
  //   table: "albums",
  //   foreignKeys: [{ fieldName: "artistid", table: "artists" }]
  // },
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
