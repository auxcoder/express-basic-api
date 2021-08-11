import jwtSign from '../utils/jwtSign.js';
import constants from '../config/constants.js';

exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('tokens', function(t) {
      t.text('id').primary();
      t.integer('user_id')
        .unsigned()
        .notNullable();
      t.datetime('created_at', 6)
        .notNullable()
        .defaultTo(knex.fn.now());
      t.foreign('user_id')
        .references('id')
        .inTable('users');
    })
    .then(() => {
      return knex.select('id', 'username', 'email', 'role', 'verified').from('users');
    })
    .then(users => {
      return knex
        .table('tokens')
        .returning(['user_id'])
        .insert(genToken(users));
    })
    .catch(error => {
      console.error('migration "tokens" failed: ', error);
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tokens');
};

function genToken(users) {
  return users.map(user => {
    return {
      id: jwtSign(user, 'auth', constants.ttlAuth),
      user_id: user.id,
    };
  });
}
