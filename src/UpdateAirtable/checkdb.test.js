const checkdb = require("./checkdb");
const Airtable = require("./airtableCall");

jest.mock("./airtableCall");

const mockModel = {
  findAll: jest.fn(() => [
    {
      dataValues: {
        id: 1,
        name: "TestName1",
        image: "TestImage",
        createdAt: "TestDate",
        updatedAt: "TestDate"
      }
    },
    {
      dataValues: {
        id: 2,
        name: "TestName2",
        image: "TestImage",
        createdAt: "TestDate",
        updatedAt: "TestDate"
      }
    }
  ])
};

test("checkdb: POST to Airtable", async () => {
  await checkdb.CheckNew(mockModel, "TestTable", "TestTime");
  mockModel.findAll().forEach((data, index) => {
    expect(Airtable.postAirtable.mock.calls[index]).toEqual([
      "TestTable",
      data.dataValues
    ]);
  });
});

test("checkdb: PUT to Airtable", async () => {
  await checkdb.CheckUpdated(mockModel, "TestTable", "TestTime");
  mockModel.findAll().forEach((data, index) => {
    expect(Airtable.getAirtableIdByCustomField.mock.calls[index]).toEqual([
      "TestTable",
      data.dataValues.id
    ]);
    expect(Airtable.putAirtable.mock.calls[index]).toEqual([
      "TestTable",
      "TestId",
      data.dataValues
    ]);
  });
});

test("checkdb: DELETE from Airtable", async () => {
  await checkdb.CheckDeleted(mockModel, "TestTable", "TestTime");
  mockModel.findAll().forEach((data, index) => {
    expect(Airtable.getAirtableIdByCustomField.mock.calls[index]).toEqual([
      "TestTable",
      data.dataValues.id
    ]);
    expect(Airtable.deleteAirtable.mock.calls[index]).toEqual([
      "TestTable",
      "TestId"
    ]);
  });
});
