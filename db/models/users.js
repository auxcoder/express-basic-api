import Bookshelf from '../bookshelf.js';
import Tokens from './tokens.js';

class Users extends Bookshelf.Model {
  constructor() {
    super();
    this.tableName = 'users';
    this.idAttribute = 'id';
    this.gethidden = ['salt'];
}
  tokens() {
    return this.hasMany('Tokens');
  }
}

/**
 * Find a model based on it's ID
 * @param {String} email The model's email
 * @param {Object} [options] Options used of model.fetch
 * @return {Promise(bookshelf.Model)}
 */
// const findByEmail = {findByEmail: function(email, options) {
//   options = Object.assign({}, options);
//   return this.where('email', email).fetch(options);
// }};

// module
export default Users;
