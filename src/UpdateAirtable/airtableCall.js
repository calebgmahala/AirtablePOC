require("dotenv").config({ path: "../../.env" });
const axios = require("axios");
const Bottleneck = require("bottleneck");

const limiter = new Bottleneck({
  minTime: 200
});

Airtable = axios.create({
  baseURL: "https://api.airtable.com/v0/" + process.env.AIRTABLE_BASE + "/",
  headers: { Authorization: "Bearer " + process.env.AIRTABLE_SECRET }
});

// Axios Degubber, uncomment the function below
// Airtable.interceptors.request.use(request => {
//   console.log("Starting Request", request);
//   return request;
// });

class AirtableCall {
  static getAirtableIdByCustomField(
    table,
    value,
    customField = "id",
    offset = null, // Used for pagination
    fields = ["id"]
  ) {
    // Params used to query by custom field
    let params = {
      params: {
        fields: fields,
        filterByFormula: "{" + customField + "}=" + value
      }
    };

    // Used for pagination
    if (offset != null) {
      params.params = {
        fields: fields,
        offset: offset
      };
    }

    return limiter
      .schedule(() => Airtable.get(table, params))
      .then(async res => {
        // If there is an offset, re-call this function with the offset param
        if (res.data.offset != null) {
          let records = res.data.records;
          await limiter
            .schedule(() =>
              this.getAirtableIdByCustomField(
                table,
                customField,
                value,
                res.data.offset
              )
            )
            .then(res2 => {
              // Add all records to to higher scope variable
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
    return limiter
      .schedule(Airtable.get(table + "/" + id))
      .then(res => {
        return res;
      })
      .catch(err => {
        throw err;
      });
  }

  static postAirtable(table, data) {
    return limiter
      .schedule(() =>
        Airtable.post(
          table,
          { fields: data },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        )
      )
      .then(res => {
        return res;
      })
      .catch(err => {
        throw err;
      });
  }

  static putAirtable(table, id, data) {
    return limiter
      .schedule(() =>
        Airtable.put(
          table + "/" + id,
          { fields: data },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        )
      )
      .then(res => {
        return res;
      })
      .catch(err => {
        throw err;
      });
  }

  static patchAirtable(table, id, data) {
    return limiter
      .schedule(() =>
        Airtable.patch(
          table + "/" + id,
          { fields: data },
          {
            headers: {
              "Content-Type": "application/json"
            }
          }
        )
      )
      .then(res => {
        return res;
      })
      .catch(err => {
        throw err;
      });
  }

  static deleteAirtable(table, id) {
    return limiter
      .schedule(() => Airtable.delete(table + "/" + id))
      .then(() => {
        return;
      })
      .catch(err => {
        throw err;
      });
  }
}

module.exports = AirtableCall;
