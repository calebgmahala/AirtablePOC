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
