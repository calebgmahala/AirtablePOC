const handler = require("./handler");
const checkdb = require("./checkdb");
const Models = require("../../models/index");

jest.mock("./checkdb.js");
jest.mock("../../models/index");

test("handler: POST to Airtable", async () => {
  await handler.updateAirtable();
  Object.keys(Models.tables).forEach((data, index) => {
    expect(checkdb.CheckNew.mock.calls[index]).toContain(
      Models[data],
      Models.tables[data]
    );
  });
});
