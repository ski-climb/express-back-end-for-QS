const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

function find(id) {
  return database.raw('select * from foods where id=?', [id])
}

function all() {
  return database.raw('select * from foods')
}

function createFood(name, calories, visibility) {
  return database.raw(
      'insert into foods (name, calories, visibility, created_at, updated_at) values (?, ?, ?, ?, ?) returning *',
      [name, calories, visibility, new Date, new Date]
    )
}

function updateFood(id, name, calories, visibility) {
  return database.raw('update foods set name = ?, calories = ?, visibility = ?, updated_at = ? where id=?',
    [name, calories, visibility, new Date, id])
}

function deleteFood(id) {
  return database.raw('delete from foods where id=?', [id])
}

module.exports = {
  find: find,
  all: all,
  createFood: createFood,
  updateFood: updateFood,
  deleteFood: deleteFood
}
