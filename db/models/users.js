let Bookshelf = require('../bookshelf');
require('./tokens');

var Users = {
  tableName: 'users',
  hidden: ['salt'],
  softDelete: true,
  tokens() {
    return this.hasMany('Tokens');
  },
}

/**
 * Find a model based on it's ID
 * @param {String} email The model's email
 * @param {Object} [options] Options used of model.fetch
 * @return {Promise(bookshelf.Model)}
 */
const findByEmail = {findByEmail: function(email, options) {
  options = Object.assign({}, options);
  return this.where('email', email).fetch(options);
}};

// module
module.exports = Bookshelf.model('Users', Users, findByEmail);
