require("dotenv").config({ path: "../../.env" });
const axios = require("axios");

Airtable = axios.create({
  baseURL: "https://api.airtable.com/v0/" + process.env.AIRTABLE_BASE + "/",
  headers: { Authorization: "Bearer " + process.env.AIRTABLE_SECRET }
});

class AirtableCall {
  static getAirtableIdByCustomField(
    table,
    value,
    customField = "id",
    offset = null,
    fields = ["id"]
  ) {
    let params = {
      params: {
        fields: fields,
        filterByFormula: "{" + customField + "}=" + value
      }
    };

    if (offset != null) {
      params.params = {
        fields: fields,
        offset: offset
      };
    }

    return Airtable.get(table, params)
      .then(async res => {
        if (res.data.offset != null) {
          let records = res.data.records;
          await this.getAirtableIdByCustomField(
            table,
            customField,
            value,
            res.data.offset
          ).then(res2 => {
            res2.forEach(x => records.push(x));
          });
          return records;
        } else {
          return res.data.records;
        }
      })
      .catch(err => {
        return err;
      });
  }

  static getAirtableByAirtableId(table, id) {
    return Airtable.get(table + "/" + id)
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
  }

  static postAirtable(table, data) {
    return Airtable.post(
      table,
      { fields: data },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
  }

  static putAirtable(table, id, data) {
    return Airtable.put(
      table + "/" + id,
      { fields: data },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    )
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
  }

  static deleteAirtable(table, id) {
    return Airtable.delete(table + "/" + id)
      .then(() => {
        return;
      })
      .catch(err => {
        return err;
      });
  }
}

module.exports = AirtableCall;
