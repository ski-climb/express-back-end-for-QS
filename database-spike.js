const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

  database.raw('select * from foods')
  .then((data) => {
    console.log(data.rowCount)
    process.exit();
  });

