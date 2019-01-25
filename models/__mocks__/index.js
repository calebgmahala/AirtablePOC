module.exports = {
  tables: {
    TestModule1: {
      table: "TestTable1",
      keys: { key1: "TestKeyTable1", key2: "TestKeyTable2" }
    },
    TestModule2: {
      table: "TestTable2",
      keys: {}
    }
  },
  TestModule1: jest.fn(),
  TestModule2: jest.fn()
};
