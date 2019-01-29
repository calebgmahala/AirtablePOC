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
  Airtable.patchAirtable.mockClear();
  Airtable.postAirtable.mockClear();
  Airtable.deleteAirtable.mockClear();
});

// Tests
describe("POST tests", () => {
  // Test 1
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
    const foreignKeys = { key1: "TestTable1", key2: "TestTable2" };

    await checkdb.CheckNew(
      mockModel,
      "TestTable",
      "TestTime",
      foreignKeys,
      false
    );

    mockModel.findAll().forEach((data, index) => {
      expect(Airtable.getAirtableIdByCustomField.mock.calls[2 * index]).toEqual(
        [
          foreignKeys[Object.keys(foreignKeys)[0]],
          data.dataValues[Object.keys(foreignKeys)[0]]
        ]
      );

      expect(
        Airtable.getAirtableIdByCustomField.mock.calls[2 * index + 1]
      ).toEqual([
        foreignKeys[Object.keys(foreignKeys)[1]],
        data.dataValues[Object.keys(foreignKeys)[1]]
      ]);

      const correctDataValues = data.dataValues;
      correctDataValues.key1 = ["TestId"];
      correctDataValues.key2 = ["TestId"];

      expect(Airtable.postAirtable.mock.calls[index]).toEqual([
        "TestTable",
        correctDataValues
      ]);
    });
  });

  test("checkdb-POST: To Airtable (2 foreign keys)(Many to Many)", async () => {
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
      expect(Airtable.getAirtableIdByCustomField.mock.calls[2 * index]).toEqual(
        [
          foreignKeys[Object.keys(foreignKeys)[0]],
          row.dataValues[Object.keys(foreignKeys)[0]]
        ]
      );

      expect(
        Airtable.getAirtableIdByCustomField.mock.calls[2 * index + 1]
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

describe("PUT test", () => {
  // Test 1
  test("checkdb-PUT: Data", async () => {
    await checkdb.CheckUpdated(mockModel, "TestTable", "TestTime", {});
    mockModel.findAll().forEach((data, index) => {
      expect(Airtable.getAirtableIdByCustomField.mock.calls[index]).toEqual([
        "TestTable",
        data.dataValues.id
      ]);

      expect(Airtable.patchAirtable.mock.calls[index]).toEqual([
        "TestTable",
        "TestId",
        data.dataValues
      ]);
    });
  });

  test("checkdb-PUT: Data with foreign keys", async () => {
    const foreignKeys = { key1: "TestTable1", key2: "TestTable2" };

    await checkdb.CheckUpdated(mockModel, "TestTable", "TestTime", foreignKeys);
    mockModel.findAll().forEach((data, index) => {
      expect(Airtable.getAirtableIdByCustomField.mock.calls[2 * index]).toEqual(
        [
          foreignKeys[Object.keys(foreignKeys)[0]],
          data.dataValues[Object.keys(foreignKeys)[0]]
        ]
      );

      expect(
        Airtable.getAirtableIdByCustomField.mock.calls[2 * index + 1]
      ).toEqual([
        foreignKeys[Object.keys(foreignKeys)[1]],
        data.dataValues[Object.keys(foreignKeys)[1]]
      ]);
      expect(Airtable.getAirtableIdByCustomField.mock.calls[4 + index]).toEqual(
        ["TestTable", data.dataValues.id]
      );

      const correctDataValues = data.dataValues;
      correctDataValues.key1 = ["TestId"];
      correctDataValues.key2 = ["TestId"];

      expect(Airtable.patchAirtable.mock.calls[index]).toEqual([
        "TestTable",
        "TestId",
        data.dataValues
      ]);
    });
  });
});

describe("DELETE test", () => {
  // Test 1
  test("checkdb-DELETE: Data", async () => {
    await checkdb.CheckDeleted(mockModel, "TestTable", "TestTime", {}, false);
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

  test("checkdb-DELETE: Data(Many to Many)", async () => {
    const foreignKeys = { key1: "TestTable1", key2: "TestTable2" };
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
      expect(Airtable.getAirtableIdByCustomField.mock.calls[2 * index]).toEqual(
        [
          foreignKeys[Object.keys(foreignKeys)[0]],
          row.dataValues[Object.keys(foreignKeys)[0]]
        ]
      );

      expect(
        Airtable.getAirtableIdByCustomField.mock.calls[2 * index + 1]
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

// Fail
describe("POST fail", () => {
  //Fail 1
  test("checkdb-POST: Failed post request", async () => {
    await checkdb
      .CheckNew(mockModel, "TestTable", "TestTime", {}, false)
      .catch(err => expect(err).toEqual("Failed to post to airtable"));
  });

  test("checkdb-POST: Failed foreign keys reference request", async () => {
    const foreignKeys = {
      key1: "TestTable1",
      key2: "TestTable2"
    };

    await checkdb
      .CheckNew(mockModel, "TestTable", "TestTime", foreignKeys, false)
      .catch(err => expect(err).toEqual("Failed to get from airtable"));
  });

  test("checkdb-POST: Failed many to many reference request", async () => {
    const foreignKeys = { key1: "TestTable1", key2: "TestTable2" };

    await checkdb
      .CheckNew(mockModel, "TestTable", "TestTime", foreignKeys, true)
      .catch(err => expect(err).toEqual("Failed to get from airtable"));
  });

  //Fail 2
  test("checkdb-POST: Failed foreign keys post request", async () => {
    const foreignKeys = { key1: "TestTable1", key2: "TestTable2" };

    await checkdb
      .CheckNew(mockModel, "TestTable", "TestTime", foreignKeys, false)
      .catch(err => expect(err).toEqual("Failed to post to airtable"));
  });

  test("checkdb-POST: Failed many to many post request", async () => {
    const foreignKeys = { key1: "TestTable1", key2: "TestTable2" };

    await checkdb
      .CheckNew(mockModel, "TestTable", "TestTime", foreignKeys, true)
      .catch(err => expect(err).toEqual("Failed to post to airtable"));
  });
});

describe("PUT fail", () => {
  // Fail 1
  test("checkdb-PUT: Failed put reference request", async () => {
    await checkdb
      .CheckUpdated(mockModel, "TestTable", "TestTime", {}, false)
      .catch(err => expect(err).toEqual("Failed to get from airtable"));
  });

  test("checkdb-PUT: Failed put reference request foreign keys", async () => {
    const foreignKeys = { key1: "TestTable1", key2: "TestTable2" };

    await checkdb
      .CheckUpdated(mockModel, "TestTable", "TestTime", foreignKeys, false)
      .catch(err => expect(err).toEqual("Failed to get from airtable"));
  });

  // Fail 2
  test("checkdb-PUT: Failed put request", async () => {
    await checkdb
      .CheckUpdated(mockModel, "TestTable", "TestTime", {}, false)
      .catch(err => expect(err).toEqual("Failed to patch to airtable"));
  });

  test("checkdb-PUT: Failed put request foreign keys", async () => {
    const foreignKeys = {
      key1: "TestTable1",
      key2: "TestTable2"
    };

    await checkdb
      .CheckUpdated(mockModel, "TestTable", "TestTime", foreignKeys, false)
      .catch(err => expect(err).toEqual("Failed to patch to airtable"));
  });
});

describe("DELETE fail", () => {
  // Fail 1
  test("checkdb-DELETE: Failed delete reference request", async () => {
    await checkdb
      .CheckDeleted(mockModel, "TestTable", "TestTime", {}, false)
      .catch(err => expect(err).toEqual("Failed to get from airtable"));
  });

  test("checkdb-DELETE: Failed delete reference request foreign keys", async () => {
    const foreignKeys = { key1: "TestTable1", key2: "TestTable2" };

    await checkdb
      .CheckDeleted(mockModel, "TestTable", "TestTime", foreignKeys, false)
      .catch(err => expect(err).toEqual("Failed to get from airtable"));
  });

  test("checkdb-DELETE: Failed delete reference request many to many", async () => {
    const foreignKeys = { key1: "TestTable1", key2: "TestTable2" };

    await checkdb
      .CheckDeleted(mockModel, "TestTable", "TestTime", foreignKeys, true)
      .catch(err => expect(err).toEqual("Failed to get from airtable"));
  });

  // Fail 2
  test("checkdb-DELETE: Failed delete request", async () => {
    await checkdb
      .CheckDeleted(mockModel, "TestTable", "TestTime", {}, false)
      .catch(err => expect(err).toEqual("Failed to delete from airtable"));
  });

  test("checkdb-DELETE: Failed delete request foreign keys", async () => {
    const foreignKeys = { key1: "TestTable1", key2: "TestTable2" };

    await checkdb
      .CheckDeleted(mockModel, "TestTable", "TestTime", foreignKeys, false)
      .catch(err => expect(err).toEqual("Failed to delete from airtable"));
  });

  test("checkdb-DELETE: Failed delete request many to many", async () => {
    const foreignKeys = { key1: "TestTable1", key2: "TestTable2" };

    await checkdb
      .CheckDeleted(mockModel, "TestTable", "TestTime", foreignKeys, true)
      .catch(err => expect(err).toEqual("Failed to patch to airtable"));
  });
});
