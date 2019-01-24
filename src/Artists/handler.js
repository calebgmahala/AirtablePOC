const models = require("../../models/index");
("use strict");
const Artist = models.Artist;

module.exports.getArtists = async (event, context) => {
  try {
    const artistData = await Artist.findAll();
    console.log(artistData);
    return {
      statusCode: 200,
      body: JSON.stringify(artistData)
    };
  } catch (err) {
    await client.end();
    return {
      statusCode: 404,
      body: JSON.stringify(err)
    };
  }
};

module.exports.deleteArtist = async (event, context) => {
  console.log(event);
  await Artist.destroy({
    where: {
      id: event
    }
  });
};
