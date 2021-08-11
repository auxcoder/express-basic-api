var chance = require('chance').Chance();

exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('todos', function(t) {
      t.increments('id').primary();
      t.string('title');
      t.boolean('completed').defaultTo(false);
      t.datetime('created_at', 6)
        .notNullable()
        .defaultTo(knex.fn.now());
      t.datetime('updated_at', 6)
        .notNullable()
        .defaultTo(knex.fn.now());
    })
    .then(() => {
      return knex
        .table('todos')
        .returning(['title'])
        .insert(genTodos());
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('todos');
};

function genTodos() {
  Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
  var date = new Date();
  return [1, 2, 3, 4, 5].map(() => {
    return {
      title: chance.sentence({ words: 5 }),
      completed: chance.bool({ likelihood: 30 }),
      created_at: date.toISOString(),
      updated_at: date.addDays(5).toISOString(),
    };
  });
}
