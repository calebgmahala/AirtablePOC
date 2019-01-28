const checkdb = require("./checkdb");
const Airtable = require("./airtableCall");

jest.mock("./airtableCall");
// const getAirtableIdByCustomField = jest
//   .fn()
//   .mockResolvedValue([{ id: "TestId" }])
//   .bind(Airtable);

// const getAirtableByAirtableId = jest.fn();

// const postAirtable = jest
//   .fn()
//   .mockResolvedValue("Done with POST")
//   .bind(Airtable);

// const putAirtable = jest
//   .fn()
//   .mockResolvedValue("Done with PUT")
//   .bind(Airtable);

// const deleteAirtable = jest
//   .fn()
//   .mockResolvedValue("Done with DELETE")
//   .bind(Airtable);

// console.log(Airtable);

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

const mockMtoMModel = {
  findAll: jest.fn(() => [
    {
      dataValues: {
        id: 1,
        createdAt: "TestDate",
        updatedAt: "TestDate",
        key1: "TestKey1",
        key2: "TestKey2"
      }
    },
    {
      dataValues: {
        id: 2,
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
  Airtable.postAirtable.mockClear();
});

describe("POST tests", () => {
  test("checkdb-POST: All data", async () => {
    const data = mockModel.findAll();
    await checkdb.CheckNew(mockModel, "TestTable", "TestTime", {}, false);

    data.forEach((row, index) => {
      expect(Airtable.postAirtable.mock.calls[index]).toEqual([
        "TestTable",
        row.dataValues
      ]);

      expect(Airtable.getAirtableIdByCustomField.mock.calls.length).toEqual(0);
    });
  });

  test("checkdb-POST: Data with foreign keys", async () => {
    await checkdb.CheckNew(
      mockModel,
      "TestTable",
      "TestTime",
      {
        key1: "TestKey1",
        key2: "TestKey2"
      },
      false
    );

    mockModel.findAll().forEach((data, index) => {
      const correctDataValues = data.dataValues;
      correctDataValues.key1 = ["TestId"];
      correctDataValues.key2 = ["TestId"];

      expect(Airtable.postAirtable.mock.calls[index]).toEqual([
        "TestTable",
        correctDataValues
      ]);

      expect(Airtable.getAirtableIdByCustomField.mock.calls.length).toEqual(4);
    });
  });

  test("checkdb-POST To Airtable (2 foreign keys)(Many to Many)", async () => {
    const foreignKeys = {
      key1: "TestTable1",
      key2: "TestTable2"
    };
    await checkdb.CheckNew(
      mockMtoMModel,
      "TestTable",
      "TestTime",
      foreignKeys,
      true
    );

    mockMtoMModel.findAll().forEach((row, index) => {
      let correctDataValues = {};
      correctDataValues[[Object.keys(foreignKeys)[1]]] = [
        "TestMtoMLinks",
        "TestId"
      ];
      expect(
        Airtable.getAirtableIdByCustomField.mock.calls[index + index]
      ).toEqual([
        foreignKeys[Object.keys(foreignKeys)[0]],
        row.dataValues[Object.keys(foreignKeys)[0]]
      ]);

      expect(
        Airtable.getAirtableIdByCustomField.mock.calls[index + index + 1]
      ).toEqual([
        foreignKeys[Object.keys(foreignKeys)[1]],
        row.dataValues[Object.keys(foreignKeys)[1]]
      ]);

      expect(Airtable.patchAirtable.mock.calls[index]).toEqual([
        foreignKeys[Object.keys(foreignKeys)[0]],
        "TestId",
        correctDataValues
      ]);
    });
  });
});

describe("POST fails", () => {
  test("checkdb-POST: Invalid field type");
});

// test("checkdb: PUT to Airtable", async () => {
//   await checkdb.CheckUpdated(mockModel, "TestTable", "TestTime", {
//     key1: "TestKey1",
//     key2: "TestKey2"
//   });
//   mockModel.findAll().forEach((data, index) => {
//     const correctDataValues = data.dataValues;
//     correctDataValues.key1 = ["TestId"];
//     correctDataValues.key2 = ["TestId"];
//     expect(Airtable.putAirtable.mock.calls[index]).toEqual([
//       "TestTable",
//       "TestId",
//       data.dataValues
//     ]);
//     expect(Airtable.putAirtable()).resolves.toEqual("Done with PUT");
//   });
//   expect(Airtable.getAirtableIdByCustomField.mock.calls.length).toEqual(6);
// });

// test("checkdb: DELETE from Airtable", async () => {
//   await checkdb.CheckDeleted(mockModel, "TestTable", "TestTime");
//   mockModel.findAll().forEach((data, index) => {
//     expect(Airtable.getAirtableIdByCustomField.mock.calls[index]).toEqual([
//       "TestTable",
//       data.dataValues.id
//     ]);
//     expect(Airtable.deleteAirtable.mock.calls[index]).toEqual([
//       "TestTable",
//       "TestId"
//     ]);
//     expect(Airtable.deleteAirtable()).resolves.toEqual("Done with DELETE");
//   });
// });

// describe("Fail checkdb", () => {
//   // console.log(Airtable);

//   test("checkdb-f: POST to Airtable", async () => {
//     // console.log(Airtable);
//     await checkdb.CheckNew(mockModel, "TestTable", "TestTime");
//     mockModel.findAll().forEach((data, index) => {
//       expect(failAirtable.postAirtable()).resolves.toEqual(123);
//     });
//   });
// });
