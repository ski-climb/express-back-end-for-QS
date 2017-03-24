const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

  database.raw('update foods set name = ?, calories = ?, visibility = ?, updated_at = ? where id=?',
    ['cat', 22, 'hidden', new Date, 1])
  .then((data) => {
    console.log(data)
    process.exit();
  });

