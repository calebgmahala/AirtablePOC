# Airtable POC

Airtable POC is a application for updating airtable off of a postgress db

---

## Installation

Use npm to install Airtable POC

```bash
npm i -g serverless
npm i
```

## Setup

- ### Configure DB

  Make sure all tables you want to update on airtable have createdat, updatedat, and deleted at fields.

- ### Setting up Sequelize

  - #### Connecting to your db

    Create a .env file and create variables based off of the ones in env.js

  - #### Setting up your schemas

    Make sure paranoid is set to true on you tables schemas

    Set createdat, updatedat, and deletedat as follows
    <br>

    ```js
    createdAt: { type: Sequelize.DATE, field: "createdat" },
    updatedAt: { type: Sequelize.DATE, field: "updatedat" },
    deletedAt: { type: Sequelize.DATE, field: "deletedat" }
    ```

* #### Setting up your export

  Follow the example in index.js and replace sequelizeModels with the names of your schema files
  <br>
  Change the foreign key connections to fit your database structure
  <br>
  Change the tables export to fit the data that you want to have updated in airtable. (Instructions are listed in the file)
  (Note: if you want a many to many table to show in airtable do not set `isManyToMany = true`)

* #### Pulling in the sequelize export

  Add the line blow to gain access to the sequelize object

  ```js
  const sequelizeModels = require(<path to index file>);
  ```

* ### Setting up Airtable

  It is recommended that a superuser be made and the base be shared (read only) to the account you wish to view it on.
  <br>
  Edit the .env file you created and add airtable connection variables based on the env.js file.

  - #### Creating tables

    Tables need to be named **exactly** as they are in your tables export (this is found in your sequelize index file)

    (Note: if one of your tables is marked `isManyToMany` in your schema do not add it to airtable. Instead, make linked fields on those tables.)

  - #### Creating fields

    Fields need to be named **exactly** as they are in your sequelize schemas
    <br>
    (if you want to have a different airtable field edit your schema like so)
    <br>

    ```js
    <airtable field>: {field: <db field> }
    ```

    Linked fields **must** be linked to the proper fields in airtable.

    (Note: I recommend turning on multiple linking)

  - #### Shareing
    **HIGHLY RECOMMENDED**
    Share the base (read only) with the account you wish to use

- ### Other
  If you want to set the timeing for the lambda runs, edit the schedule in `serverless.yml` and the `lastRun` variable in the updateAirtable `handler.js`

## Running

To run local:

```bash
sls invoke local -f updateAirtable
```

To push to aws:
(Note: extra setup may be required if you are not connected to your aws. If you need help visit [serverless](https://serverless.com/) or [aws](https://aws.amazon.com/))

```bash
sls deploy
```
