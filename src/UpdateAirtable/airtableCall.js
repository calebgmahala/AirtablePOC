// const axios = require("axios");
const axiosInstance = require("../../axios");

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

    return axiosInstance.airtable
      .get(table, params)
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
    return axiosInstance.airtable
      .get(table + "/" + id)
      .then(res => {
        return res;
      })
      .catch(err => {
        return err;
      });
  }

  static postAirtable(table, data) {
    return axiosInstance.airtable
      .post(
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
    return axiosInstance.airtable
      .put(
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
    return axiosInstance.airtable
      .delete(table + "/" + id)
      .then(() => {
        return;
      })
      .catch(err => {
        return err;
      });
  }
}

module.exports = AirtableCall;
