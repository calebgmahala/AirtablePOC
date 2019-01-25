module.exports = {
  getAirtableIdByCustomField: jest.fn().mockResolvedValue([{ id: "TestId" }]),
  getAirtableByAirtableId: jest.fn(),
  postAirtable: jest.fn(),
  putAirtable: jest.fn(),
  deleteAirtable: jest.fn()
};
