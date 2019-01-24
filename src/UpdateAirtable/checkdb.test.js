const checkdb = require("./checkdb");
const Sinon = require("sinon");

jest.mock("airtable");
const stubCall = Sinon.stub("airtable", "base");

const mockModel = {
  findAll: Sinon.fake.returns({
    dataValues: {
      id: 1,
      name: "TestName",
      image: "TestImage",
      createdAt: "TestDate",
      updatedAt: "TestDate"
    }
  })
};

test("UpdateAirtable: Add to Airtable", async () => {
  await checkdb.CheckNew(mockModel, "TestTable", "TestTime");
});
