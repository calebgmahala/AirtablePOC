module.exports = {
  getAirtableIdByCustomField: jest
    .fn()
    .mockResolvedValue([{ id: "TestId", fields: { key2: ["TestMtoMLinks"] } }]),
  getAirtableByAirtableId: jest.fn(),
  patchAirtable: jest.fn().mockResolvedValue("Done with PATCH"),
  postAirtable: jest.fn().mockResolvedValue("Done with POST"),
  putAirtable: jest.fn().mockResolvedValue("Done with PUT"),
  deleteAirtable: jest.fn().mockResolvedValue("Done with DELETE")
};

// module.exports = {
//   getAirtableIdByCustomField: jest
//     .fn()
//     .mockRejectedValue("Failed to get from airtable"),

//   // getAirtableIdByCustomField: jest
//   //   .fn()
//   //   .mockResolvedValue([{ id: "TestId", fields: { key2: ["TestMtoMLinks"] } }]),

//   getAirtableByAirtableId: jest.fn(),
//   patchAirtable: jest.fn().mockRejectedValue("Failed to patch to airtable"),
//   postAirtable: jest.fn().mockRejectedValue("Failed to post to airtable"),
//   putAirtable: jest.fn().mockRejectedValue("Failed to put to airtable"),
//   deleteAirtable: jest.fn().mockRejectedValue("Failed to delete from airtable")
// };
