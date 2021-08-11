import knex from 'knex';
import bookshelf from 'bookshelf';
import BookshelfParanoia from 'bookshelf-paranoia';
import knexConfig from '../knexfile.js';
const Bookshelf = bookshelf(knex(knexConfig[process.env.NODE_ENV || 'development']));

Bookshelf.plugin(BookshelfParanoia, {
  sentinel: 'active',
  nullValue: '0000-00-00 00:00:00',
});

export default Bookshelf;
