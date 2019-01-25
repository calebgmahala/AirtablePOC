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
        updatedAt: "TestDate",
        key1: "TestKey1",
        key2: "TestKey2"
      }
    },
    {
      dataValues: {
        id: 2,
        name: "TestName2",
        image: "TestImage",
        createdAt: "TestDate",
        updatedAt: "TestDate",
        key1: "TestKey1",
        key2: "TestKey2"
      }
    }
  ])
};

beforeEach(() => {
  Airtable.getAirtableIdByCustomField.mockClear();
});

test("checkdb: POST to Airtable", async () => {
  await checkdb.CheckNew(mockModel, "TestTable", "TestTime", {
    key1: "TestKey1",
    key2: "TestKey2"
  });

  mockModel.findAll().forEach((data, index) => {
    const correctDataValues = data.dataValues;
    correctDataValues.key1 = ["TestId"];
    correctDataValues.key2 = ["TestId"];

    expect(Airtable.getAirtableIdByCustomField.mock.calls.length).toEqual(4);

    expect(Airtable.postAirtable.mock.calls[index]).toEqual([
      "TestTable",
      correctDataValues
    ]);
    expect(Airtable.postAirtable()).resolves.toEqual("Done with POST");
  });
});

test("checkdb: PUT to Airtable", async () => {
  await checkdb.CheckUpdated(mockModel, "TestTable", "TestTime", {
    key1: "TestKey1",
    key2: "TestKey2"
  });
  mockModel.findAll().forEach((data, index) => {
    const correctDataValues = data.dataValues;
    correctDataValues.key1 = ["TestId"];
    correctDataValues.key2 = ["TestId"];
    expect(Airtable.putAirtable.mock.calls[index]).toEqual([
      "TestTable",
      "TestId",
      data.dataValues
    ]);
    expect(Airtable.putAirtable()).resolves.toEqual("Done with PUT");
  });
  expect(Airtable.getAirtableIdByCustomField.mock.calls.length).toEqual(6);
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
    expect(Airtable.deleteAirtable()).resolves.toEqual("Done with DELETE");
  });
});

// describe("Fail checkdb", () => {
//   const setup = mockOverrides => {
//     jest.resetModules();
//     return {
//       failAirtable: jest.doMock("./airtableCall", () => ({
//         getAirtableIdByCustomField: jest
//           .fn()
//           .mockRejectedValue([{ id: "Error" }]),
//         getAirtableByAirtableId: jest.fn(),
//         postAirtable: jest.fn().mockRejectedValue("Error"),
//         putAirtable: jest.fn().mockRejectedValue("Error"),
//         deleteAirtable: jest.fn().mockRejectedValue("Error")
//       }))
//     };
//   };

//   test("checkdb-f: POST to Airtable", async () => {
//     const { failAirtable } = setup();
//     console.log(failAirtable);
//     await checkdb.CheckNew(mockModel, "TestTable", "TestTime");
//     mockModel.findAll().forEach((data, index) => {
//       expect(failAirtable.postAirtable()).resolves.toEqual(123);
//     });
//   });
// });
