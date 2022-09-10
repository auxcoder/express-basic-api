import knex from 'knex';
import knexConfig from '../knexfile.js';

const db = knex(knexConfig[process.env.NODE_ENV || 'develpment']);

function find(model) {
  return db(model);
}

function findById(model, id) {
  return db(model).where({id: Number(id)});
}

function insert(model, object) {
  return db(model).insert(object);
}
