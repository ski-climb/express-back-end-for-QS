exports.up = function(knex, Promise) {
  let createQuery = `create table foods(
    id serial primary key not null,
    name text,
    calories int,
    visibility text,
    created_at timestamp,
    updated_at timestamp
  )`;
  return knex.raw(createQuery);
};

exports.down = function(knex, Promise) {
  let createQuery = `drop table foods`;
  return knex.raw(createQuery);
};
