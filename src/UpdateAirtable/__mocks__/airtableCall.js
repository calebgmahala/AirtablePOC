module.exports = {
  getAirtableIdByCustomField: jest.fn().mockResolvedValue([{ id: "TestId" }]),
  getAirtableByAirtableId: jest.fn(),
  postAirtable: jest.fn().mockResolvedValue("Done with POST"),
  putAirtable: jest.fn().mockResolvedValue("Done with PUT"),
  deleteAirtable: jest.fn().mockResolvedValue("Done with DELETE")
};
