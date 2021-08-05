var BookshelfParanoia = require('bookshelf-paranoia');
//fixme: make db config dynamic process.env.NODE_ENV
const knex = require('knex')(require('../knexfile')['development']);
const bookshelf = require('bookshelf')(knex);
bookshelf.plugin(BookshelfParanoia, {
  sentinel: 'active',
  nullValue: '0000-00-00 00:00:00',
});

module.exports = bookshelf;
