exports.seed = function(knex, Promise) {
  return knex.raw('truncate foods restart identity')
  .then(() => {
    return Promise.all([
      knex.raw(
        'insert into foods (name, calories, visibility, created_at, updated_at) values (?, ?, ?, ?, ?)',
        ['steak sandwich', 543, 'visible', new Date, new Date]
      ),
      knex.raw(
        'insert into foods (name, calories, visibility, created_at, updated_at) values (?, ?, ?, ?, ?)',
        ['crackers', 345, 'hidden', new Date, new Date]
      ),
      knex.raw(
        'insert into foods (name, calories, visibility, created_at, updated_at) values (?, ?, ?, ?, ?)',
        ['pie', 987, 'visible', new Date, new Date]
      )
    ]);
  });
};
