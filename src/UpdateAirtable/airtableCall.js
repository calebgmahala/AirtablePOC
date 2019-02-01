require("dotenv").config({ path: "../../.env" });
const axios = require("axios");
const Bottleneck = require("bottleneck");

// Limits requests to 5 per second
const limiter = new Bottleneck({
  minTime: 200
});

Airtable = axios.create({
  baseURL: "https://api.airtable.com/v0/" + process.env.AIRTABLE_BASE + "/",
  headers: {
    Authorization: "Bearer " + process.env.AIRTABLE_SECRET,
    "Content-Type": "application/json"
  }
});

// Axios Debuger, uncomment the function below
// Airtable.interceptors.request.use(request => {
//   console.log("Starting Request", request);
//   return request;
// });

const handleError = err => {
  throw err;
};

module.exports.getAirtableByCustomField = (
  table,
  value,
  customField = "id",
  offset = null // Used for pagination
) => {
  // Params used to query by custom field
  let params = {
    params: {
      filterByFormula: "{" + customField + "}=" + value
    }
  };

  // Used for pagination
  if (offset != null) {
    params.params = {
      offset: offset
    };
  }
  // Callback function used to paginate and add to response object
  const getAirtableCallback = async records => {
    await limiter
      .schedule(() =>
        this.getAirtableIdByCustomField(
          table,
          value,
          customField,
          res.data.offset
        )
      )
      .then(res => {
        // Add all records to to higher scope variable
        res.forEach(x => records.push(x));
      });
  };

  return limiter
    .schedule(() => Airtable.get(table, params))
    .then(async res => {
      // If there is an offset, re-call this function with the offset param
      if (res.data.offset != null) {
        await getAirtableCallback(res.data.records);
        return res.data.records;
      } else {
        return res.data.records;
      }
    })
    .catch(err => handleError(err));
};

module.exports.postAirtable = (table, data) => {
  return limiter
    .schedule(() => Airtable.post(table, { fields: data }))
    .then(res => {
      return res;
    })
    .catch(err => handleError(err));
};

module.exports.patchAirtable = (table, id, data) => {
  return limiter
    .schedule(() => Airtable.patch(table + "/" + id, { fields: data }))
    .then(res => {
      return res;
    })
    .catch(err => handleError(err));
};

module.exports.deleteAirtable = (table, id) => {
  return limiter
    .schedule(() => Airtable.delete(table + "/" + id))
    .then(() => {
      return;
    })
    .catch(err => handleError(err));
};
